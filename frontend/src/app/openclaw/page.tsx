'use client'

import React, { useState } from 'react'
import { Terminal as TerminalIcon, LayoutDashboard, Settings } from 'lucide-react'
import Terminal from '@/components/openclaw/Terminal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function OpenClawPage() {
  const [view, setView] = useState<'terminal' | 'dashboard'>('terminal')
  const [dashboardUrl, setDashboardUrl] = useState('http://localhost:3000')

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">OpenClaw</span>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={view === 'terminal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('terminal')}
            className="flex gap-2"
          >
            <TerminalIcon size={16} />
            Terminal
          </Button>
          <Button
            variant={view === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('dashboard')}
            className="flex gap-2"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Button>
        </div>

        <div>
          {view === 'dashboard' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dashboard Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the URL for the local dashboard
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={dashboardUrl}
                      onChange={(e) => setDashboardUrl(e.target.value)}
                      placeholder="http://localhost:3000"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'terminal' ? (
          <div className="absolute inset-0">
            <Terminal />
          </div>
        ) : (
          <div className="absolute inset-0 bg-white">
            <iframe
              src={dashboardUrl}
              className="w-full h-full border-none"
              title="OpenClaw Dashboard"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}
      </div>
    </div>
  )
}
