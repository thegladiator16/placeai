import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';

export const metadata: Metadata = {
  title: 'Blog — PlaceAI',
  description:
    'Placement tips, interview guides, and AI tools for Indian engineering students. From the PlaceAI team.',
};

type Post = {
  category: string;
  gradient: string;
  title: string;
  excerpt: string;
  author: string;
  readMinutes: number;
  date: string;
};

const POSTS: Post[] = [
  {
    category: 'Resume',
    gradient: 'from-brand/30 via-purple-500/20 to-accent/30',
    title: '5 ATS-friendly resume templates for Indian engineers (free download)',
    excerpt:
      'Most resume templates fail Indian-company ATS. We tested 30 of them against Zepto, CRED, and Flipkart parsers — here are the 5 that actually pass.',
    author: 'Aditya Sharma',
    readMinutes: 8,
    date: 'Jun 12, 2026',
  },
  {
    category: 'Interview',
    gradient: 'from-yellow-500/30 via-pink-400/20 to-brand/30',
    title: 'Cracking the Zepto SDE-1 interview: questions asked in 2026',
    excerpt:
      'We collected 142 first-hand interview reports from candidates who interviewed at Zepto in 2026. Here are the patterns, the curveballs, and the 12 questions you must prepare.',
    author: 'Priya Verma',
    readMinutes: 12,
    date: 'Jun 8, 2026',
  },
  {
    category: 'Placement',
    gradient: 'from-accent/30 via-cyan-400/20 to-brand/30',
    title: 'How to find alumni referrals at any Indian tech company',
    excerpt:
      'A referral can 5x your callback rate. But cold-DMing seniors on LinkedIn is awkward. Here is the exact playbook — including DM templates that get replies.',
    author: 'Rohan Mehta',
    readMinutes: 6,
    date: 'Jun 4, 2026',
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            PlaceAI <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Placement tips, interview guides, and AI tools for Indian engineers — straight from the
            team building PlaceAI.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {POSTS.map((post) => (
            <Link
              key={post.title}
              href="/blog"
              className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-brand transition flex flex-col"
            >
              <div className={'relative h-40 bg-gradient-to-br ' + post.gradient}>
                <span className="absolute top-4 left-4 bg-background/80 backdrop-blur text-xs font-medium px-3 py-1 rounded-full text-foreground">
                  {post.category}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display font-semibold text-foreground text-lg leading-snug group-hover:text-brand transition">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readMinutes} min read
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand opacity-0 group-hover:opacity-100 transition">
                  Read post
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Get weekly <span className="text-gradient">placement tips</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            One short email every Sunday. Job market trends, interview questions, and AI prompts you
            can use this week. Unsubscribe anytime.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
