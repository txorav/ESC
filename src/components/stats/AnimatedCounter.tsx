/**
 * @file AnimatedCounter.tsx
 * Accessible, performant smooth numeric counter with cubic easing and reduced-motion support.
 */

import React, { useEffect, useState, useRef } from 'react';
import type { AnimatedCounterProps } from './types';

function checkPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * AnimatedCounter renders a numeric value that animates from 0 to `target`
 * with a cubic ease-out curve when `active` becomes true.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  prefix = '',
  suffix = '',
  duration = 1400,
  active = true,
  formatter,
  className,
}) => {
  // If user prefers reduced motion or duration is 0, start immediately at target
  const [val, setVal] = useState<number>(() => {
    if (checkPrefersReducedMotion() || duration <= 0) {
      return target;
    }
    return 0;
  });

  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!active) return;

    if (animatedRef.current) {
      setVal(target);
      return;
    }

    if (checkPrefersReducedMotion() || duration <= 0) {
      animatedRef.current = true;
      setVal(target);
      return;
    }

    animatedRef.current = true;
    const startTime = performance.now();
    const handles = {
      rafId: 0,
      timeoutId: null as ReturnType<typeof setTimeout> | null,
    };

    const step = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      // Smooth cubic ease out: 1 - (1 - p)^3
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));

      if (p < 1) {
        handles.rafId = requestAnimationFrame(step);
      } else {
        setVal(target);
        if (handles.timeoutId !== null) {
          clearTimeout(handles.timeoutId);
          handles.timeoutId = null;
        }
      }
    };

    handles.rafId = requestAnimationFrame(step);

    handles.timeoutId = setTimeout(() => {
      setVal(target);
      handles.timeoutId = null;
    }, duration + 50);

    return () => {
      cancelAnimationFrame(handles.rafId);
      if (handles.timeoutId !== null) {
        clearTimeout(handles.timeoutId);
        handles.timeoutId = null;
      }
    };
  }, [active, target, duration]);

  const formattedValue = formatter ? formatter(val) : val.toLocaleString();

  return (
    <span
      className={className}
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
