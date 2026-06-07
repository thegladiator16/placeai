import 'dotenv/config';
import { db } from './client';
import { users, companies, jobs, resumes, jobApplications } from './schema';

const SEED_COMPANIES = [
  { name: 'Zepto', slug: 'zepto', industry: 'Quick Commerce', stage: 'series_e', sizeRange: '1000+', atsSystem: 'greenhouse', isHiring: true, tags: ['unicorn', 'startup', 'product'] },
  { name: 'CRED', slug: 'cred', industry: 'Fintech', stage: 'series_f', sizeRange: '1000+', atsSystem: 'greenhouse', isHiring: true, tags: ['unicorn', 'fintech', 'product'] },
  { name: 'Groww', slug: 'groww', industry: 'Fintech', stage: 'series_f', sizeRange: '1000+', atsSystem: 'workday', isHiring: true, tags: ['unicorn', 'fintech'] },
  { name: 'PhonePe', slug: 'phonepe', industry: 'Payments', stage: 'growth', sizeRange: '1000+', atsSystem: 'workday', isHiring: true, tags: ['unicorn', 'payments'] },
  { name: 'Google India', slug: 'google-india', industry: 'Technology', stage: 'public', sizeRange: '1000+', atsSystem: 'workday', isHiring: true, tags: ['FAANG', 'mnc'] },
];

const SEED_JOBS = [
  { title: 'Software Development Engineer - I', companyName: 'Zepto', source: 'manual', description: 'Build scalable backend systems for our quick commerce platform. Tech stack: Go, Kubernetes, PostgreSQL, Redis, Kafka.', requiredSkills: ['Go', 'Kubernetes', 'PostgreSQL', 'Redis', 'Kafka', 'REST APIs'], experienceMin: 0, experienceMax: 2, salaryMin: 1200000, salaryMax: 2000000, workMode: 'hybrid', employmentType: 'full_time' },
  { title: 'Backend Engineer', companyName: 'CRED', source: 'manual', description: 'Design and build robust payment processing systems. We use Python, Django, Celery, PostgreSQL, and AWS.', requiredSkills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Celery', 'REST APIs'], experienceMin: 1, experienceMax: 3, salaryMin: 1500000, salaryMax: 2500000, workMode: 'hybrid', employmentType: 'full_time' },
  { title: 'Frontend Engineer', companyName: 'Groww', source: 'manual', description: 'Build consumer-facing investment products used by 10M+ users. Tech: React, TypeScript, Next.js.', requiredSkills: ['React', 'TypeScript', 'Next.js', 'JavaScript', 'HTML', 'CSS'], experienceMin: 1, experienceMax: 3, salaryMin: 1400000, salaryMax: 2200000, workMode: 'onsite', employmentType: 'full_time' },
  { title: 'Full Stack Engineer', companyName: 'PhonePe', source: 'manual', description: 'Work on merchant payment products. Stack: Java, Spring Boot, React, MySQL.', requiredSkills: ['Java', 'Spring Boot', 'React', 'MySQL', 'Microservices'], experienceMin: 2, experienceMax: 5, salaryMin: 2000000, salaryMax: 3500000, workMode: 'onsite', employmentType: 'full_time' },
  { title: 'Software Engineer L3', companyName: 'Google India', source: 'manual', description: 'Work on Google Search ranking and indexing infrastructure at scale.', requiredSkills: ['C++', 'Python', 'Distributed Systems', 'Algorithms', 'Data Structures'], experienceMin: 2, experienceMax: 5, salaryMin: 4000000, salaryMax: 8000000, workMode: 'hybrid', employmentType: 'full_time' },
];

async function seed(): Promise<void> {
  console.warn('Seeding database...');

  // Seed companies
  const insertedCompanies = await db
    .insert(companies)
    .values(
      SEED_COMPANIES.map((c) => ({
        ...c,
        headquarters: 'Bangalore, India',
        indiaOffices: ['Bangalore'],
      })),
    )
    .onConflictDoNothing()
    .returning();
  console.warn(`Inserted ${insertedCompanies.length} companies`);

  // Seed jobs
  const insertedJobs = await db
    .insert(jobs)
    .values(
      SEED_JOBS.map((j) => ({
        ...j,
        locations: [{ city: 'Bangalore', country: 'India', isRemote: false }],
        postedAt: new Date(),
      })),
    )
    .returning();
  console.warn(`Inserted ${insertedJobs.length} jobs`);

  // Seed test users
  const testUsers = [
    { clerkId: 'clerk_test_free', email: 'free@test.placeai.in', fullName: 'Free User', subscriptionTier: 'free', collegeName: 'IIT Bombay', graduationYear: 2024, degree: 'B.Tech', branch: 'Computer Science', referralCode: 'FREE0001' },
    { clerkId: 'clerk_test_starter', email: 'starter@test.placeai.in', fullName: 'Starter User', subscriptionTier: 'starter', collegeName: 'NIT Trichy', graduationYear: 2023, degree: 'B.Tech', branch: 'Information Technology', referralCode: 'STRT0001' },
    { clerkId: 'clerk_test_pro', email: 'pro@test.placeai.in', fullName: 'Pro User', subscriptionTier: 'pro', collegeName: 'IIIT Hyderabad', graduationYear: 2022, degree: 'B.Tech', branch: 'Computer Science', referralCode: 'PRO00001' },
    { clerkId: 'clerk_test_elite', email: 'elite@test.placeai.in', fullName: 'Elite User', subscriptionTier: 'elite', collegeName: 'IIT Delhi', graduationYear: 2021, degree: 'B.Tech', branch: 'Computer Science', yearsOfExperience: 3, referralCode: 'ELIT0001' },
    { clerkId: 'clerk_test_admin', email: 'admin@test.placeai.in', fullName: 'Admin User', subscriptionTier: 'elite', collegeName: 'IIT Madras', graduationYear: 2018, degree: 'B.Tech', branch: 'Computer Science', yearsOfExperience: 6, referralCode: 'ADMN0001' },
  ] as const;

  const insertedUsers = await db
    .insert(users)
    .values(testUsers.map((u) => ({ ...u, onboardingCompleted: true })))
    .onConflictDoNothing()
    .returning();
  console.warn(`Inserted ${insertedUsers.length} users`);

  const [freeUser] = insertedUsers;
  if (freeUser) {
    // Seed a sample resume
    await db
      .insert(resumes)
      .values({
        userId: freeUser.id,
        title: 'My Primary Resume',
        isPrimary: true,
        personalInfo: {
          name: 'Free User',
          email: 'free@test.placeai.in',
          phone: '+91 9876543210',
          linkedin: 'linkedin.com/in/freeuser',
          github: 'github.com/freeuser',
          location: 'Bangalore, India',
        },
        education: [
          {
            institution: 'IIT Bombay',
            degree: 'B.Tech',
            branch: 'Computer Science',
            gpa: '8.5',
            startDate: '2020-07',
            endDate: '2024-05',
          },
        ],
        experience: [],
        projects: [
          {
            name: 'PlaceAI Clone',
            description: 'Built an AI-powered resume optimizer',
            technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
            bullets: ['Implemented ATS scoring algorithm', 'Reduced time-to-hire by 30%'],
          },
        ],
        skills: {
          languages: ['Python', 'JavaScript', 'TypeScript', 'Java'],
          frameworks: ['React', 'Next.js', 'Node.js', 'Django'],
          tools: ['Git', 'Docker', 'Kubernetes'],
          databases: ['PostgreSQL', 'Redis', 'MongoDB'],
          cloud: ['AWS', 'GCP'],
        },
        status: 'active',
        atsScore: 45,
      })
      .onConflictDoNothing();

    // Seed sample applications
    if (insertedJobs.length > 0) {
      await db
        .insert(jobApplications)
        .values([
          { userId: freeUser.id, jobId: insertedJobs[0]?.id ?? null, companyName: 'Zepto', jobTitle: 'SDE-I', status: 'applied', priority: 'high', appliedAt: new Date() },
          { userId: freeUser.id, jobId: insertedJobs[1]?.id ?? null, companyName: 'CRED', jobTitle: 'Backend Engineer', status: 'saved', priority: 'medium', appliedAt: null },
        ])
        .onConflictDoNothing();
    }
  }

  console.warn('Seed completed successfully!');
  process.exit(0);
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
