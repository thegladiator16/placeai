import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Sign up for PlaceAI — your AI placement copilot.',
};

const TRUST = [
  'Free forever tier',
  'Used by students at 50+ Indian colleges',
  'No credit card required',
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-10 lg:p-14 bg-gradient-to-br from-brand/10 via-background to-accent/5 border-r border-border/50">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-foreground font-display font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white"><Sparkles className="h-4 w-4" /></span>
            PlaceAI
          </Link>
        </div>
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">India&apos;s #1 AI Placement Copilot</span>
          <h1 className="mt-6 text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">Start your placement <span className="text-gradient">journey today</span>.</h1>
          <p className="mt-4 text-muted-foreground">AI resume optimization, ATS analysis, alumni referrals & interview prep — built for Indian engineers.</p>
          <ul className="mt-8 space-y-3">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">Already have an account? <Link href="/sign-in" className="text-brand hover:underline">Sign in →</Link></p>
      </div>
      <div className="flex flex-col items-center justify-center p-6 lg:p-10">
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-foreground font-display font-bold text-lg mb-8">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white"><Sparkles className="h-4 w-4" /></span>
          PlaceAI
        </Link>
        <SignUp appearance={{ elements: { rootBox: 'mx-auto', card: 'bg-card border border-border shadow-xl' } }} />
        <p className="md:hidden mt-6 text-xs text-muted-foreground">Already have an account? <Link href="/sign-in" className="text-brand hover:underline">Sign in →</Link></p>
      </div>
    </div>
  );
}
