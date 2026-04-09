"use client";

import React, { useState, useEffect } from "react";
import { podcastClonerApi, JobStatusResponse } from "@/lib/api/podcast-cloner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";

export default function PodcastClonerPage() {
  const { t } = useTranslation();
  const [podcastName, setPodcastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobId && (!jobStatus || (jobStatus.status !== "completed" && jobStatus.status !== "failed"))) {
      intervalId = setInterval(async () => {
        try {
          const status = await podcastClonerApi.getJobStatus(jobId);
          setJobStatus(status);
        } catch (err: any) {
          console.error("Failed to check job status", err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, jobStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const response = await podcastClonerApi.submitJob({
        podcast_name: podcastName,
        num_episodes: 10,
      });
      setJobId(response.job_id);
    } catch (err: any) {
      setError(err.message || "Failed to start cloning process");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Podcast Cloner</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Clone a Podcast Style</CardTitle>
          <CardDescription>
            Enter a podcast name. We'll find it, transcribe the latest 10 episodes, extract the voice profiles, and generate a style prompt to perfectly recreate its vibe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={podcastName}
              onChange={(e) => setPodcastName(e.target.value)}
              placeholder="e.g. The Joe Rogan Experience"
              disabled={isSubmitting || (jobStatus?.status === 'processing')}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!podcastName.trim() || isSubmitting || (jobStatus?.status === 'processing')}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : "Clone Podcast"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {jobId && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            {!jobStatus || jobStatus.status === "pending" || jobStatus.status === "processing" ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-muted-foreground animate-pulse">
                  Analyzing podcast structure, extracting voices, and creating style profile...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This process might take several minutes.
                </p>
              </div>
            ) : jobStatus.status === "failed" ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Job Failed</AlertTitle>
                <AlertDescription>
                  {jobStatus.error_message || jobStatus.result?.error_message || "An unknown error occurred"}
                </AlertDescription>
              </Alert>
            ) : jobStatus.status === "completed" && jobStatus.result?.success ? (
              <div className="space-y-6">
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Podcast successfully cloned in {jobStatus.result.processing_time.toFixed(1)}s!
                    Profiles have been saved to the database.
                  </AlertDescription>
                </Alert>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Generated Style Prompt</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(jobStatus.result!.style_prompt!)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={jobStatus.result.style_prompt}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Episode Profile ID</h4>
                    <p className="font-mono text-sm">{jobStatus.result.episode_profile_id}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Speaker Profile ID</h4>
                    <p className="font-mono text-sm">{jobStatus.result.speaker_profile_id}</p>
                  </div>
                </div>
              </div>
            ) : (
               <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unexpected job state or result.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
