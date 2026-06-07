'use client';

import { useResumeEditor } from '@/lib/stores/resume-editor';
import { PersonalInfoSection } from './sections/personal-info-section';
import { SummarySection } from './sections/summary-section';
import { ExperienceSection } from './sections/experience-section';
import { ProjectsSection } from './sections/projects-section';
import { EducationSection } from './sections/education-section';
import { SkillsSection } from './sections/skills-section';
import { CertificationsSection } from './sections/certifications-section';

export function EditorPanel() {
  const { activeSection } = useResumeEditor();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {activeSection === 'personal' && <PersonalInfoSection />}
      {activeSection === 'summary' && <SummarySection />}
      {activeSection === 'experience' && <ExperienceSection />}
      {activeSection === 'projects' && <ProjectsSection />}
      {activeSection === 'education' && <EducationSection />}
      {activeSection === 'skills' && <SkillsSection />}
      {activeSection === 'certifications' && <CertificationsSection />}
    </div>
  );
}
