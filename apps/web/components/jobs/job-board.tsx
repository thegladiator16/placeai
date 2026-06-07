'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Briefcase, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobCard } from './job-card';
import { JobFilters } from './job-filters';
import { JobDetailModal } from './job-detail-modal';

export type JobItem = {
  id: string;
  title: string;
  companyName: string;
  workMode: string | null;
  employmentType: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  department: string | null;
  locations: { city?: string; country?: string; isRemote?: boolean }[];
  requiredSkills: string[] | null;
  preferredSkills: string[] | null;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  postedAt: string | null;
  isActive: boolean | null;
  matchScore?: number;
};

type JobsResponse = {
  jobs: JobItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Filters = {
  workMode: string;
  experienceMin: string;
  experienceMax: string;
  department: string;
};

type Props = { userExp: number };

export function JobBoard({ userExp }: Props) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ workMode: '', experienceMin: '', experienceMax: '', department: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JobsResponse | null>(null);
  const [recommended, setRecommended] = useState<(JobItem & { matchScore: number })[] | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [tab, setTab] = useState<'all' | 'recommended'>('all');

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (query) params.set('q', query);
      if (filters.workMode) params.set('workMode', filters.workMode);
      if (filters.experienceMin) params.set('experienceMin', filters.experienceMin);
      if (filters.experienceMax) params.set('experienceMax', filters.experienceMax);
      if (filters.department) params.set('department', filters.department);
      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      const json = await res.json() as { success: boolean; data?: JobsResponse };
      if (json.success && json.data) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  const fetchRecommended = useCallback(async () => {
    const res = await fetch('/api/v1/jobs/recommended');
    const json = await res.json() as { success: boolean; data?: (JobItem & { matchScore: number })[] };
    if (json.success && json.data) setRecommended(json.data);
  }, []);

  useEffect(() => {
    void fetchJobs(1);
    setPage(1);
  }, [fetchJobs]);

  useEffect(() => {
    void fetchRecommended();
  }, [fetchRecommended]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Job Board</h1>
          <p className="text-sm text-muted-foreground">Curated openings at top Indian tech companies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {(['all', 'recommended'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'recommended' ? '✨ Recommended' : 'All Jobs'}
            {t === 'all' && data && <span className="ml-1.5 text-xs opacity-70">{data.total}</span>}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <>
          {/* Search + filter bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void fetchJobs(1); }}
                placeholder="Search jobs, companies, skills…"
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-brand text-white border-brand' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
              )}
            </button>
            <button
              onClick={() => void fetchJobs(1)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <JobFilters filters={filters} onChange={setFilters} onClear={() => setFilters({ workMode: '', experienceMin: '', experienceMax: '', department: '' })} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.workMode && <FilterChip label={`Mode: ${filters.workMode}`} onRemove={() => setFilters((f) => ({ ...f, workMode: '' }))} />}
              {filters.department && <FilterChip label={`Dept: ${filters.department}`} onRemove={() => setFilters((f) => ({ ...f, department: '' }))} />}
              {(filters.experienceMin || filters.experienceMax) && (
                <FilterChip
                  label={`Exp: ${filters.experienceMin || '0'}–${filters.experienceMax || '∞'} yrs`}
                  onRemove={() => setFilters((f) => ({ ...f, experienceMin: '', experienceMax: '' }))}
                />
              )}
            </div>
          )}

          {/* Results */}
          {loading && !data && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          )}

          {data && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">{data.total} jobs found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {data.jobs.map((job, i) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <JobCard job={job} onClick={() => setSelectedJob(job)} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button disabled={page === 1} onClick={() => { setPage((p) => p - 1); void fetchJobs(page - 1); }} className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-card transition-colors">Previous</button>
                  <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
                  <button disabled={page === data.totalPages} onClick={() => { setPage((p) => p + 1); void fetchJobs(page + 1); }} className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-card transition-colors">Next</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'recommended' && (
        <div>
          {!recommended ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Complete your profile and upload a resume to get personalized recommendations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recommended.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <JobCard job={job} matchScore={job.matchScore} onClick={() => setSelectedJob(job)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} userExp={userExp} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:opacity-70"><X className="w-3 h-3" /></button>
    </span>
  );
}
