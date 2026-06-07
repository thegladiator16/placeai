import { db } from './client';
import { alumniIndex } from './schema';

const COMPANIES = [
  'Zepto', 'CRED', 'Groww', 'PhonePe', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay',
  'Meesho', 'Dream11', 'Paytm', 'Ola', 'Uber India', 'Google India', 'Microsoft India',
  'Amazon India', 'Adobe India', 'Atlassian', 'Freshworks', 'BrowserStack',
];

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'NIT Trichy', 'NIT Warangal', 'IIIT Hyderabad', 'IIIT Delhi', 'IIIT Lucknow',
  'BITS Pilani', 'VIT Vellore', 'DTU', 'NSIT', 'Jadavpur University',
  'Anna University', 'Manipal Institute of Technology', 'Thapar University', 'SRM Institute', 'PES University',
];

const ROLES: Record<string, string[]> = {
  'Zepto': ['Software Engineer', 'Senior SDE', 'Backend Engineer', 'Data Engineer', 'SDE-2'],
  'CRED': ['Software Engineer', 'Senior SDE', 'Backend Engineer', 'Frontend Engineer', 'Platform Engineer'],
  'Groww': ['SDE-2', 'Backend Engineer', 'Mobile Developer', 'Data Scientist', 'Product Manager'],
  'PhonePe': ['Software Engineer', 'SDE-2', 'Senior Engineer', 'Data Engineer', 'ML Engineer'],
  'Flipkart': ['SDE-1', 'SDE-2', 'SDE-3', 'Data Scientist', 'Product Manager', 'SRE'],
  'Swiggy': ['Backend Engineer', 'SDE-2', 'Senior SDE', 'Data Engineer', 'ML Engineer'],
  'Zomato': ['Software Engineer', 'Backend Engineer', 'Frontend Engineer', 'Data Engineer', 'SDE-2'],
  'Razorpay': ['SDE-2', 'Backend Engineer', 'Platform Engineer', 'Security Engineer', 'SDE-3'],
  'Meesho': ['SDE-1', 'SDE-2', 'Backend Engineer', 'Android Developer', 'Data Scientist'],
  'Dream11': ['SDE-2', 'Backend Engineer', 'ML Engineer', 'Data Engineer', 'Senior SDE'],
  'Paytm': ['SDE-2', 'Backend Engineer', 'Full Stack Engineer', 'Data Engineer', 'DevOps Engineer'],
  'Ola': ['SDE-2', 'Backend Engineer', 'ML Engineer', 'Senior SDE', 'Platform Engineer'],
  'Uber India': ['SDE-2', 'Senior SDE', 'Backend Engineer', 'ML Engineer', 'SRE'],
  'Google India': ['Software Engineer L4', 'Senior SWE L5', 'Staff Engineer', 'SRE', 'PM'],
  'Microsoft India': ['SDE-2', 'Senior SDE', 'SDE-3', 'PM', 'Data Scientist'],
  'Amazon India': ['SDE-2', 'SDE-3', 'Senior SDE', 'TPM', 'ML Engineer'],
  'Adobe India': ['MTS-2', 'Senior MTS', 'Staff Engineer', 'Data Scientist', 'PM'],
  'Atlassian': ['Software Engineer L4', 'Senior SWE', 'Staff SWE', 'SRE', 'PM'],
  'Freshworks': ['SDE-2', 'Senior SDE', 'Backend Engineer', 'SRE', 'Product Engineer'],
  'BrowserStack': ['SDE-2', 'Backend Engineer', 'Platform Engineer', 'QA Automation', 'DevOps'],
};

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mathematics & Computing'];

const FIRST_NAMES = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Deepika', 'Karan', 'Meera', 'Aditya', 'Kavya', 'Siddharth', 'Nisha', 'Tanmay', 'Divya', 'Ayush', 'Pooja', 'Nikhil', 'Shreya', 'Aman', 'Riya', 'Varun', 'Ishita', 'Harsh', 'Aditi', 'Mayank', 'Swati', 'Gaurav', 'Ritika'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Mehta', 'Joshi', 'Nair', 'Reddy', 'Agarwal', 'Mishra', 'Shah', 'Kaur', 'Iyer', 'Rao', 'Bhat', 'Pillai', 'Srivastava', 'Pandey'];

function normalize(college: string) {
  return college.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randYear() {
  return 2015 + Math.floor(Math.random() * 10);
}

export async function seedAlumni() {
  const entries: typeof alumniIndex.$inferInsert[] = [];

  // Generate 500 alumni entries, distributed across colleges and companies
  for (let i = 0; i < 500; i++) {
    const college = rand(COLLEGES);
    const company = rand(COMPANIES);
    const roles = ROLES[company] ?? ['Software Engineer'];
    const firstName = rand(FIRST_NAMES);
    const lastName = rand(LAST_NAMES);
    const gradYear = randYear();
    const branch = rand(BRANCHES);
    const linkedinHandle = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 9999)}`;

    entries.push({
      collegeName: college,
      collegeNormalized: normalize(college),
      personName: `${firstName} ${lastName}`,
      linkedinUrl: `https://linkedin.com/in/${linkedinHandle}`,
      currentCompany: company,
      currentRole: rand(roles),
      graduationYear: gradYear,
      branch,
      isVerified: false,
      dataSource: 'seed',
    });
  }

  // Insert in batches of 50
  for (let i = 0; i < entries.length; i += 50) {
    await db.insert(alumniIndex).values(entries.slice(i, i + 50)).onConflictDoNothing();
  }

  console.warn(`Seeded ${entries.length} alumni entries.`);
}

if (require.main === module) {
  seedAlumni().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}
