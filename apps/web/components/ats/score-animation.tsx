'use client';

import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';

const KEYWORDS = [
  { word: 'React', matched: true },
  { word: 'TypeScript', matched: true },
  { word: 'Node.js', matched: true },
  { word: 'PostgreSQL', matched: false },
  { word: 'Redis', matched: false },
  { word: 'Kubernetes', matched: false },
  { word: 'System Design', matched: true },
  { word: 'REST APIs', matched: true },
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#00D4AA' : score >= 50 ? '#FF9500' : '#FF3B30';

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#242430" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="font-mono text-3xl font-bold text-foreground">{score}</span>
        <span className="block text-xs text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
}

export function ScoreAnimation() {
  const [score, setScore] = useState(34);
  const [visibleKeywords, setVisibleKeywords] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(true);
      animate(34, 87, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setScore(Math.round(v)),
      });

      // Reveal keywords progressively
      KEYWORDS.forEach((_, i) => {
        setTimeout(() => setVisibleKeywords(i + 1), i * 220);
      });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Zepto · SDE-I</div>
          <div className="font-medium text-sm text-foreground">ATS Analysis</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>

      {/* Score ring */}
      <div className="flex justify-center mb-6">
        <ScoreRing score={score} />
      </div>

      {/* Keywords */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-muted-foreground mb-2">Keyword Analysis</div>
        <div className="flex flex-wrap gap-1.5">
          {KEYWORDS.slice(0, visibleKeywords).map(({ word, matched }) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                matched
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {matched ? '✓' : '✗'} {word}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {animating && score > 70 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <p className="text-xs text-accent font-medium">
            ✅ Score improved from 34 → 87 after AI optimization
          </p>
        </motion.div>
      )}
    </div>
  );
}
