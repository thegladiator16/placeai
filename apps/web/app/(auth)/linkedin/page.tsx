import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linkedin',
  robots: { index: false },
};

export default function LinkedinPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold capitalize">linkedin</h1>
      <p className="text-muted-foreground mt-2">Coming soon.</p>
    </div>
  );
}
