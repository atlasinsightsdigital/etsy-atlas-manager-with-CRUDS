'use client';

import React, { useState, useTransition } from 'react';
import { generateDashboardSummary, type GenerateDashboardSummaryInput } from '@/ai/flows/generate-dashboard-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle } from '../ui/alert';

export default function AiSummary(props: GenerateDashboardSummaryInput) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = () => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await generateDashboardSummary(props);
        setSummary(result.summary);
      } catch (e) {
        setError('Failed to generate summary. Please try again.');
        console.error(e);
      }
    });
  };

  return (
    <Card className="bg-card/80 shadow-md">
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Get a quick, AI-generated summary of your performance.
          </CardDescription>
        </div>
        <Button onClick={handleGenerateSummary} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{error}</AlertTitle>
            </Alert>
        )}
        {summary && !isPending && (
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-background/50 p-4">
            <p>{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
