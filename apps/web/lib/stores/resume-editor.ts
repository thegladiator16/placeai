import { create } from 'zustand';
import type { PersonalInfo, ExperienceEntry, EducationEntry, ProjectEntry, Skills, CertificationEntry } from '@placeai/db';

export type Section = 'personal' | 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'certifications';

export type ResumeEditorState = {
  resumeId: string | null;
  title: string;
  isDirty: boolean;
  isSaving: boolean;
  activeSection: Section;
  selectedTemplate: 'classic' | 'modern' | 'compact';
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: Skills;
  certifications: CertificationEntry[];
};

type Actions = {
  init: (id: string, title: string, data: Partial<ResumeEditorState>) => void;
  setActiveSection: (section: Section) => void;
  setTemplate: (t: ResumeEditorState['selectedTemplate']) => void;
  updatePersonal: (info: Partial<PersonalInfo>) => void;
  updateSummary: (s: string) => void;
  addExperience: () => void;
  updateExperience: (idx: number, entry: Partial<ExperienceEntry>) => void;
  removeExperience: (idx: number) => void;
  reorderExperience: (from: number, to: number) => void;
  addProject: () => void;
  updateProject: (idx: number, entry: Partial<ProjectEntry>) => void;
  removeProject: (idx: number) => void;
  addEducation: () => void;
  updateEducation: (idx: number, entry: Partial<EducationEntry>) => void;
  removeEducation: (idx: number) => void;
  updateSkills: (skills: Partial<Skills>) => void;
  addCertification: () => void;
  updateCertification: (idx: number, entry: Partial<CertificationEntry>) => void;
  removeCertification: (idx: number) => void;
  markSaved: () => void;
};

const defaultPersonal: PersonalInfo = { name: '', email: '' };

export const useResumeEditor = create<ResumeEditorState & Actions>((set) => ({
  resumeId: null,
  title: 'My Resume',
  isDirty: false,
  isSaving: false,
  activeSection: 'personal',
  selectedTemplate: 'classic',
  personalInfo: defaultPersonal,
  summary: '',
  experience: [],
  projects: [],
  education: [],
  skills: {},
  certifications: [],

  init: (id, title, data) => set({
    resumeId: id,
    title,
    isDirty: false,
    personalInfo: data.personalInfo ?? defaultPersonal,
    summary: data.summary ?? '',
    experience: data.experience ?? [],
    projects: data.projects ?? [],
    education: data.education ?? [],
    skills: data.skills ?? {},
    certifications: data.certifications ?? [],
  }),

  setActiveSection: (section) => set({ activeSection: section }),
  setTemplate: (t) => set({ selectedTemplate: t, isDirty: true }),

  updatePersonal: (info) => set((s) => ({
    personalInfo: { ...s.personalInfo, ...info },
    isDirty: true,
  })),

  updateSummary: (summary) => set({ summary, isDirty: true }),

  addExperience: () => set((s) => ({
    experience: [...s.experience, { company: '', role: '', bullets: [''] }],
    isDirty: true,
  })),
  updateExperience: (idx, entry) => set((s) => ({
    experience: s.experience.map((e, i) => i === idx ? { ...e, ...entry } : e),
    isDirty: true,
  })),
  removeExperience: (idx) => set((s) => ({
    experience: s.experience.filter((_, i) => i !== idx),
    isDirty: true,
  })),
  reorderExperience: (from, to) => set((s) => {
    const arr = [...s.experience];
    const [item] = arr.splice(from, 1);
    if (item) arr.splice(to, 0, item);
    return { experience: arr, isDirty: true };
  }),

  addProject: () => set((s) => ({
    projects: [...s.projects, { name: '', bullets: [] }],
    isDirty: true,
  })),
  updateProject: (idx, entry) => set((s) => ({
    projects: s.projects.map((p, i) => i === idx ? { ...p, ...entry } : p),
    isDirty: true,
  })),
  removeProject: (idx) => set((s) => ({
    projects: s.projects.filter((_, i) => i !== idx),
    isDirty: true,
  })),

  addEducation: () => set((s) => ({
    education: [...s.education, { institution: '', degree: '' }],
    isDirty: true,
  })),
  updateEducation: (idx, entry) => set((s) => ({
    education: s.education.map((e, i) => i === idx ? { ...e, ...entry } : e),
    isDirty: true,
  })),
  removeEducation: (idx) => set((s) => ({
    education: s.education.filter((_, i) => i !== idx),
    isDirty: true,
  })),

  updateSkills: (skills) => set((s) => ({
    skills: { ...s.skills, ...skills },
    isDirty: true,
  })),

  addCertification: () => set((s) => ({
    certifications: [...s.certifications, { name: '' }],
    isDirty: true,
  })),
  updateCertification: (idx, entry) => set((s) => ({
    certifications: s.certifications.map((c, i) => i === idx ? { ...c, ...entry } : c),
    isDirty: true,
  })),
  removeCertification: (idx) => set((s) => ({
    certifications: s.certifications.filter((_, i) => i !== idx),
    isDirty: true,
  })),

  markSaved: () => set({ isDirty: false, isSaving: false }),
}));
