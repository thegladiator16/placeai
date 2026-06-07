import type { Metadata } from 'next';
import { HeroSection } from '@/components/layout/hero-section';
import { FeaturesSection } from '@/components/layout/features-section';
import { PricingSection } from '@/components/layout/pricing-section';
import { TestimonialsSection } from '@/components/layout/testimonials-section';
import { FAQSection } from '@/components/layout/faq-section';
import { CTASection } from '@/components/layout/cta-section';

export const metadata: Metadata = {
  title: 'PlaceAI — India\'s AI Placement Copilot',
  description:
    'AI-powered resume optimization, ATS analysis, referral discovery & interview prep for Indian engineers. ₹299/month. Start free.',
  alternates: { canonical: 'https://placeai.in' },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
