import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://placeai.in'),
  title: {
    default: 'PlaceAI — India\'s AI Placement Copilot',
    template: '%s | PlaceAI',
  },
  description:
    'AI-powered resume optimization, ATS analysis, referral discovery, and interview prep built for Indian engineers. From ₹299/month.',
  keywords: [
    'resume builder India',
    'ATS resume checker India',
    'placement preparation',
    'job referral India',
    'interview preparation',
    'AI resume optimizer',
  ],
  authors: [{ name: 'PlaceAI' }],
  creator: 'PlaceAI',
  publisher: 'PlaceAI',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://placeai.in',
    siteName: 'PlaceAI',
    title: 'PlaceAI — India\'s AI Placement Copilot',
    description:
      'End-to-end AI placement copilot for Indian engineers. Resume → ATS → Referral → Interview. From ₹299/month.',
    images: [{ url: '/og/home.png', width: 1200, height: 630, alt: 'PlaceAI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlaceAI — India\'s AI Placement Copilot',
    description: 'End-to-end AI placement copilot for Indian engineers.',
    images: ['/og/home.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://placeai.in' },
};

export const viewport: Viewport = {
  themeColor: '#6C47FF',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
