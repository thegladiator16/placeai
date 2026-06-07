'use client';

import { useState, useCallback } from 'react';
import { Plus, ExternalLink, Trash2, GripVertical } from 'lucide-react';
import type { JobApplication } from '@placeai/db';

type Status = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'ghosted';

const COLUMNS: { id: Status; label: string; color: string; bg: string }[] = [
  { id: 'saved', label: 'Saved', color: 'text-muted-foreground', bg: 'bg-muted/30' },
  { id: 'applied', label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'screening', label: 'Screening', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'interview', label: 'Interview', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'offer', label: 'Offer', color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'rejected', label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'ghosted', label: 'Ghosted', color: 'text-gray-500', bg: 'bg-gray-500/10' },
];

type AddCardForm = { companyName: string; jobTitle: string; jobUrl: string };

type Props = {
  initialApplications: JobApplication[];
};

export function KanbanBoard({ initialApplications }: Props) {
  const [apps, setApps] = useState<JobApplication[]>(initialApplications);
  const [dragging, setDragging] = useState<string | null>(null);
  const [adding, setAdding] = useState<Status | null>(null);
  const [form, setForm] = useState<AddCardForm>({ companyName: '', jobTitle: '', jobUrl: '' });

  const byStatus = useCallback((status: Status) =>
    apps.filter((a) => a.status === status), [apps]);

  const moveCard = async (id: string, newStatus: Status) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus, updatedAt: new Date() } : a));
    await fetch(`/api/v1/tracker/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const addCard = async (status: Status) => {
    if (!form.companyName && !form.jobTitle) return;
    const res = await fetch('/api/v1/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status }),
    });
    const json = await res.json() as { success: boolean; data?: JobApplication };
    if (json.success && json.data) {
      setApps((prev) => [json.data!, ...prev]);
    }
    setAdding(null);
    setForm({ companyName: '', jobTitle: '', jobUrl: '' });
  };

  const deleteCard = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/v1/tracker/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {COLUMNS.map((col) => {
        const cards = byStatus(col.id);
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-64"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) void moveCard(dragging, col.id);
            }}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${col.bg} mb-3`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${col.color}`}>{col.label}</span>
                <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>
              <button
                onClick={() => { setAdding(col.id); setForm({ companyName: '', jobTitle: '', jobUrl: '' }); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {adding === col.id && (
                <div className="bg-card border border-brand/50 rounded-xl p-3 space-y-2">
                  <input
                    autoFocus
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Company name"
                    className="w-full text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-brand"
                  />
                  <input
                    value={form.jobTitle}
                    onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                    placeholder="Job title"
                    className="w-full text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-brand"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => void addCard(col.id)}
                      className="flex-1 text-xs bg-brand text-white rounded py-1 hover:bg-brand/90 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAdding(null)}
                      className="flex-1 text-xs bg-card border border-border rounded py-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {cards.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDragging(app.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-border/80 transition-all group ${dragging === app.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {app.companyName ?? 'Unknown Company'}
                      </p>
                      {app.jobTitle && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{app.jobTitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-brand transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => void deleteCard(app.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {app.atsMatchScore && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${app.atsMatchScore}%`,
                            backgroundColor: app.atsMatchScore >= 80 ? '#00D4AA' : app.atsMatchScore >= 60 ? '#F59E0B' : '#EF4444',
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{app.atsMatchScore}</span>
                    </div>
                  )}

                  {app.priority && app.priority !== 'medium' && (
                    <span className={`mt-2 inline-block text-xs px-1.5 py-0.5 rounded ${
                      app.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {app.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
