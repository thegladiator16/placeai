const TESTIMONIALS = [
  { name: 'Arjun Mehta', college: 'IIT Bombay', company: 'Zepto', quote: 'PlaceAI helped me go from 34 to 89 ATS score in 10 minutes. Got a call from Zepto the next day.', year: '2024' },
  { name: 'Priya Sharma', college: 'NIT Trichy', company: 'CRED', quote: 'The referral discovery feature is insane. Found 3 alumni from my branch at CRED and got referred within 2 days.', year: '2024' },
  { name: 'Rahul Gupta', college: 'IIIT Hyderabad', company: 'PhonePe', quote: 'Mock interviews were spot-on. The AI gave feedback exactly like a real interviewer. Cleared 4 rounds at PhonePe.', year: '2024' },
  { name: 'Sneha Iyer', college: 'IIT Delhi', company: 'Google India', quote: "Paid ₹299 and landed a ₹42LPA offer. Best investment I've made in my career.", year: '2024' },
  { name: 'Kiran Reddy', college: 'VIT Vellore', company: 'Groww', quote: 'Finally a tool built for Indian students. The LinkedIn optimizer + outreach builder got me 8 recruiter responses in a week.', year: '2024' },
  { name: 'Ananya Das', college: 'NIT Warangal', company: 'Flipkart', quote: 'The ATS analysis showed me exactly which keywords I was missing. Applied the fixes and got shortlisted at Flipkart.', year: '2024' },
] as const;

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Students who got <span className="text-gradient">placed</span>
          </h2>
          <p className="text-muted-foreground mt-3">Real results from real students across India.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map(({ name, college, company, quote }) => (
            <div key={name} className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {college} → <span className="text-accent">{company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
