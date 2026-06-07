'use client';

import { useResumeEditor, type Section } from '@/lib/stores/resume-editor';
import { User, FileText, Briefcase, Code2, GraduationCap, Wrench, Award } from 'lucide-react';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string | undefined }> }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code2 },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'certifications', label: 'Certifications', icon: Award },
];

export function SectionNav() {
  const { activeSection, setActiveSection } = useResumeEditor();

  return (
    <nav className="w-52 flex-shrink-0 border-r border-border overflow-y-auto bg-card/50">
      <div className="p-2 space-y-0.5">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              activeSection === id
                ? 'bg-brand/10 text-brand font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
