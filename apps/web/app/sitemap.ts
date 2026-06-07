import type { MetadataRoute } from 'next';

const BASE_URL = 'https://placeai.in';

const COLLEGES = ['iit-bombay', 'iit-delhi', 'iit-madras', 'nit-trichy', 'nit-warangal', 'iiit-hyderabad', 'iiit-lucknow', 'bits-pilani', 'vit-vellore', 'manipal'];
const COMPANIES = ['zepto', 'cred', 'groww', 'phonepe', 'meesho', 'swiggy', 'flipkart', 'paytm', 'razorpay', 'freshworks'];
const ROLES = ['backend-engineer-fresher', 'frontend-engineer-fresher', 'fullstack-engineer-fresher', 'sde-1-fresher', 'data-scientist-fresher', 'ml-engineer-fresher'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tools/ats-checker`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/tools/resume-score`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/tools/salary-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  const collegePages: MetadataRoute.Sitemap = COLLEGES.map((slug) => ({
    url: `${BASE_URL}/colleges/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const companyPages: MetadataRoute.Sitemap = COMPANIES.map((slug) => ({
    url: `${BASE_URL}/companies/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const interviewPages: MetadataRoute.Sitemap = ROLES.map((slug) => ({
    url: `${BASE_URL}/interview-questions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...collegePages, ...companyPages, ...interviewPages];
}
