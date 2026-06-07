'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

type Props = {
  onSuccess: (resumeId: string) => void;
};

export function ResumeUpload({ onSuccess }: Props) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setState('uploading');
    setFileName(file.name);
    setError(null);

    const form = new FormData();
    form.append('file', file);
    form.append('title', file.name.replace(/\.(pdf|docx?)$/i, ''));

    try {
      const res = await fetch('/api/v1/resumes/upload', { method: 'POST', body: form });
      const json = await res.json() as { success: boolean; data?: { id: string }; error?: { message: string } };

      if (!json.success || !json.data) {
        throw new Error(json.error?.message ?? 'Upload failed');
      }

      setState('success');
      onSuccess(json.data.id);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [onSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  }, [upload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  }, [upload]);

  const isUploading = state === 'uploading';

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setState('dragging'); }}
      onDragLeave={() => setState('idle')}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
        state === 'dragging' ? 'border-brand bg-brand/5' :
        state === 'success' ? 'border-green-500 bg-green-500/5' :
        state === 'error' ? 'border-red-500 bg-red-500/5' :
        'border-border hover:border-brand/50 hover:bg-brand/5'
      }`}
    >
      <input
        type="file"
        accept=".pdf,.docx"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleChange}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-3 pointer-events-none">
        {state === 'uploading' && <Loader2 className="w-10 h-10 text-brand animate-spin" />}
        {state === 'success' && <CheckCircle className="w-10 h-10 text-green-500" />}
        {state === 'error' && <AlertCircle className="w-10 h-10 text-red-500" />}
        {(state === 'idle' || state === 'dragging') && (
          state === 'dragging'
            ? <Upload className="w-10 h-10 text-brand" />
            : <FileText className="w-10 h-10 text-muted-foreground" />
        )}

        <div>
          {state === 'idle' && (
            <>
              <p className="font-medium text-foreground">Drop your resume here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">PDF or DOCX · Max 5MB</p>
            </>
          )}
          {state === 'dragging' && <p className="font-medium text-brand">Release to upload</p>}
          {state === 'uploading' && <p className="font-medium text-foreground">Parsing {fileName}…</p>}
          {state === 'success' && <p className="font-medium text-green-500">Resume uploaded successfully!</p>}
          {state === 'error' && (
            <>
              <p className="font-medium text-red-500">Upload failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
