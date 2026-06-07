const FAQS = [
  { q: 'Is PlaceAI really free to start?', a: 'Yes. No credit card required. You get 3 ATS analyses, 5 AI rewrites, and 2 mock interviews free — no strings attached.' },
  { q: 'How accurate is the ATS score?', a: "Our ATS engine is trained on Indian tech company hiring patterns including Workday, Greenhouse, Naukri RMS, and Freshteam. We target >85% correlation with actual ATS outcomes." },
  { q: "Does it work for non-IIT colleges?", a: "Absolutely. PlaceAI is built for all Indian engineering colleges — NITs, IIITs, state colleges, and private universities. The referral discovery engine covers 500+ colleges." },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your settings. No cancellation fees. Annual plans are refunded pro-rata if cancelled within 30 days.' },
  { q: 'Is my resume data safe?', a: 'Your resume is stored encrypted in Cloudflare R2 with a private, non-guessable URL. We never sell or share your data. DPDPA compliant.' },
  { q: 'Does this work for non-tech roles?', a: 'Phase 1 is optimized for software engineering, data science, and PM roles at Indian tech companies. Non-tech support is on our roadmap.' },
] as const;

export function FAQSection() {
  return (
    <section className="py-20 px-4 border-t border-border/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-2">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
