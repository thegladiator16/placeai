import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker',
  description: 'Paste your resume and a job description. Get an instant ATS keyword-match score — no signup needed. Built for Indian engineers.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
