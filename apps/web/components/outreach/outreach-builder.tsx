'use client';

import { useState } from 'react';
import { Send, Loader2, Copy, CheckCircle, MessageSquare, Mail, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type OutreachSequence = {
  step1: string;
  step2: string;
  step3: string;
};

type Props = { userName: string };

export function OutreachBuilder({ userName }: Props) {
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterTitle, setRecruiterTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [channel, setChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [sequence, setSequence] = useState<OutreachSequence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!companyName.trim() || !jobTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterName: recruiterName || undefined,
          recruiterTitle: recruiterTitle || undefined,
          companyName,
          jobTitle,
          channel,
        }),
      });
      const json = await res.json() as { success: boolean; data?: OutreachSequence; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Generation failed');
      setSequence(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const STEPS = sequence
    ? [
        { key: 'step1', label: 'Step 1 — First Outreach', sublabel: 'Send immediately', text: sequence.step1 },
        { key: 'step2', label: 'Step 2 — Follow-up', sublabel: '4–5 days later if no reply', text: sequence.step2 },
        { key: 'step3', label: 'Step 3 — Final Follow-up', sublabel: '7 days after step 2', text: sequence.step3 },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Recruiter Outreach Builder</h1>
          <p className="text-sm text-muted-foreground">Generate a 3-step sequence to land that first conversation</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Company *</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Zepto" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Role *</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Recruiter Name (optional)</label>
            <input value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="Priya Sharma" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Recruiter Title (optional)</label>
            <input value={recruiterTitle} onChange={(e) => setRecruiterTitle(e.target.value)} placeholder="Senior Talent Acquisition" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
        </div>

        {/* Channel toggle */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Channel</label>
          <div className="flex gap-2 w-fit">
            <button onClick={() => setChannel('linkedin')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${channel === 'linkedin' ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              <MessageSquare className="w-4 h-4" />LinkedIn
            </button>
            <button onClick={() => setChannel('email')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${channel === 'email' ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              <Mail className="w-4 h-4" />Email
            </button>
          </div>
        </div>

        <button
          onClick={() => void generate()}
          disabled={loading || !companyName.trim() || !jobTitle.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate Sequence'}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Sequence output */}
      <AnimatePresence>
        {sequence && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {STEPS.map(({ key, label, sublabel, text }, i) => (
              <div key={key} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sublabel}</p>
                    </div>
                  </div>
                  <button onClick={() => void copy(text, key)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {copied === key ? <CheckCircle className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setSequence((prev) => prev ? { ...prev, [key]: e.target.value } : prev);
                  }}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-brand font-mono"
                />
                {key === 'step1' && channel === 'linkedin' && (
                  <p className="text-xs text-muted-foreground">{text.length}/300 characters</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
