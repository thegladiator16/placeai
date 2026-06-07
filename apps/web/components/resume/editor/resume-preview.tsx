'use client';

import { useResumeEditor } from '@/lib/stores/resume-editor';

export function ResumePreview() {
  const { personalInfo, summary, experience, projects, education, skills, certifications } = useResumeEditor();

  const allSkills = [
    ...(skills.languages ?? []),
    ...(skills.frameworks ?? []),
    ...(skills.databases ?? []),
    ...(skills.tools ?? []),
    ...(skills.cloud ?? []),
    ...(skills.other ?? []),
  ];

  return (
    // Scaled A4 preview — 794px wide at scale 0.6 = ~476px displayed
    <div className="origin-top-left" style={{ transform: 'scale(0.62)', width: '794px', minHeight: '1123px' }}>
      <div className="bg-white text-black font-serif" style={{ width: '794px', minHeight: '1123px', padding: '48px 56px', fontSize: '11px', lineHeight: '1.5' }}>

        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold tracking-wide uppercase">{personalInfo.name || 'Your Name'}</h1>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-600 text-xs">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.github && <span>{personalInfo.github}</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Summary</h2>
            <p className="text-gray-800">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{exp.role}</span>
                  <span className="text-gray-600 text-xs">{[exp.startDate, exp.isCurrent ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}</span>
                </div>
                <div className="text-gray-600 italic">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} className="flex gap-1.5"><span>•</span><span>{b}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Projects</h2>
            {projects.map((p, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{p.name}</span>
                  {p.url && <span className="text-gray-500 text-xs">{p.url}</span>}
                </div>
                {(p.technologies ?? []).length > 0 && <div className="text-gray-600 italic">{p.technologies!.join(', ')}</div>}
                {(p.bullets ?? []).filter(Boolean).map((b, j) => (
                  <div key={j} className="flex gap-1.5"><span>•</span><span>{b}</span></div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Education</h2>
            {education.map((e, i) => (
              <div key={i} className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold">{e.institution}</span>
                  {(e.degree || e.branch) && <span className="text-gray-600"> — {[e.degree, e.branch].filter(Boolean).join(', ')}</span>}
                  {e.gpa && <span className="text-gray-500"> · GPA: {e.gpa}</span>}
                </div>
                <span className="text-gray-600 text-xs">{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {allSkills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Technical Skills</h2>
            <div className="space-y-0.5">
              {skills.languages?.length ? <div><span className="font-semibold">Languages:</span> {skills.languages.join(', ')}</div> : null}
              {skills.frameworks?.length ? <div><span className="font-semibold">Frameworks:</span> {skills.frameworks.join(', ')}</div> : null}
              {skills.databases?.length ? <div><span className="font-semibold">Databases:</span> {skills.databases.join(', ')}</div> : null}
              {skills.tools?.length ? <div><span className="font-semibold">Tools:</span> {skills.tools.join(', ')}</div> : null}
              {skills.cloud?.length ? <div><span className="font-semibold">Cloud:</span> {skills.cloud.join(', ')}</div> : null}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Certifications</h2>
            {certifications.map((c, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span><span className="font-semibold">{c.name}</span>{c.issuer ? ` — ${c.issuer}` : ''}</span>
                {c.issueDate && <span className="text-gray-600">{c.issueDate}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
