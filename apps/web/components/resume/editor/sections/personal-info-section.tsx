'use client';

import { useResumeEditor } from '@/lib/stores/resume-editor';

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand transition-colors"
      />
    </div>
  );
}

export function PersonalInfoSection() {
  const { personalInfo, updatePersonal } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your contact details appear at the top of your resume.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name *" value={personalInfo.name} onChange={(v) => updatePersonal({ name: v })} placeholder="Arjun Sharma" />
        <Field label="Email *" type="email" value={personalInfo.email} onChange={(v) => updatePersonal({ email: v })} placeholder="arjun@example.com" />
        <Field label="Phone" value={personalInfo.phone ?? ''} onChange={(v) => updatePersonal({ phone: v })} placeholder="+91 98765 43210" />
        <Field label="Location" value={personalInfo.location ?? ''} onChange={(v) => updatePersonal({ location: v })} placeholder="Bengaluru, India" />
        <Field label="LinkedIn URL" value={personalInfo.linkedin ?? ''} onChange={(v) => updatePersonal({ linkedin: v })} placeholder="linkedin.com/in/arjunsharma" />
        <Field label="GitHub URL" value={personalInfo.github ?? ''} onChange={(v) => updatePersonal({ github: v })} placeholder="github.com/arjunsharma" />
        <div className="col-span-2">
          <Field label="Portfolio / Website" value={personalInfo.portfolio ?? ''} onChange={(v) => updatePersonal({ portfolio: v })} placeholder="arjunsharma.dev" />
        </div>
      </div>
    </div>
  );
}
