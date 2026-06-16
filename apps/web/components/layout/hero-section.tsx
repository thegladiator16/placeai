'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ScoreAnimation } from '@/components/ats/score-animation';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-4">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108, 71, 255, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-brand text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            India&apos;s #1 AI Placement Copilot
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight text-foreground">
            Land your{' '}
            <span className="text-gradient">dream job</span>,<br />
            not another rejection.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            AI-powered resume optimization, ATS analysis, referral discovery &amp; interview
            prep — built for Indian engineers. From{' '}
            <span className="text-foreground font-medium">₹299/month</span>.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-brand to-accent"
                />
              ))}
            </div>
            <span>
              Trusted by <strong className="text-foreground">12,000+</strong> students from IITs,
              NITs &amp; IIITs
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
            >
              Analyze My Resume Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools/ats-checker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:border-brand/50 transition-colors"
            >
              Try ATS Checker
            </Link>
          </div>

          {/* Trust bullets */}
          <ul className="mt-8 space-y-2">
            {[
              'No credit card required',
              '3 free ATS analyses to start',
              'Results in under 30 seconds',
            ].map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Score animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <ScoreAnimation />
        </motion.div>
      </div>
    </section>
  );
}
