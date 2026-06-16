'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[App error]', error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-display font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">We&apos;ve been notified. Try again — if it keeps happening, please refresh the page.</p>
        {error.digest ? <p className="mt-2 text-xs text-muted-foreground/60 font-mono">ref: {error.digest}</p> : null}
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition">
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <Link href="/dashboard" className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition">Go home</Link>
        </div>
      </div>
    </div>
  );
}
