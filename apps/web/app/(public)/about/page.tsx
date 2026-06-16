import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, IndianRupee, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — PlaceAI',
  description:
    'PlaceAI is built by engineers who survived the Indian placement grind. Our mission: world-class placement tools at a price Indian students can actually afford.',
};

const DIFFERENTIATORS = [
  {
    icon: IndianRupee,
    title: 'Built for Indian wallets',
    body: 'Pro at ₹299/month — roughly 90% cheaper than Teal, Jobscan, or Kickresume. We charge in rupees and price for student budgets, not Silicon Valley salaries.',
  },
  {
    icon: Sparkles,
    title: 'Tuned for Indian hiring',
    body: 'Our AI knows the difference between a Zepto SDE-1 JD and an Amazon SDE-1 JD, what IIT Bombay placement cells look for, and how Indian recruiters scan resumes in 6 seconds flat.',
  },
  {
    icon: Users,
    title: 'Made by people who lived it',
    body: 'Every feature ships because a co-founder, friend, or junior failed an interview without it. No PMs guessing what students want from a glass office abroad.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Built by engineers who survived the{' '}
            <span className="text-gradient">placement grind</span>
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
            PlaceAI exists because in 2023, our founders spent ₹4,000 on a US resume tool that
            didn&apos;t understand a single Indian company on their JD list. We figured Indian
            students deserved better — and cheaper.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Our <span className="text-gradient">mission</span>
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Every year, over 1.5 million engineering graduates in India compete for a fraction of
              that many good jobs. Most of them write their resume in Word the night before the
              placement window opens, guess what an ATS even is, and walk into interviews having
              never practiced out loud. The students who can afford a ₹50,000 placement coach win.
              The rest are told to &quot;just work harder.&quot;
            </p>
            <p className="text-foreground/90 leading-relaxed mt-4">
              We want to flatten that. PlaceAI gives every Indian engineering student the same
              tools a top-tier placement coach would give them — resume tailoring, ATS analysis,
              mock interviews, referral discovery, and a job tracker that actually understands
              Indian companies — for the price of a Zomato order.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              What makes us <span className="text-gradient">different</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              Three things we obsess over that the rest of the market ignores.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              The <span className="text-gradient">team</span>
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              PlaceAI is a small, distributed team of ex-Flipkart, ex-Razorpay, and ex-startup
              engineers based across Bengaluru, Pune, and Hyderabad. We&apos;ve all sat on the wrong
              side of a placement panel — gotten rejected for things we could&apos;ve fixed with a
              decent tool — and we&apos;re building the company we wished existed in our final year.
            </p>
            <p className="text-foreground/90 leading-relaxed mt-4">
              We&apos;re not VC-fueled or chasing unicorn vanity. We&apos;re profitable, lean, and
              we read every support email ourselves. Want to chat? We genuinely answer at{' '}
              <Link href="/contact" className="text-brand hover:underline">
                support@placeai.in
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Ready to <span className="text-gradient">stop guessing</span>?
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Free forever tier. No credit card. Built for you.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-8 py-4 text-base font-medium text-white hover:bg-brand-dark transition"
          >
            Start your placement prep
          </Link>
        </div>
      </section>
    </>
  );
}
