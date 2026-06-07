'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { X, Plus } from 'lucide-react';
import type { Skills } from '@placeai/db';

type SkillCategory = keyof Skills;
const CATEGORIES: { key: SkillCategory; label: string; placeholder: string }[] = [
  { key: 'languages', label: 'Programming Languages', placeholder: 'Python, TypeScript, Go…' },
  { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'React, FastAPI, Next.js…' },
  { key: 'databases', label: 'Databases', placeholder: 'PostgreSQL, Redis, MongoDB…' },
  { key: 'tools', label: 'Tools & DevOps', placeholder: 'Docker, Git, AWS, Kubernetes…' },
  { key: 'cloud', label: 'Cloud Platforms', placeholder: 'AWS, GCP, Azure…' },
  { key: 'other', label: 'Other Skills', placeholder: 'Machine Learning, DSA, System Design…' },
];

function SkillTagInput({ category, skills, onUpdate }: {
  category: { key: SkillCategory; label: string; placeholder: string };
  skills: string[];
  onUpdate: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onUpdate([...skills, trimmed]);
    setInput('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{category.label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-8">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-card border border-border rounded-full text-foreground">
            {s}
            <button onClick={() => onUpdate(skills.filter((x) => x !== s))} className="text-muted-foreground hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          placeholder={category.placeholder}
          className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
        />
        <button onClick={add} className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-brand hover:border-brand/50 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SkillsSection() {
  const { skills, updateSkills } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Skills</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Type a skill and press Enter or comma to add. ATS systems scan for keywords here.</p>
      </div>
      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <SkillTagInput
            key={cat.key}
            category={cat}
            skills={skills[cat.key] ?? []}
            onUpdate={(tags) => updateSkills({ [cat.key]: tags })}
          />
        ))}
      </div>
    </div>
  );
}
