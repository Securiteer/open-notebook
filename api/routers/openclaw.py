import asyncio
import fcntl
import os
import pty
import shlex
import struct
import termios

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

router = APIRouter()


@router.websocket("/openclaw/ws")
async def openclaw_terminal(websocket: WebSocket):
    await websocket.accept()

    # Fork a new PTY
    pid, fd = pty.fork()

    if pid == 0:
        # Child process - run bash
        # We set an env variable so the shell knows it's an openclaw session
        os.environ["OPENCLAW_SESSION"] = "1"
        os.environ["TERM"] = "xterm-256color"

        # Start bash
        os.execvp("bash", ["bash", "--login"])
    else:
        # Parent process - relay between WebSocket and PTY
        logger.info(f"Started OpenClaw terminal session (PID: {pid})")

        # We need non-blocking reading from the PTY
        flags = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)

        async def read_from_pty():
            while True:
                try:
                    # Yield to event loop
                    await asyncio.sleep(0.01)
                    try:
                        data = os.read(fd, 4096)
                        if not data:
                            logger.info("PTY closed")
                            break
                        # Send to websocket
                        await websocket.send_bytes(data)
                    except BlockingIOError:
                        # No data available right now
                        pass
                    except OSError as e:
                        logger.warning(f"OS Error reading PTY: {e}")
                        break
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Error reading from PTY: {e}")
                    break

        async def read_from_ws():
            while True:
                try:
                    data = await websocket.receive_text()

                    # Check if it's a resize command
                    if data.startswith('{"type":"resize"'):
                        try:
                            import json

                            msg = json.loads(data)
                            cols = msg.get("cols", 80)
                            rows = msg.get("rows", 24)
                            # Set terminal size
                            winsize = struct.pack("HHHH", rows, cols, 0, 0)
                            fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
                        except Exception as e:
                            logger.error(f"Error resizing PTY: {e}")
                    else:
                        # It's normal input, write to PTY
                        os.write(fd, data.encode("utf-8"))
                except WebSocketDisconnect:
                    logger.info("WebSocket disconnected")
                    break
                except Exception as e:
                    logger.error(f"Error reading from WebSocket: {e}")
                    break

        # Run both tasks concurrently
        task_pty = asyncio.create_task(read_from_pty())
        task_ws = asyncio.create_task(read_from_ws())

        done, pending = await asyncio.wait(
            [task_pty, task_ws], return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel the pending task
        for task in pending:
            task.cancel()

        # Clean up process
        try:
            os.kill(pid, 9)
            os.waitpid(pid, 0)
            os.close(fd)
        except Exception as e:
            logger.error(f"Error cleaning up PTY: {e}")

        logger.info(f"Closed OpenClaw terminal session (PID: {pid})")
