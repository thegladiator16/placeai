'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { Mic2 } from 'lucide-react';
import { InterviewStart } from '@/components/interview/interview-start';

export default function InterviewsPage() {
  const [completedId, setCompletedId] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Interview Prep</h1>
        </div>
        <p className="text-muted-foreground">Role-specific mock interviews with AI feedback. Tailored for Indian tech companies.</p>
      </div>

      {completedId ? (
        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
          <p className="text-muted-foreground">Session <code className="text-xs bg-background px-1.5 py-0.5 rounded">{completedId}</code> submitted.</p>
          <button
            onClick={() => setCompletedId(null)}
            className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Start Another Session
          </button>
        </div>
      ) : (
        <InterviewStart onComplete={setCompletedId} />
      )}
    </div>
  );
}
