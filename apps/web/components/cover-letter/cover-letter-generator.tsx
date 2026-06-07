'use client';

import { useState, useRef } from 'react';
import { FileText, Loader2, Copy, Download, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Resume = { id: string; title: string };

type Props = { resumes: Resume[] };

export function CoverLetterGenerator({ resumes }: Props) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'concise'>('professional');
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? '');
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!jobTitle.trim() || !companyName.trim()) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setOutput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/v1/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, companyName, jobDescription: jobDescription || undefined, tone, resumeId: resumeId || undefined }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOutput(text);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setOutput('Generation failed. Please try again.');
      }
    } finally {
      setStreaming(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Cover Letter Generator</h1>
          <p className="text-sm text-muted-foreground">AI-powered, tailored to each job application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Job Title *</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Zepto"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tone</label>
            <div className="flex gap-2">
              {(['professional', 'enthusiastic', 'concise'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${tone === t ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {resumes.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Base Resume</label>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
              >
                <option value="">None (generic)</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Job Description (optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for a more tailored letter…"
              rows={5}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-brand"
            />
          </div>

          <button
            onClick={() => void generate()}
            disabled={streaming || !jobTitle.trim() || !companyName.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {streaming ? 'Generating…' : output ? 'Regenerate' : 'Generate Cover Letter'}
          </button>
        </div>

        {/* Output panel */}
        <div className="relative">
          <div className="bg-card border border-border rounded-xl min-h-[400px] p-4">
            {!output && !streaming && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-sm">Your cover letter will appear here</p>
              </div>
            )}
            {(output || streaming) && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{output}</p>
                  {streaming && <span className="inline-block w-2 h-4 bg-brand animate-pulse ml-0.5 align-middle" />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {output && !streaming && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => void copy()} className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download .txt
              </button>
              <button onClick={() => void generate()} className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
