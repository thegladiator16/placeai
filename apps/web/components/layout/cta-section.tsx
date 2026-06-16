import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 border-t border-border/50">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="bg-card border border-border rounded-2xl p-12"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(108, 71, 255, 0.08) 0%, transparent 70%)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Start for free,{' '}
            <span className="text-gradient">upgrade when you&apos;re ready</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Join 12,000+ Indian engineers who are landing their dream jobs faster with PlaceAI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border text-foreground font-medium hover:border-brand/50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
