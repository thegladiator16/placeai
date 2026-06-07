import 'dotenv/config';
import { db } from './client';
import { jobs } from './schema';

const COMPANIES = [
  'Zepto', 'CRED', 'Groww', 'PhonePe', 'Flipkart',
  'Swiggy', 'Zomato', 'Razorpay', 'Meesho', 'Dream11',
  'Paytm', 'Ola', 'Google India', 'Microsoft India', 'Amazon India',
  'Adobe India', 'Atlassian', 'Freshworks', 'BrowserStack', 'Postman',
];

const ROLES: Array<{
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  department: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
}> = [
  { title: 'Software Development Engineer - I', department: 'Engineering', experienceMin: 0, experienceMax: 2, salaryMin: 1200000, salaryMax: 2200000, requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'SQL'], preferredSkills: ['Go', 'Kubernetes', 'Kafka'] },
  { title: 'Software Development Engineer - II', department: 'Engineering', experienceMin: 2, experienceMax: 5, salaryMin: 2200000, salaryMax: 4000000, requiredSkills: ['Microservices', 'REST APIs', 'SQL', 'System Design'], preferredSkills: ['AWS', 'Kafka', 'Redis'] },
  { title: 'Senior Software Engineer', department: 'Engineering', experienceMin: 4, experienceMax: 8, salaryMin: 3500000, salaryMax: 6000000, requiredSkills: ['System Design', 'Leadership', 'Microservices', 'Cloud'], preferredSkills: ['Kubernetes', 'Distributed Systems'] },
  { title: 'Frontend Engineer', department: 'Engineering', experienceMin: 1, experienceMax: 4, salaryMin: 1400000, salaryMax: 2800000, requiredSkills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS'], preferredSkills: ['Next.js', 'GraphQL', 'Redux'] },
  { title: 'Backend Engineer', department: 'Engineering', experienceMin: 1, experienceMax: 4, salaryMin: 1500000, salaryMax: 3000000, requiredSkills: ['Python', 'Node.js', 'SQL', 'REST APIs'], preferredSkills: ['Go', 'Kafka', 'Redis', 'AWS'] },
  { title: 'Full Stack Engineer', department: 'Engineering', experienceMin: 2, experienceMax: 5, salaryMin: 1800000, salaryMax: 3500000, requiredSkills: ['React', 'Node.js', 'TypeScript', 'SQL'], preferredSkills: ['Next.js', 'PostgreSQL', 'Docker'] },
  { title: 'Data Engineer', department: 'Data', experienceMin: 1, experienceMax: 4, salaryMin: 1400000, salaryMax: 2800000, requiredSkills: ['Python', 'SQL', 'Spark', 'ETL Pipelines'], preferredSkills: ['Airflow', 'dbt', 'BigQuery'] },
  { title: 'Machine Learning Engineer', department: 'AI/ML', experienceMin: 2, experienceMax: 5, salaryMin: 2000000, salaryMax: 4500000, requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'ML Algorithms'], preferredSkills: ['MLOps', 'Kubernetes', 'Spark'] },
  { title: 'DevOps Engineer', department: 'Infrastructure', experienceMin: 2, experienceMax: 5, salaryMin: 1800000, salaryMax: 3500000, requiredSkills: ['Kubernetes', 'Docker', 'CI/CD', 'Linux'], preferredSkills: ['Terraform', 'AWS', 'Prometheus'] },
  { title: 'Product Manager', department: 'Product', experienceMin: 2, experienceMax: 6, salaryMin: 2000000, salaryMax: 5000000, requiredSkills: ['Product Strategy', 'Analytics', 'Stakeholder Management', 'PRD Writing'], preferredSkills: ['SQL', 'A/B Testing', 'Jira'] },
];

const WORK_MODES = ['hybrid', 'onsite', 'remote'] as const;
const LOCATIONS = [
  [{ city: 'Bangalore', country: 'India', isRemote: false }],
  [{ city: 'Mumbai', country: 'India', isRemote: false }],
  [{ city: 'Hyderabad', country: 'India', isRemote: false }],
  [{ city: 'Pune', country: 'India', isRemote: false }],
  [{ city: 'Gurgaon', country: 'India', isRemote: false }],
  [{ city: 'Chennai', country: 'India', isRemote: false }],
  [{ country: 'India', isRemote: true }],
];

const DESCRIPTIONS: Record<string, string> = {
  'Software Development Engineer - I': 'Build and ship features on high-scale distributed systems that serve millions of users. You will work closely with senior engineers on challenging backend problems including caching, database optimization, and service reliability.',
  'Software Development Engineer - II': 'Own large technical initiatives end-to-end, from design to production. You will mentor junior engineers, drive architectural decisions, and collaborate with product teams.',
  'Senior Software Engineer': 'Lead technical design across multiple squads. Drive engineering excellence through code reviews, architectural guidance, and cross-team collaboration on infrastructure.',
  'Frontend Engineer': 'Craft pixel-perfect, accessible user interfaces consumed by millions of Indian users. You will own performance budgets, build component libraries, and partner with designers.',
  'Backend Engineer': 'Design and build APIs and services that power our core product flows. Own reliability, observability, and performance for critical payment and ordering systems.',
  'Full Stack Engineer': 'Work across the entire stack — from React frontends to Go/Node backends to PostgreSQL schemas. Ship features independently and collaborate with designers and product managers.',
  'Data Engineer': 'Build the data pipelines that power our analytics and ML models. Own ingestion, transformation, and data quality for petabyte-scale datasets.',
  'Machine Learning Engineer': 'Build production ML systems that personalize our product experience. Own the full ML lifecycle from experimentation to deployment and monitoring.',
  'DevOps Engineer': 'Own our Kubernetes-based infrastructure, CI/CD pipelines, and observability stack. Drive uptime and enable engineering teams to ship faster with confidence.',
  'Product Manager': 'Own a product area end-to-end — from discovery and prioritization to launch and growth. Partner with engineering, design, and data teams to build products users love.',
};

async function seedJobs(): Promise<void> {
  console.warn('Seeding 50 jobs...');

  const jobRecords = [];
  let idx = 0;
  for (const company of COMPANIES) {
    const role = ROLES[idx % ROLES.length]!;
    const role2 = ROLES[(idx + 3) % ROLES.length]!;
    const workMode = WORK_MODES[idx % WORK_MODES.length]!;
    const location = LOCATIONS[idx % LOCATIONS.length]!;
    const daysAgo = (idx % 14) + 1;
    const postedAt = new Date(Date.now() - daysAgo * 86400000);

    jobRecords.push({
      title: role.title,
      companyName: company,
      source: 'manual' as const,
      description: DESCRIPTIONS[role.title] ?? 'Join our engineering team and build at scale.',
      requirements: `• ${role.experienceMin}-${role.experienceMax} years of experience\n• Strong fundamentals in ${role.requiredSkills.slice(0, 3).join(', ')}\n• B.Tech / M.Tech in CS or related field`,
      responsibilities: `• Design and implement new features\n• Write clean, maintainable code\n• Participate in code reviews\n• Collaborate with cross-functional teams`,
      requiredSkills: role.requiredSkills,
      preferredSkills: role.preferredSkills,
      keywords: [...role.requiredSkills, ...role.preferredSkills],
      department: role.department,
      experienceMin: role.experienceMin as unknown as number,
      experienceMax: role.experienceMax as unknown as number,
      salaryMin: role.salaryMin,
      salaryMax: role.salaryMax,
      salaryCurrency: 'INR',
      workMode,
      employmentType: 'full_time',
      locations: location,
      isActive: true,
      postedAt,
      companyStage: idx < 10 ? 'series_e' : idx < 15 ? 'public' : 'series_c',
      companySize: '1000+',
      industry: idx < 5 ? 'Quick Commerce' : idx < 10 ? 'Fintech' : idx < 15 ? 'Technology' : 'SaaS',
    });

    jobRecords.push({
      title: role2.title,
      companyName: company,
      source: 'manual' as const,
      description: DESCRIPTIONS[role2.title] ?? 'Join our team and build great products.',
      requirements: `• ${role2.experienceMin}-${role2.experienceMax} years of experience\n• Proficiency in ${role2.requiredSkills.slice(0, 3).join(', ')}\n• Strong problem-solving skills`,
      responsibilities: `• Own features from ideation to launch\n• Write production-quality code\n• Mentor junior engineers\n• Participate in on-call rotation`,
      requiredSkills: role2.requiredSkills,
      preferredSkills: role2.preferredSkills,
      keywords: [...role2.requiredSkills, ...role2.preferredSkills],
      department: role2.department,
      experienceMin: role2.experienceMin as unknown as number,
      experienceMax: role2.experienceMax as unknown as number,
      salaryMin: role2.salaryMin,
      salaryMax: role2.salaryMax,
      salaryCurrency: 'INR',
      workMode: WORK_MODES[(idx + 1) % WORK_MODES.length]!,
      employmentType: 'full_time',
      locations: LOCATIONS[(idx + 2) % LOCATIONS.length]!,
      isActive: true,
      postedAt: new Date(Date.now() - ((idx % 7) + 1) * 86400000),
      companyStage: idx < 10 ? 'series_e' : 'public',
      companySize: '1000+',
      industry: idx < 10 ? 'Fintech' : 'Technology',
    });

    idx++;
    if (jobRecords.length >= 50) break;
  }

  const toInsert = jobRecords.slice(0, 50);

  for (let i = 0; i < toInsert.length; i += 10) {
    const batch = toInsert.slice(i, i + 10);
    await db.insert(jobs).values(batch).onConflictDoNothing();
  }

  console.warn(`Seeded ${toInsert.length} jobs`);
  process.exit(0);
}

seedJobs().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
