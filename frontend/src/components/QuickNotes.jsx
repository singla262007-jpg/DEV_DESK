import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PenTool, Lightbulb, Keyboard, Quote } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "Focus is a muscle. The more you protect your attention, the stronger it gets.", author: "Cal Newport" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
];

export default function QuickNotes() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('pulse_quick_notes') || '';
  });
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('pulse_quick_notes', note);
  }, [note]);

  // Rotate quote every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {/* Quick Scratchpad */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontSize: '0.9rem' }}>
            <PenTool size={15} color="var(--accent-violet)" />
            Flow Scratchpad (Brain Dump)
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Auto-saves</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Capture quick thoughts, phone numbers, meeting takeaways, or fleeting ideas here..."
          rows={3}
          style={{
            width: '100%',
            background: 'oklch(0.15 0.02 250 / 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            color: 'var(--text-main)',
          }}
        />
      </div>

      {/* Quote & Productivity Tip */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Quote size={15} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Daily Spark</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
            "{currentQuote.text}"
          </p>
          <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            — {currentQuote.author}
          </span>
        </div>

        {/* Keyboard shortcut hint */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            color: 'var(--text-faint)',
          }}
        >
          <Keyboard size={13} />
          <span>Pro tip: Maintain deep focus in 25 or 50 minute blocks to avoid context switching fatigue.</span>
        </div>
      </div>
    </div>
  );
}
