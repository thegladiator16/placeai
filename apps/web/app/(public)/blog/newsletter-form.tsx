'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-4 text-accent">
        <Check className="h-5 w-5" />
        <span className="text-sm font-medium">
          You&apos;re on the list. Check your inbox on Sunday.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@iit.ac.in"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border/50 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition"
      >
        Subscribe
      </button>
    </form>
  );
}
