'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Plus, Trash2, Sparkles, Loader2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExperienceEntry } from '@placeai/db';

function BulletEditor({ bullets, onChange, jobTitle, company, resumeId }: {
  bullets: string[]; onChange: (b: string[]) => void; jobTitle: string; company: string; resumeId: string | null;
}) {
  const [rewritingIdx, setRewritingIdx] = useState<number | null>(null);

  const rewriteBullet = async (idx: number) => {
    if (!resumeId) return;
    setRewritingIdx(idx);
    try {
      const res = await fetch('/api/v1/resumes/ai/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: bullets[idx], jobTitle, company, resumeId }),
      });
      const json = await res.json() as { success: boolean; data?: { rewritten: string } };
      if (json.success && json.data) {
        onChange(bullets.map((b, i) => i === idx ? json.data!.rewritten : b));
      }
    } finally {
      setRewritingIdx(null);
    }
  };

  return (
    <div className="space-y-1.5">
      {bullets.map((bullet, i) => (
        <div key={i} className="flex gap-1.5">
          <span className="text-muted-foreground mt-2.5 text-xs flex-shrink-0">•</span>
          <input
            value={bullet}
            onChange={(e) => onChange(bullets.map((b, j) => j === i ? e.target.value : b))}
            placeholder="Led development of feature X, resulting in Y% improvement"
            className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          />
          <button
            onClick={() => void rewriteBullet(i)}
            disabled={rewritingIdx === i || !bullets[i]?.trim()}
            title="Rewrite with AI"
            className="p-1.5 text-muted-foreground hover:text-brand disabled:opacity-40 transition-colors"
          >
            {rewritingIdx === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...bullets, ''])}
        className="flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 mt-1 transition-colors"
      >
        <Plus className="w-3 h-3" /> Add bullet
      </button>
    </div>
  );
}

function ExperienceCard({ entry, idx, onUpdate, onRemove }: {
  entry: ExperienceEntry; idx: number;
  onUpdate: (e: Partial<ExperienceEntry>) => void;
  onRemove: () => void;
}) {
  const { resumeId } = useResumeEditor();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-card/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{entry.role || 'New Position'}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-3 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Company *</label>
              <input value={entry.company} onChange={(e) => onUpdate({ company: e.target.value })} placeholder="Zepto" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role / Title *</label>
              <input value={entry.role} onChange={(e) => onUpdate({ role: e.target.value })} placeholder="Software Engineer" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <input value={entry.startDate ?? ''} onChange={(e) => onUpdate({ startDate: e.target.value })} placeholder="Jun 2022" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <input value={entry.isCurrent ? 'Present' : (entry.endDate ?? '')} disabled={entry.isCurrent} onChange={(e) => onUpdate({ endDate: e.target.value })} placeholder="Present" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand disabled:opacity-50" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={entry.isCurrent ?? false} onChange={(e) => onUpdate({ isCurrent: e.target.checked, ...(e.target.checked ? {} : { endDate: entry.endDate ?? '' }) })} className="accent-brand" />
            Currently working here
          </label>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Bullet Points</label>
            <BulletEditor
              bullets={entry.bullets}
              onChange={(bullets) => onUpdate({ bullets })}
              jobTitle={entry.role}
              company={entry.company}
              resumeId={resumeId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ExperienceSection() {
  const { experience, addExperience, updateExperience, removeExperience } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Work Experience</h2>
          <p className="text-sm text-muted-foreground mt-0.5">List most recent positions first. Use quantified bullets.</p>
        </div>
        <button onClick={addExperience} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Position
        </button>
      </div>
      {experience.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">No experience added yet.</p>
          <button onClick={addExperience} className="mt-3 text-brand text-sm hover:underline">Add your first position →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((exp, idx) => (
            <ExperienceCard key={idx} entry={exp} idx={idx} onUpdate={(u) => updateExperience(idx, u)} onRemove={() => removeExperience(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
