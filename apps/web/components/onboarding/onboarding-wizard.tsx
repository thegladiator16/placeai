'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, Loader2 } from 'lucide-react';

const TOP_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'NIT Calicut', 'NIT Rourkela',
  'IIIT Hyderabad', 'IIIT Delhi', 'IIIT Lucknow', 'IIIT Allahabad',
  'BITS Pilani', 'BITS Goa', 'BITS Hyderabad',
  'VIT Vellore', 'DTU Delhi', 'NSIT Delhi', 'Jadavpur University', 'Anna University', 'Manipal Institute of Technology',
  'Thapar University', 'SRM Institute', 'PES University', 'Pune University', 'Mumbai University',
];

const TARGET_ROLES = ['Software Engineer', 'SDE-1', 'SDE-2', 'Backend Engineer', 'Frontend Engineer', 'Full Stack Engineer', 'Data Engineer', 'ML Engineer', 'DevOps Engineer', 'Product Manager', 'Data Scientist', 'Data Analyst', 'QA Engineer', 'Mobile Developer'];
const TARGET_COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Zepto', 'CRED', 'Groww', 'PhonePe', 'Swiggy', 'Zomato', 'Razorpay', 'Meesho', 'Dream11', 'Paytm', 'Ola', 'Uber India', 'Adobe India', 'Atlassian', 'Freshworks', 'BrowserStack'];
const CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Remote', 'Anywhere in India'];
const DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'MCA', 'M.Tech', 'MBA', 'BCA', 'Ph.D'];
const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Data Science', 'Artificial Intelligence', 'Mathematics & Computing'];

type FormData = {
  fullName: string;
  phone: string;
  collegeName: string;
  degree: string;
  branch: string;
  graduationYear: string;
  yearsOfExperience: number;
  currentLocation: string;
  targetRoles: string[];
  targetCompanies: string[];
  preferredLocations: string[];
};

function MultiSelect({ label, options, selected, onChange, max = 10 }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void; max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              selected.includes(opt)
                ? 'bg-brand/15 border-brand text-brand'
                : 'bg-card border-border text-muted-foreground hover:border-brand/50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = { initialName: string; initialEmail: string };

const TOTAL_STEPS = 5;

export function OnboardingWizard({ initialName, initialEmail }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: initialName,
    phone: '',
    collegeName: '',
    degree: '',
    branch: '',
    graduationYear: String(new Date().getFullYear() + 1),
    yearsOfExperience: 0,
    currentLocation: '',
    targetRoles: [],
    targetCompanies: [],
    preferredLocations: [],
  });

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  const canNext = () => {
    if (step === 1) return form.fullName.trim().length > 0;
    if (step === 2) return form.collegeName.trim().length > 0 && form.degree.length > 0;
    return true;
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        }),
      });
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!json.success) throw new Error(json.error?.message ?? 'Save failed');
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  const colContainerClasses = 'w-full max-w-xl bg-card border border-border rounded-2xl overflow-hidden shadow-xl';

  return (
    <div className={colContainerClasses}>
      {/* Progress bar */}
      <div className="h-1 bg-border">
        <motion.div
          className="h-full bg-brand"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-8">
        {/* Step header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Step {Math.min(step, 4)} of 4</p>
            <h1 className="text-2xl font-display font-bold text-foreground mt-0.5">
              {step === 1 && 'Welcome! Tell us about yourself'}
              {step === 2 && 'Your education'}
              {step === 3 && 'Your experience'}
              {step === 4 && 'Job preferences'}
              {step === 5 && 'You\'re all set!'}
            </h1>
          </div>
          {step <= 4 && (
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
              {step}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {/* Step 1: Basic info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                  <input value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="Arjun Sharma" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Current City</label>
                  <input value={form.currentLocation} onChange={(e) => update({ currentLocation: e.target.value })} placeholder="Bengaluru" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground">Signing in as <span className="text-foreground">{initialEmail}</span></p>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">College / University *</label>
                  <input
                    list="colleges"
                    value={form.collegeName}
                    onChange={(e) => update({ collegeName: e.target.value })}
                    placeholder="IIT Bombay"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand"
                  />
                  <datalist id="colleges">
                    {TOP_COLLEGES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Degree *</label>
                    <select value={form.degree} onChange={(e) => update({ degree: e.target.value })} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand">
                      <option value="">Select degree</option>
                      {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Branch</label>
                    <select value={form.branch} onChange={(e) => update({ branch: e.target.value })} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand">
                      <option value="">Select branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Graduation Year</label>
                  <select value={form.graduationYear} onChange={(e) => update({ graduationYear: e.target.value })} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-brand">
                    {Array.from({ length: 12 }, (_, i) => 2018 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Years of Experience: <span className="text-brand font-bold">{form.yearsOfExperience}</span></label>
                  <input
                    type="range" min={0} max={10} step={0.5}
                    value={form.yearsOfExperience}
                    onChange={(e) => update({ yearsOfExperience: parseFloat(e.target.value) })}
                    className="w-full accent-brand"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Fresher</span><span>10+ years</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  {form.yearsOfExperience === 0 ? 'No prior work experience — that\'s totally fine!' :
                   form.yearsOfExperience <= 2 ? 'Early career — internships and projects matter most.' :
                   form.yearsOfExperience <= 5 ? 'Mid-level — focus on impact and leadership.' :
                   'Senior — highlight architecture and team contributions.'}
                </p>
                <div className="bg-card border border-border/50 rounded-xl p-4 text-sm text-muted-foreground">
                  <p>You'll add your full work history inside the Resume Builder after onboarding.</p>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="space-y-5">
                <MultiSelect label="Target Roles (pick up to 5)" options={TARGET_ROLES} selected={form.targetRoles} onChange={(v) => update({ targetRoles: v })} max={5} />
                <MultiSelect label="Dream Companies (pick up to 10)" options={TARGET_COMPANIES} selected={form.targetCompanies} onChange={(v) => update({ targetCompanies: v })} max={10} />
                <MultiSelect label="Preferred Locations" options={CITIES} selected={form.preferredLocations} onChange={(v) => update({ preferredLocations: v })} max={5} />
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-foreground">Welcome, <span className="font-semibold text-brand">{form.fullName}</span>!</p>
                  <p className="text-muted-foreground text-sm mt-2">Upload your resume to get your first ATS score and start tracking applications.</p>
                </div>
                <button
                  onClick={() => router.push('/resume')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload My Resume
                </button>
                <button onClick={() => router.push('/dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Skip for now, go to dashboard →
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step <= 4 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-0 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2">
              {step >= 3 && step <= 4 && (
                <button onClick={() => { if (step === 4) void submit(); else setStep((s) => s + 1); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-2">
                  Skip
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 4) void submit();
                  else setStep((s) => s + 1);
                }}
                disabled={!canNext() || saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step === 4 ? (saving ? 'Saving…' : 'Get Started') : 'Continue'}
                {!saving && step < 4 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
}
