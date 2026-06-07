'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useResumeEditor, type Section } from '@/lib/stores/resume-editor';
import { SectionNav } from './section-nav';
import { EditorPanel } from './editor-panel';
import { ResumePreview } from './resume-preview';
import { AiSuggestionsPanel } from './ai-suggestions-panel';
import type { Resume } from '@placeai/db';
import { Save, Eye, Loader2, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';

type Props = { resume: Resume };

export function ResumeEditorShell({ resume }: Props) {
  const { init, isDirty, isSaving, resumeId, markSaved, personalInfo, summary, experience, projects, education, skills, certifications } = useResumeEditor();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    init(resume.id, resume.title, resume as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id]);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save on change with 1.5s debounce
  useEffect(() => {
    if (!isDirty || !resumeId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await fetch(`/api/v1/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalInfo, summary, experience, projects, education, skills, certifications }),
      });
      markSaved();
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [isDirty, resumeId, personalInfo, summary, experience, projects, education, skills, certifications, markSaved]);

  const downloadPdf = useCallback(async () => {
    const { pdf } = await import('@react-pdf/renderer');
    const { ClassicTemplate } = await import('./templates/classic-template');
    const { createElement } = await import('react');
    const data = { personalInfo, summary, experience, projects, education, skills, certifications };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(createElement(ClassicTemplate, { data }) as any).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [personalInfo, summary, experience, projects, education, skills, certifications, resume.title]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/resume" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Resumes</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground truncate max-w-48">{resume.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isSaving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /><span>Saving…</span></>
            ) : isDirty ? (
              <><Save className="w-3 h-3" /><span>Unsaved</span></>
            ) : (
              <><CheckCircle className="w-3 h-3 text-accent" /><span>Saved</span></>
            )}
          </div>
          <Link
            href={`/resume/${resume.id}/ats`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium hover:border-brand/50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> ATS Score
          </Link>
          <button
            onClick={() => void downloadPdf()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: section nav */}
        <SectionNav />

        {/* Center: editor */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <EditorPanel />
        </div>

        {/* Right: live A4 preview */}
        <div className="w-[420px] hidden xl:flex flex-col border-r border-border overflow-hidden">
          <div className="flex-shrink-0 px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">Preview</div>
          <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
            <ResumePreview />
          </div>
        </div>

        {/* Far right: AI suggestions */}
        <div className="w-72 hidden 2xl:flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">AI Suggestions</div>
          <div className="flex-1 overflow-y-auto p-3">
            <AiSuggestionsPanel resumeId={resume.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
