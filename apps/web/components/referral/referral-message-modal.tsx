'use client';

import { useState } from 'react';
import { X, Copy, RefreshCw, CheckCircle, Loader2, MessageSquare, Mail, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AlumniResult = {
  id: string;
  personName: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  collegeName: string;
  graduationYear: number | null;
  branch: string | null;
  linkedinUrl: string | null;
  connectionStrength: 'strong' | 'medium' | 'weak';
  sameCollege: boolean;
};

type GeneratedMessages = {
  connectionRequest: string;
  followUp: string;
  emailVersion: string;
};

type Tab = 'connection' | 'followup' | 'email';

type Props = {
  alumni: AlumniResult;
  userCollege: string;
  userGradYear: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export function ReferralMessageModal({ alumni, userCollege, userGradYear, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<Tab>('connection');
  const [messages, setMessages] = useState<GeneratedMessages | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<Tab | null>(null);
  const [targetJobTitle, setTargetJobTitle] = useState('');

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/referral/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: alumni.personName ?? 'Alumni',
          contactRole: alumni.currentRole ?? '',
          contactCompany: alumni.currentCompany ?? '',
          targetJobTitle: targetJobTitle || undefined,
          sameCollege: alumni.sameCollege,
          userCollege,
          graduationYear: userGradYear ?? undefined,
          channel: 'linkedin_dm',
        }),
      });
      const json = await res.json() as { success: boolean; data?: GeneratedMessages; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Generation failed');
      setMessages(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, t: Tab) => {
    await navigator.clipboard.writeText(text);
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  const markSent = async () => {
    if (!messages) return;
    setSaving(true);
    try {
      const outreachMessage = tab === 'connection' ? messages.connectionRequest
        : tab === 'followup' ? messages.followUp
        : messages.emailVersion;
      await fetch('/api/v1/referral/save-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: alumni.personName ?? 'Alumni',
          contactRole: alumni.currentRole ?? undefined,
          contactLinkedinUrl: alumni.linkedinUrl ?? undefined,
          contactCompany: alumni.currentCompany ?? undefined,
          collegeMatch: alumni.sameCollege,
          outreachMessage,
        }),
      });
      setSaved(true);
      onSaved();
      setTimeout(onClose, 1500);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const currentMessage = messages
    ? tab === 'connection' ? messages.connectionRequest
      : tab === 'followup' ? messages.followUp
      : messages.emailVersion
    : null;

  const TABS: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'connection', label: 'Connection Request', icon: Linkedin },
    { id: 'followup', label: 'Follow-up DM', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Referral Message</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              To {alumni.personName ?? 'Alumni'} · {alumni.currentRole} at {alumni.currentCompany}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Target role input */}
          {!messages && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target role (optional)</label>
              <input
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager…"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          )}

          {/* Generate button */}
          {!messages && (
            <button
              onClick={() => void generate()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {loading ? 'Generating…' : 'Generate Messages'}
            </button>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Messages */}
          <AnimatePresence>
            {messages && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Tabs */}
                <div className="flex gap-1 bg-background rounded-lg p-1">
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                        tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Message text */}
                <div className="relative">
                  <textarea
                    value={currentMessage ?? ''}
                    onChange={(e) => {
                      if (!messages) return;
                      const val = e.target.value;
                      setMessages({
                        ...messages,
                        ...(tab === 'connection' ? { connectionRequest: val }
                          : tab === 'followup' ? { followUp: val }
                          : { emailVersion: val }),
                      });
                    }}
                    rows={tab === 'email' ? 10 : 5}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-brand transition-colors font-mono"
                  />
                  {tab === 'connection' && (
                    <p className="text-xs text-muted-foreground mt-1">{(currentMessage ?? '').length}/300 characters</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => void copy(currentMessage ?? '', tab)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === tab ? <CheckCircle className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === tab ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => void generate()}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Regenerate
                  </button>
                  <button
                    onClick={() => void markSent()}
                    disabled={saving || saved}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                  >
                    {saved ? <><CheckCircle className="w-3.5 h-3.5" />Saved!</>
                      : saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
                      : 'Mark as Sent & Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
