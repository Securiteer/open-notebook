'use client'

import { Card } from '@/components/ui/card'
import { Bot, Terminal, Play, Power, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function MulticaPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/multica/status')
      const data = await res.json()
      if (data.status === 'success') {
        setStatus('Running')
        setIsRunning(true)
      } else {
        setStatus('Stopped')
        setIsRunning(false)
      }
    } catch (_) {
      setStatus('Error checking status')
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleInstall = async () => {
    setIsLoading(true)
    setOutput(prev => [...prev, '$ curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash'])
    try {
      const res = await fetch('/api/multica/install', { method: 'POST' })
      const data = await res.json()
      setOutput(prev => [...prev, data.message || data.output || 'Installation completed'])
    } catch (_) {
      setOutput(prev => [...prev, 'Error during installation'])
    }
    setIsLoading(false)
  }

  const handleStart = async () => {
    setIsLoading(true)
    setOutput(prev => [...prev, '$ multica daemon start'])
    try {
      const res = await fetch('/api/multica/start', { method: 'POST' })
      const data = await res.json()
      setOutput(prev => [...prev, data.message || data.output || 'Started daemon'])
      checkStatus()
    } catch (_) {
      setOutput(prev => [...prev, 'Error starting daemon'])
    }
    setIsLoading(false)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Multica Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleInstall} disabled={isLoading} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
          <Button onClick={handleStart} disabled={isLoading || isRunning}>
            <Power className="mr-2 h-4 w-4" />
            Start Daemon
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium leading-none">Daemon Status</p>
              <p className="text-2xl font-bold">{status}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Terminal className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium leading-none">Runtimes</p>
              <p className="text-2xl font-bold">{isRunning ? '1' : '0'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold">Terminal Output</h3>
            <div className="flex-1 rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-50 min-h-[400px] overflow-y-auto">
              {output.map((line, i) => (
                <div key={i} className={line.startsWith('$') ? 'text-zinc-400' : 'text-green-400 whitespace-pre-wrap'}>
                  {line}
                </div>
              ))}
              {output.length === 0 && (
                <div className="text-zinc-500 italic">No output yet...</div>
              )}
            </div>
          </div>
        </Card>

        <Card className="col-span-3 p-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold">Active Issues</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <Play className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Wait for assignment</p>
                    <p className="text-sm text-muted-foreground">Assigned to: System</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
