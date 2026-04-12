'use client'

import { Card } from '@/components/ui/card'
import { Bot, Terminal, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MulticaPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Multica Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium leading-none">Active Agents</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Terminal className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium leading-none">Runtimes</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold">Terminal Output</h3>
            <div className="flex-1 rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-50 min-h-[400px]">
              <div className="text-zinc-400">$ multica daemon start</div>
              <div className="text-green-400">Starting Multica daemon...</div>
              <div className="text-green-400">Connected to workspace!</div>
              <div className="text-zinc-400 mt-2">Waiting for tasks...</div>
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
                    <p className="text-sm font-medium">Implement authentication</p>
                    <p className="text-sm text-muted-foreground">Assigned to: CodeBot</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
