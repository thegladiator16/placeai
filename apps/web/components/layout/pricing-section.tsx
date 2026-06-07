'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/payments/plans';
import { cn } from '@/lib/utils/cn';

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const tiers = (['free', 'starter', 'pro', 'elite'] as const).map((t) => PLANS[t]);

  return (
    <section className="py-20 px-4 border-t border-border/50" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Priced for <span className="text-gradient">Indian students</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Not $49/month. Not $99/month. Just ₹299.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={cn('text-sm', !annual ? 'text-foreground' : 'text-muted-foreground')}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual((v) => !v)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                annual ? 'bg-brand' : 'bg-secondary',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  annual ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
            <span className={cn('text-sm', annual ? 'text-foreground' : 'text-muted-foreground')}>
              Annual <span className="text-accent font-medium">Save 30%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((plan) => {
            const price = annual ? plan.priceAnnual / 12 / 100 : plan.priceMonthly / 100;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative bg-card border rounded-xl p-6 flex flex-col',
                  plan.isPopular ? 'border-brand shadow-lg shadow-brand/10' : 'border-border',
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                  <div className="mt-4">
                    {price === 0 ? (
                      <span className="text-3xl font-mono font-bold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-mono font-bold text-foreground">
                          ₹{Math.round(price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted-foreground text-sm">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.tier === 'free' ? '/sign-up' : `/upgrade?plan=${plan.id}&interval=${annual ? 'annual' : 'monthly'}`}
                  className={cn(
                    'block text-center py-2.5 rounded-lg text-sm font-medium transition-colors',
                    plan.isPopular
                      ? 'bg-brand text-white hover:bg-brand-dark'
                      : 'border border-border text-foreground hover:border-brand/50',
                  )}
                >
                  {plan.tier === 'free' ? 'Get Started Free' : `Get ${plan.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All prices in INR. 7-day free trial on Pro. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
