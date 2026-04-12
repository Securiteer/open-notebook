'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function DeepTutorPage() {
  const [status, setStatus] = useState<'loading' | 'stopped' | 'running'>('loading')
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/deeptutor/status')
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json()
      setStatus(data.status)
      setSandboxUrl(data.url)
    } catch (err) {
      console.error(err)
      setError('Could not check sandbox status.')
      setStatus('stopped')
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleStart = async () => {
    setIsStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/deeptutor/start', { method: 'POST' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to start sandbox')
      }
      const data = await res.json()
      setStatus('running')
      setSandboxUrl(data.url)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    setIsStopping(true)
    setError(null)
    try {
      const res = await fetch('/api/deeptutor/stop', { method: 'POST' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to stop sandbox')
      }
      setStatus('stopped')
      setSandboxUrl(null)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setIsStopping(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] w-full">
      <div className="flex justify-between items-center p-4 bg-background border-b">
        <h1 className="text-2xl font-bold">DeepTutor Sandbox</h1>

        {status === 'running' ? (
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
          >
            {isStopping ? 'Stopping...' : 'Stop Sandbox'}
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isStarting ? 'Starting...' : 'Start Sandbox'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 m-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
          {error}
        </div>
      )}

      {status === 'running' && sandboxUrl ? (
        <iframe
          src={sandboxUrl}
          className="flex-1 w-full border-none bg-white"
          title="DeepTutor Instance"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/20">
          <h2 className="text-xl font-semibold mb-2">Your Personal DeepTutor Instance</h2>
          <p className="text-muted-foreground max-w-md">
            Start your personal sandbox to use DeepTutor. Your data and settings are saved individually to your account so you can pick up where you left off. Note that startup may take a few moments the first time as the Docker container is created.
          </p>
        </div>
      )}
    </div>
  )
}
