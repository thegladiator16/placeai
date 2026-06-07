'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { ProjectEntry } from '@placeai/db';

function ProjectCard({ entry, onUpdate, onRemove }: {
  entry: ProjectEntry; onUpdate: (e: Partial<ProjectEntry>) => void; onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [techInput, setTechInput] = useState('');

  const addTech = () => {
    if (!techInput.trim()) return;
    onUpdate({ technologies: [...(entry.technologies ?? []), techInput.trim()] });
    setTechInput('');
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-card/50">
        <p className="text-sm font-medium text-foreground">{entry.name || 'New Project'}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-3 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project Name *</label>
              <input value={entry.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="PlaceAI" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Live URL</label>
              <input value={entry.url ?? ''} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="https://placeai.in" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">GitHub URL</label>
              <input value={entry.repoUrl ?? ''} onChange={(e) => onUpdate({ repoUrl: e.target.value })} placeholder="github.com/user/repo" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Technologies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(entry.technologies ?? []).map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full">
                  {t}
                  <button onClick={() => onUpdate({ technologies: (entry.technologies ?? []).filter((x) => x !== t) })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} placeholder="React, Node.js, PostgreSQL…" className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
              <button onClick={addTech} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:border-brand/50 transition-colors">Add</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Key Points</label>
            {(entry.bullets ?? []).map((b, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <span className="text-muted-foreground mt-2 text-xs">•</span>
                <input value={b} onChange={(e) => onUpdate({ bullets: (entry.bullets ?? []).map((x, j) => j === i ? e.target.value : x) })} placeholder="Built REST API handling 10k req/s" className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
                <button onClick={() => onUpdate({ bullets: (entry.bullets ?? []).filter((_, j) => j !== i) })} className="p-1.5 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => onUpdate({ bullets: [...(entry.bullets ?? []), ''] })} className="flex items-center gap-1.5 text-xs text-brand mt-1">
              <Plus className="w-3 h-3" /> Add point
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectsSection() {
  const { projects, addProject, updateProject, removeProject } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Highlight 2–4 impactful projects with tech stack.</p>
        </div>
        <button onClick={addProject} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">No projects added yet.</p>
          <button onClick={addProject} className="mt-3 text-brand text-sm hover:underline">Add your first project →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, idx) => (
            <ProjectCard key={idx} entry={p} onUpdate={(u) => updateProject(idx, u)} onRemove={() => removeProject(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
