'use client';

import { CheckCircle2, Star, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { InterviewSession, InterviewQuestion, InterviewAnswer } from '@placeai/db';

type Props = { session: InterviewSession };

function scoreColor(score: number) {
  if (score >= 80) return 'text-accent';
  if (score >= 60) return 'text-brand';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-400';
}

export function InterviewSummary({ session }: Props) {
  const questions = (session.questions ?? []) as InterviewQuestion[];
  const answers = (session.answers ?? {}) as Record<string, InterviewAnswer>;
  const avgScore = session.averageScore ? Number(session.averageScore) : 0;

  // Build radar data from question types
  const typeCounts: Record<string, { total: number; score: number }> = {};
  for (const q of questions) {
    const ans = answers[q.id];
    const type = q.type === 'behavioral' ? 'Behavioral'
      : q.type === 'technical' ? 'Technical'
      : q.type === 'company_specific' ? 'Company'
      : 'HR';
    if (!typeCounts[type]) typeCounts[type] = { total: 0, score: 0 };
    typeCounts[type].total++;
    if (ans?.score !== undefined) typeCounts[type].score += ans.score;
  }

  const radarData = Object.entries(typeCounts).map(([name, { total, score }]) => ({
    subject: name,
    score: total > 0 ? Math.round(score / total) : 50,
    fullMark: 100,
  }));

  // Add default dimensions if sparse
  const DEFAULT_DIMS = ['Clarity', 'Structure', 'Examples'];
  if (radarData.length < 3) {
    DEFAULT_DIMS.slice(0, 3 - radarData.length).forEach((d) =>
      radarData.push({ subject: d, score: avgScore > 0 ? Math.round(avgScore * 0.9) : 60, fullMark: 100 }),
    );
  }

  const strengths = (session.strengths ?? []) as string[];
  const improvements = (session.improvements ?? []) as string[];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/interviews" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Interview Prep
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Session Complete</h1>
          <p className="text-muted-foreground">
            {session.companyName ? `${session.companyName} · ` : ''}{session.roleName ?? session.sessionType} · {questions.length} questions
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-4xl font-bold ${scoreColor(avgScore)}`}>{avgScore > 0 ? `${Math.round(avgScore)}%` : '—'}</div>
          <div className="text-xs text-muted-foreground">overall score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-medium text-foreground mb-4">Performance Breakdown</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--brand))"
                  fill="hsl(var(--brand))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: number) => [`${val}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No score data yet</div>
          )}
        </div>

        {/* Strengths & improvements */}
        <div className="space-y-4">
          {strengths.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-accent" />Strengths</p>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand" />Areas to Improve</p>
              <ul className="space-y-1.5">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {session.overallFeedback && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-2">Overall Feedback</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{session.overallFeedback}</p>
            </div>
          )}
        </div>
      </div>

      {/* Per-question breakdown */}
      {questions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Question-by-Question Feedback</p>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const score = ans?.score ?? null;
              return (
                <div key={q.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand capitalize">{q.type.replace('_', ' ')}</span>
                        {q.difficulty && <span className="text-xs text-muted-foreground capitalize">{q.difficulty}</span>}
                      </div>
                      <p className="text-sm font-medium text-foreground">Q{i + 1}: {q.question}</p>
                    </div>
                    {score !== null && (
                      <div className={`text-lg font-bold ${scoreColor(score)} flex-shrink-0`}>{score}%</div>
                    )}
                  </div>
                  {ans?.answerText && (
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Your answer</p>
                      <p className="text-sm text-foreground leading-relaxed">{ans.answerText}</p>
                    </div>
                  )}
                  {ans?.aiFeedback && (
                    <div className="border-l-2 border-brand/30 pl-3">
                      <p className="text-xs text-brand font-medium mb-0.5">AI Feedback</p>
                      <p className="text-sm text-muted-foreground">{ans.aiFeedback}</p>
                    </div>
                  )}
                  {(ans?.improvementTips ?? []).length > 0 && (
                    <ul className="space-y-1">
                      {(ans?.improvementTips ?? []).map((tip, ti) => (
                        <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-yellow-500 mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/interviews"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors text-sm"
        >
          Start Another Session
        </Link>
      </div>
    </div>
  );
}
