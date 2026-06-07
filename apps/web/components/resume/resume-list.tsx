'use client';

import { useState } from 'react';
import { FileText, Trash2, Star, StarOff, ExternalLink, Clock } from 'lucide-react';
import type { Resume } from '@placeai/db';

type Props = {
  resumes: Resume[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function timeAgo(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ResumeList({ resumes, onSelect, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/v1/resumes/${id}`, { method: 'DELETE' });
    onDelete(id);
    setDeletingId(null);
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No resumes yet. Upload one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-brand/40 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-brand" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{resume.title}</span>
              {resume.isPrimary && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">Primary</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Updated {timeAgo(resume.updatedAt)}</span>
              {resume.version && resume.version > 1 && (
                <span className="ml-1">· v{resume.version}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onSelect(resume.id)}
              className="p-2 rounded-lg hover:bg-brand/10 text-muted-foreground hover:text-brand transition-colors"
              title="Open resume"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => void handleDelete(resume.id)}
              disabled={deletingId === resume.id}
              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
