/**
 * Pure-typography scroll experience for the stats flow.
 * One tall track, one sticky stage. Scrolling morphs the number from one
 * measure to the next while the label and eyebrow slide through masks.
 * All motion is driven directly from scroll progress (no re-renders).
 */
import React, { useEffect, useRef } from 'react';
import type { StatsSectionProps } from './types';
import { MEASURES } from './measuresData';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const HOLD = 0.55; // fraction of each step spent holding still before the next transition

export const StatsSection: React.FC<StatsSectionProps> = ({
  measures = MEASURES,
  id = 'stats-flow',
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const N = measures.length;

  useEffect(() => {
    let raf = 0;
    const render = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track) return;
      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const entry = clamp(1 - rect.top / vh); // 0 → 1 while the stage scrolls in
      const f = clamp(-rect.top / vh, 0, N - 1); // continuous step index
      const i0 = Math.min(N - 1, Math.floor(f));
      const frac = f - i0;
      const tr = i0 >= N - 1 ? 0 : easeInOut(clamp((frac - HOLD) / (1 - HOLD)));
      const a = measures[i0];
      const b = measures[Math.min(N - 1, i0 + 1)];

      // Number: counts up on entry, then rolls from one value to the next.
      let value = a.target + (b.target - a.target) * tr;
      if (i0 === 0 && f < 0.001) value = a.target * easeOut(entry);
      const suffix = tr > 0.5 ? b.suffix : a.suffix;
      if (numRef.current) {
        numRef.current.textContent = `${Math.round(value).toLocaleString()}${suffix}`;
        // squash + blur mid-transition for a kinetic "mechanical" feel
        const mid = Math.sin(tr * Math.PI);
        numRef.current.style.transform = `translateY(${(-mid * 4).toFixed(2)}vh) scaleY(${(1 + mid * 0.08).toFixed(3)})`;
        numRef.current.style.filter = mid > 0.02 ? `blur(${(mid * 5).toFixed(1)}px)` : 'none';
      }

      measures.forEach((_, i) => {
        // enter progress (from previous transition) and exit progress (own transition)
        const enter = i === 0 ? easeOut(entry) : i === i0 + 1 ? tr : i <= i0 ? 1 : 0;
        const exit = i === i0 ? tr : i < i0 ? 1 : 0;
        const vis = i === i0 || i === i0 + 1 || (i === 0 && i0 === 0);
        const apply = (el: HTMLElement | null, lag: number, dist = 1) => {
          if (!el) return;
          const e2 = clamp(enter * (1 + lag) - lag);
          const x2 = clamp(exit * (1 + lag) - lag * 0);
          el.style.transform = `translateY(${((1 - e2) * 105 - x2 * 105 * dist).toFixed(2)}%)`;
          el.style.opacity = String(vis ? clamp(e2 * (1 - x2)) : 0);
        };
        apply(labelRefs.current[i], 0.25);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };
    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measures, N]);

  return (
    <div className={`stats-master-flow ${className}`.trim()} id={id}>
      <div ref={trackRef} className="stats-type-track" style={{ height: `${N * 100}vh` }}>
        {/* invisible waypoints: they drive the page-wide background colour shift + nav highlight */}
        <div className="stats-type-waypoints" aria-hidden="true">
          {measures.map((m, i) => (
            <section
              key={m.id}
              id={i === 0 ? 'stats' : `measure-${m.id}`}
              data-bg={m.bg}
              data-theme={m.theme || 'dark'}
              className="stats-type-waypoint"
            />
          ))}
        </div>

        <div className="stats-type-stage">
          <h2 className="stats-type-number" aria-live="off">
            <span ref={numRef}>0</span>
          </h2>

          <div className="stats-type-labels">
            {measures.map((m, i) => (
              <span key={m.id} className="stats-type-mask">
                <span ref={(el) => { labelRefs.current[i] = el; }} className="stats-type-label">{m.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
