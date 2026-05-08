/* ═══════════════════════════════════════════════════════
   MANNERS — Loading Screen
   Static X on off-white, then dips down to reveal site
   ═══════════════════════════════════════════════════════ */

import { useEffect, useState, useCallback } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'hold' | 'dip' | 'done'>('hold');

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Hold the X for 1.8s, then dip
    const timer = setTimeout(() => setPhase('dip'), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'dip') {
      // Dip animation takes 500ms, then done
      const timer = setTimeout(() => {
        setPhase('done');
        handleComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, handleComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`loader ${phase === 'dip' ? 'loader--dip' : ''}`}>
      <div className="loader__bg" />
      <div className="loader__x-container">
        <div className="loader__x">
          <div className="loader__stroke loader__stroke--1" />
          <div className="loader__stroke loader__stroke--2" />
        </div>
      </div>
    </div>
  );
}
