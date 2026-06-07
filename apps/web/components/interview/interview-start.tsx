'use client';

import { useState } from 'react';
import { Mic2, Brain, Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { InterviewSession, InterviewQuestion } from '@placeai/db';

type StartForm = {
  sessionType: 'behavioral' | 'technical' | 'mixed' | 'hr';
  companyName: string;
  roleName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
};

type AnswerMap = Record<string, string>;

type Props = {
  onComplete: (sessionId: string) => void;
};

export function InterviewStart({ onComplete }: Props) {
  const [phase, setPhase] = useState<'setup' | 'session' | 'complete'>('setup');
  const [form, setForm] = useState<StartForm>({
    sessionType: 'mixed',
    companyName: '',
    roleName: '',
    difficulty: 'medium',
    questionCount: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json() as { success: boolean; data?: InterviewSession; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Failed to start session');
      setSession(json.data);
      setPhase('session');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session) return;
    const questions = session.questions as InterviewQuestion[];
    const q = questions[currentIdx];
    if (!q) return;

    const answer = answers[q.id] ?? '';
    if (!answer.trim()) return;

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // Submit all answers
      setSubmitting(true);
      await fetch(`/api/v1/interview/${session.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      setSubmitting(false);
      setPhase('complete');
      onComplete(session.id);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h2 className="font-semibold text-foreground mb-3">Session Type</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['behavioral', 'technical', 'mixed', 'hr'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setForm((f) => ({ ...f, sessionType: type }))}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.sessionType === type
                    ? 'bg-brand/10 border-brand text-brand'
                    : 'bg-card border-border text-muted-foreground hover:border-brand/50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Company (optional)</label>
            <input
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="e.g. Zepto, CRED"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Role (optional)</label>
            <input
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
              placeholder="e.g. SDE-2, PM"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as StartForm['difficulty'] }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Questions: {form.questionCount}</label>
            <input
              type="range" min={3} max={15} value={form.questionCount}
              onChange={(e) => setForm((f) => ({ ...f, questionCount: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={() => void startSession()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {loading ? 'Generating Questions…' : 'Start Interview'}
        </button>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Session Complete!</h2>
        <p className="text-muted-foreground">Your answers are being analyzed. Results will appear shortly.</p>
      </div>
    );
  }

  if (!session) return null;
  const questions = session.questions as InterviewQuestion[];
  const currentQ = questions[currentIdx];
  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {currentIdx + 1} of {questions.length}
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < currentIdx ? 'bg-accent' : i === currentIdx ? 'bg-brand' : 'bg-border'}`} />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            currentQ.type === 'technical' ? 'bg-purple-400/20 text-purple-400' :
            currentQ.type === 'behavioral' ? 'bg-blue-400/20 text-blue-400' :
            'bg-yellow-400/20 text-yellow-400'
          }`}>
            {currentIdx + 1}
          </div>
          <p className="text-foreground font-medium leading-relaxed">{currentQ.question}</p>
        </div>

        <textarea
          value={answers[currentQ.id] ?? ''}
          onChange={(e) => setAnswers((a) => ({ ...a, [currentQ.id]: e.target.value }))}
          placeholder="Type your answer here… Be specific and use examples from your experience."
          rows={6}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand resize-none"
        />

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => void submitAnswer()}
            disabled={!answers[currentQ.id]?.trim() || submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {currentIdx < questions.length - 1 ? (
              <><span>Next</span><ChevronRight className="w-4 h-4" /></>
            ) : (
              <span>Submit All</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
