'use client'

import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#f0f0f0',
      },
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)

    // Slight delay to ensure DOM is ready for measuring
    setTimeout(() => {
      fitAddon.fit()
    }, 10)

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    // In dev mode Next.js proxies API requests or we connect directly
    const wsUrl = process.env.NODE_ENV === 'development'
      ? `ws://localhost:5055/api/openclaw/ws`
      : `${protocol}//${host}/api/openclaw/ws`

    // Connect WebSocket
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Send initial resize
      const cols = term.cols
      const rows = term.rows
      ws.send(JSON.stringify({ type: 'resize', cols, rows }))
    }

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const text = await event.data.text()
        term.write(text)
      } else {
        term.write(event.data)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error)
      term.write('\r\n\x1b[31m[WebSocket Error] Connection failed.\x1b[0m\r\n')
    }

    ws.onclose = () => {
      term.write('\r\n\x1b[33m[Connection closed]\x1b[0m\r\n')
    }

    // Handle user input
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })

    // Handle resize
    const handleResize = () => {
      fitAddon.fit()
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows
        }))
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
      term.dispose()
    }
  }, [])

  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-[#1e1e1e] p-2 overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  )
}
