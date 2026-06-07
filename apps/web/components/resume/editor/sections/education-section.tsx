'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { EducationEntry } from '@placeai/db';

const DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'BCA', 'M.Tech', 'M.E.', 'M.Sc', 'MBA', 'MCA', 'Ph.D', 'Diploma'];
const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Biotechnology', 'Mathematics & Computing', 'Data Science', 'Artificial Intelligence'];

function EducationCard({ entry, onUpdate, onRemove }: {
  entry: EducationEntry; onUpdate: (e: Partial<EducationEntry>) => void; onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-card/50">
        <div>
          <p className="text-sm font-medium text-foreground">{entry.institution || 'New Institution'}</p>
          <p className="text-xs text-muted-foreground">{[entry.degree, entry.branch].filter(Boolean).join(' — ')}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-3 border-t border-border">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Institution Name *</label>
            <input value={entry.institution} onChange={(e) => onUpdate({ institution: e.target.value })} placeholder="IIT Bombay" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Degree</label>
              <select value={entry.degree} onChange={(e) => onUpdate({ degree: e.target.value })} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand">
                <option value="">Select degree</option>
                {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Branch / Major</label>
              <select value={entry.branch ?? ''} onChange={(e) => onUpdate({ branch: e.target.value })} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Year</label>
              <input value={entry.startDate ?? ''} onChange={(e) => onUpdate({ startDate: e.target.value })} placeholder="2020" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Year / Expected</label>
              <input value={entry.endDate ?? ''} onChange={(e) => onUpdate({ endDate: e.target.value })} placeholder="2024" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">CGPA / Percentage</label>
            <input value={entry.gpa ?? ''} onChange={(e) => onUpdate({ gpa: e.target.value })} placeholder="8.5 / 10" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          </div>
        </div>
      )}
    </div>
  );
}

export function EducationSection() {
  const { education, addEducation, updateEducation, removeEducation } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Education</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Add your degrees in reverse chronological order.</p>
        </div>
        <button onClick={addEducation} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Education
        </button>
      </div>
      {education.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">No education added yet.</p>
          <button onClick={addEducation} className="mt-3 text-brand text-sm hover:underline">Add your education →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((e, idx) => (
            <EducationCard key={idx} entry={e} onUpdate={(u) => updateEducation(idx, u)} onRemove={() => removeEducation(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
