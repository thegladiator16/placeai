import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-8xl font-display font-bold text-brand/20 select-none">404</div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
