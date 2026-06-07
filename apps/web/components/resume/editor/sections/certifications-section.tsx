'use client';

import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Plus, Trash2 } from 'lucide-react';
import type { CertificationEntry } from '@placeai/db';

export function CertificationsSection() {
  const { certifications, addCertification, updateCertification, removeCertification } = useResumeEditor();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Certifications</h2>
          <p className="text-sm text-muted-foreground mt-0.5">AWS, Google Cloud, Coursera certificates, etc.</p>
        </div>
        <button onClick={addCertification} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Certification
        </button>
      </div>
      {certifications.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">No certifications added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, idx) => (
            <div key={idx} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Certification Name *</label>
                  <input
                    value={cert.name}
                    onChange={(e) => updateCertification(idx, { name: e.target.value })}
                    placeholder="AWS Certified Solutions Architect"
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <button onClick={() => removeCertification(idx)} className="mt-5 p-1.5 text-muted-foreground hover:text-red-500 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Issuer</label>
                  <input value={cert.issuer ?? ''} onChange={(e) => updateCertification(idx, { issuer: e.target.value })} placeholder="Amazon Web Services" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Issue Date</label>
                  <input value={cert.issueDate ?? ''} onChange={(e) => updateCertification(idx, { issueDate: e.target.value })} placeholder="Mar 2023" className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Credential URL</label>
                  <input value={cert.url ?? ''} onChange={(e) => updateCertification(idx, { url: e.target.value })} placeholder="https://www.credly.com/badges/..." className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
