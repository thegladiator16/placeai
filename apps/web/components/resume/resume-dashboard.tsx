'use client';

import { useState } from 'react';
import { Plus, FileText, Zap } from 'lucide-react';
import type { Resume } from '@placeai/db';
import { ResumeUpload } from './resume-upload';
import { ResumeList } from './resume-list';
import { AtsAnalyzer } from '@/components/ats/ats-analyzer';

type View = 'list' | 'upload' | 'ats';

type Props = {
  initialResumes: Resume[];
};

export function ResumeDashboard({ initialResumes }: Props) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedResume = resumes.find((r) => r.id === selectedId) ?? resumes[0] ?? null;

  const handleUploadSuccess = (id: string) => {
    // Refetch the newly created resume
    fetch(`/api/v1/resumes/${id}`)
      .then((r) => r.json() as Promise<{ success: boolean; data?: Resume }>)
      .then((json) => {
        if (json.success && json.data) {
          setResumes((prev) => [json.data!, ...prev]);
          setSelectedId(json.data!.id);
        }
      })
      .catch(() => null);
    setView('list');
  };

  const handleDelete = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Resume</h1>
          <p className="text-muted-foreground mt-1">Upload, manage, and analyze your resumes</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedResume && (
            <button
              onClick={() => setView(view === 'ats' ? 'list' : 'ats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'ats'
                  ? 'bg-brand text-white'
                  : 'bg-card border border-border text-foreground hover:border-brand/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              ATS Analyzer
            </button>
          )}
          <button
            onClick={() => setView(view === 'upload' ? 'list' : 'upload')}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Resume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={view === 'ats' ? 'lg:col-span-1' : 'lg:col-span-3'}>
          {view === 'upload' ? (
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">Upload New Resume</h2>
              <ResumeUpload onSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Your Resumes ({resumes.length})</h2>
              </div>
              <ResumeList
                resumes={resumes}
                onSelect={(id) => { setSelectedId(id); setView('ats'); }}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        {view === 'ats' && selectedResume && (
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-brand" />
                <h2 className="font-semibold text-foreground">ATS Score Analyzer</h2>
                <span className="text-sm text-muted-foreground ml-1">— {selectedResume.title}</span>
              </div>
              <AtsAnalyzer resume={selectedResume} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
