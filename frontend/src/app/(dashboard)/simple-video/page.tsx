"use client"

import React, { useState } from "react"
import { AppShell } from '@/components/layout/AppShell'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Video, Download, Play, Wand2 } from "lucide-react"

export default function SimpleVideoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setVideoUrl(null)

    try {
      const response = await fetch('/api/simple-video/generate', {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Generate video response:', data)

      // Simulate generation process based on response
      setTimeout(() => {
        setIsGenerating(false)
        // Placeholder video URL for demonstration
        setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4")
      }, 3000)
    } catch (error) {
      console.error('Failed to generate video:', error)
      setIsGenerating(false)
    }
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Explainer Video Generator</h1>
              <p className="text-muted-foreground mt-2">
                Generate educational explainer videos with synchronized voiceovers and AI-generated images.
              </p>
            </div>
            <Video className="h-10 w-10 text-primary opacity-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Settings</CardTitle>
                  <CardDescription>Configure the style, voice, and content for your explainer video.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="space-y-2">
                    <Label htmlFor="knowledge-base">Knowledge Base Project</Label>
                    <Select defaultValue="project1">
                      <SelectTrigger id="knowledge-base">
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project1">Physics 101 Research</SelectItem>
                        <SelectItem value="project2">History of Rome</SelectItem>
                        <SelectItem value="project3">Biology Notes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The AI will use context from this project to write the script.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Topic / Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g. Explain quantum entanglement to a high school student using simple analogies..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-style">Visual Style</Label>
                      <Select defaultValue="whiteboard">
                        <SelectTrigger id="video-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whiteboard">Paper / Whiteboard</SelectItem>
                          <SelectItem value="minimalist">Minimalist Vector</SelectItem>
                          <SelectItem value="photorealistic">Photorealistic</SelectItem>
                          <SelectItem value="3d">3D Render</SelectItem>
                          <SelectItem value="watercolor">Watercolor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-source">Image Source</Label>
                      <Select defaultValue="nano-banana-pro">
                        <SelectTrigger id="image-source">
                          <SelectValue placeholder="Select image source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nano-banana-pro">Nano Banana Pro (Imagen 3)</SelectItem>
                          <SelectItem value="nano-banana-2">Nano Banana 2 (Imagen 2)</SelectItem>
                          <SelectItem value="web-search">Web Image Search</SelectItem>
                          <SelectItem value="hybrid">Hybrid (Generate + Search)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tts-model">Voiceover (TTS Model)</Label>
                    <Select defaultValue="elevenlabs">
                      <SelectTrigger id="tts-model">
                        <SelectValue placeholder="Select voice model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elevenlabs">ElevenLabs (High Quality)</SelectItem>
                        <SelectItem value="google">Google Cloud TTS</SelectItem>
                        <SelectItem value="openai">OpenAI TTS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Explainer Video...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate Video
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your generated explainer video will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-md border border-dashed m-6 mt-0 relative">
                  {isGenerating ? (
                    <div className="flex flex-col items-center space-y-4 text-muted-foreground text-center px-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <div className="space-y-2">
                        <p className="font-medium">1. Analyzing knowledge base & writing script...</p>
                        <p className="text-sm opacity-70">2. Synthesizing voiceover audio...</p>
                        <p className="text-sm opacity-70">3. Generating contextual illustrations...</p>
                        <p className="text-sm opacity-70">4. Synchronizing and compiling mp4...</p>
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <div className="w-full h-full flex flex-col absolute inset-0">
                      <video
                        controls
                        className="w-full h-full object-contain bg-black rounded-md"
                        src={videoUrl}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                      <Video className="h-12 w-12 opacity-20" />
                      <p>No video generated yet.</p>
                      <p className="text-sm text-center max-w-[250px] opacity-70">
                        Fill out the configuration and click generate to create your first explainer video.
                      </p>
                    </div>
                  )}
                </CardContent>
                {videoUrl && !isGenerating && (
                  <CardFooter className="flex justify-between border-t pt-6 bg-muted/10">
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                    <Button size="sm" asChild>
                      <a href={videoUrl} download="explainer-video.mp4">
                        <Download className="mr-2 h-4 w-4" />
                        Download MP4
                      </a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
