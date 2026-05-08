/* ═══════════════════════════════════════════════════════
   MANNERS — Loading Screen
   Jet black X on off-white bg, expands to reveal site
   Slower animation, no progress bar
   ═══════════════════════════════════════════════════════ */

import { useEffect, useState, useRef, useCallback } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'hold' | 'expanding' | 'revealing' | 'done'>('hold');
  const startTime = useRef(Date.now());
  const holdDuration = 2200; // hold the X for 2.2s

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Hold the X visible, then start expanding
    const holdTimer = setTimeout(() => {
      setPhase('expanding');
    }, holdDuration);

    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase === 'expanding') {
      // X expands to screen borders over 900ms
      const timer = setTimeout(() => setPhase('revealing'), 900);
      return () => clearTimeout(timer);
    }
    if (phase === 'revealing') {
      // Fade out over 800ms
      const timer = setTimeout(() => {
        setPhase('done');
        handleComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, handleComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`loader ${phase === 'revealing' ? 'loader--revealing' : ''}`}>
      <div className="loader__bg" />
      
      <div className={`loader__x-container ${phase === 'expanding' ? 'loader__x-container--expanding' : ''}`}>
        <div className="loader__x">
          <div className={`loader__stroke loader__stroke--1 ${phase === 'expanding' ? 'loader__stroke--expand' : ''}`} />
          <div className={`loader__stroke loader__stroke--2 ${phase === 'expanding' ? 'loader__stroke--expand' : ''}`} />
        </div>
      </div>
    </div>
  );
}
