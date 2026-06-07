'use client';

import { useState } from 'react';
import { Search, Users, Loader2, ExternalLink, MessageSquare, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReferralContact } from '@placeai/db';
import { ReferralMessageModal } from './referral-message-modal';

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

const POPULAR_COMPANIES = ['Zepto', 'CRED', 'Groww', 'PhonePe', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'Google India', 'Microsoft India'];

type Props = {
  userCollege: string;
  userGradYear: number | null;
  savedContacts: ReferralContact[];
};

export function ReferralDiscovery({ userCollege, userGradYear, savedContacts: initialContacts }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AlumniResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniResult | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const search = async (company?: string) => {
    const q = company ?? query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/v1/referral/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: q }),
      });
      const json = await res.json() as { success: boolean; data?: AlumniResult[]; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Search failed');
      setResults(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const strengthBadge = (strength: AlumniResult['connectionStrength']) => {
    if (strength === 'strong') return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30"><Star className="w-3 h-3" />Strong</span>;
    if (strength === 'medium') return <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">Alumni</span>;
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Referral Discovery</h1>
        </div>
        <p className="text-muted-foreground ml-13">Find {userCollege ? `${userCollege} ` : ''}alumni at your target companies and get a warm referral.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void search(); }}
            placeholder="Search by company name (e.g. Zepto, CRED, Google)…"
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <button
          onClick={() => void search()}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Popular companies */}
      {!results && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Popular companies</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COMPANIES.map((c) => (
              <button
                key={c}
                onClick={() => { setQuery(c); void search(c); }}
                className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-brand/50 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Results */}
      {results !== null && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{results.length} alumni found{userCollege ? ` · prioritizing ${userCollege}` : ''}</p>
            {results.some((r) => r.connectionStrength === 'strong') && (
              <span className="text-xs text-accent flex items-center gap-1"><Star className="w-3 h-3" />Strong = same college + branch</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No alumni found for this company yet.</p>
              <p className="text-sm mt-1">Try another company or search LinkedIn directly.</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((alumni, i) => (
                  <motion.div
                    key={alumni.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-card border rounded-xl p-4 space-y-3 ${alumni.connectionStrength === 'strong' ? 'border-accent/40' : alumni.connectionStrength === 'medium' ? 'border-brand/30' : 'border-border'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{alumni.personName ?? 'Anonymous'}</p>
                          {strengthBadge(alumni.connectionStrength)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{alumni.currentRole}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{alumni.currentCompany}</p>
                      </div>
                      {alumni.linkedinUrl && (
                        <a href={alumni.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-brand transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{alumni.collegeName}</p>
                      {alumni.graduationYear && <p>Class of {alumni.graduationYear}</p>}
                      {alumni.branch && <p>{alumni.branch}</p>}
                    </div>

                    <button
                      onClick={() => setSelectedAlumni(alumni)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-lg text-xs font-medium transition-colors"
                    >
                      {savedIds.has(alumni.id) ? <><CheckCircle className="w-3.5 h-3.5" />Message Saved</> : <><MessageSquare className="w-3.5 h-3.5" />Generate Referral Message</>}
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Saved contacts */}
      {initialContacts.length > 0 && (
        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-foreground mb-3">My Referral Contacts ({initialContacts.length})</h2>
          <div className="space-y-2">
            {initialContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 px-4 bg-card border border-border rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.contactName}</p>
                  <p className="text-xs text-muted-foreground">{c.contactRole} · {c.contactCompany}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.responseReceived && <span className="text-xs text-accent">Responded</span>}
                  {c.referralGiven && <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">Referred!</span>}
                  {!c.responseReceived && <span className="text-xs text-muted-foreground">Sent</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message generation modal */}
      {selectedAlumni && (
        <ReferralMessageModal
          alumni={selectedAlumni}
          userCollege={userCollege}
          userGradYear={userGradYear}
          onClose={() => setSelectedAlumni(null)}
          onSaved={() => setSavedIds((prev) => new Set([...prev, selectedAlumni.id]))}
        />
      )}
    </div>
  );
}
