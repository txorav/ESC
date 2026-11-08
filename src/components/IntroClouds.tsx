import React, { useEffect, useRef } from 'react';
import ScrambledText from './reactbits/ScrambledText';
import TextLoop from './reactbits/TextLoop';

const clamp = (val: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, val));

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};


export const IntroClouds: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tableEdgeRef = useRef<HTMLDivElement | null>(null);
  const curtainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const marqueeBridgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId = 0;
    let currentProgress = 0;
    let targetProgress = 0;

    const updateTargetFromScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const scrollableDistance = Math.max(1, section.offsetHeight - viewportHeight);
      targetProgress = clamp(-rect.top / scrollableDistance, 0, 1);
    };

    const renderFrame = () => {
      updateTargetFromScroll();

      const diff = targetProgress - currentProgress;
      currentProgress = Math.abs(diff) < 0.0002 ? targetProgress : currentProgress + diff * 0.14;

      const p = currentProgress;

      /* Phases: 0–.2 table edge lifts · .1–.43 red/blue curtains sweep up to reveal the intro · .26–.74 staggered type · .68–.9 curtains close into the timeline */
      const diveT = smoothstep(0.0, 0.22, p);
      const introRevealT = smoothstep(0.24, 0.36, p);
      const introExitT = smoothstep(0.66, 0.76, p);
      const vanishT = smoothstep(0.84, 0.98, p);

      // 1. Table End Edge transform
      if (tableEdgeRef.current) {
        const edgeLiftVh = diveT * -46;
        const edgeRotateX = diveT * 14;
        tableEdgeRef.current.style.transform = `translate3d(0, ${edgeLiftVh.toFixed(2)}vh, 0) perspective(900px) rotateX(${edgeRotateX.toFixed(2)}deg)`;
        tableEdgeRef.current.style.opacity = `${(1 - smoothstep(0.14, 0.24, p)).toFixed(3)}`;
      }

      // 2. Colour curtains: sweep up over the board, reveal the intro, then close over it into the timeline.
      //    [coverStart, coverEnd, uncoverStart, uncoverEnd]; the last curtain stays (matches the timeline bg).
      const CURTAINS: [number, number, number, number][] = [
        [0.10, 0.26, 0.26, 0.40],
        [0.14, 0.30, 0.30, 0.43],
        [0.68, 0.80, 0.80, 0.92],
        [0.74, 0.88, 2, 3],
      ];
      CURTAINS.forEach(([cs, ce, us, ue], i) => {
        const el = curtainRefs.current[i];
        if (!el) return;
        const top = (1 - smoothstep(cs, ce, p)) * 100;
        const bottom = smoothstep(us, ue, p) * 100;
        el.style.clipPath = `inset(${top.toFixed(2)}% 0 ${bottom.toFixed(2)}% 0)`;
        el.style.visibility = top >= 99.9 || bottom >= 99.9 ? 'hidden' : 'visible';
      });

      // 3. Staggered introduction: each line rises, un-blurs and scales in turn; exits upward.
      if (textLayerRef.current) {
        const kids = textLayerRef.current.querySelectorAll<HTMLElement>('.esc-concise-intro-stream > *');
        kids.forEach((k, i) => {
          const inT = smoothstep(0.26 + i * 0.022, 0.38 + i * 0.022, p);
          const outT = smoothstep(0.62 + i * 0.012, 0.74 + i * 0.012, p);
          const a2 = inT * (1 - outT);
          k.style.opacity = a2.toFixed(3);
          k.style.transform = `translate3d(0, ${((1 - inT) * 9 - outT * 11).toFixed(2)}vh, 0) scale(${(0.96 + inT * 0.04 - outT * 0.05).toFixed(3)})`;
          k.style.filter = a2 < 0.98 ? `blur(${((1 - a2) * 10).toFixed(1)}px)` : 'none';
        });
        textLayerRef.current.style.visibility = introRevealT * (1 - introExitT) <= 0.005 ? 'hidden' : 'visible';
      }

      // Scroll-coupled movement for the single moving marquee banner
      if (marqueeBridgeRef.current) {
        const marqueeScrollShift = -p * 30;
        marqueeBridgeRef.current.style.transform = `translate3d(${marqueeScrollShift.toFixed(2)}vw, 0, 0)`;
      }

      // 4. Sky dissolution
      if (stageRef.current) {
        stageRef.current.style.setProperty('--esc-vanish-progress', vanishT.toFixed(3));
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      data-bg="#111744"
      data-theme="dark"
      className="esc-intro-section"
      aria-label="English Speaking Club Sky Transition and Moving Introduction"
    >
      {/* Discrete Slide Snap Waypoints for Crisp Slide Stops */}
      <div className="esc-slide-snap-rail" aria-hidden="true">
        <div className="esc-slide-snap-point" data-slide="table-to-intro" />
        <div className="esc-slide-snap-point" data-slide="curtain-reveal" />
        <div className="esc-slide-snap-point" data-slide="moving-introduction" />
        <div className="esc-slide-snap-point" data-slide="curtain-close" />
      </div>

      {/* Sticky Full-Viewport Cinematic Stage */}
      <div ref={stageRef} className="esc-intro-stage">
        {/*
          1. THE TABLE END EDGE (Visible, Tangible Mahogany/Oak Rim)
        */}
        <div ref={tableEdgeRef} className="esc-table-bottom-edge" aria-hidden="true">
          <div className="esc-table-top-veneer-lip" />
          <div className="esc-table-carved-bullnose">
            <div className="esc-table-wood-grain" />
            <div className="esc-table-bevel-highlight" />
            <div className="esc-table-brass-corner esc-table-brass-corner--left">
              <span className="esc-brass-rivet" />
              <span className="esc-brass-rivet" />
            </div>
            <div className="esc-table-brass-inlay-center">
              <span className="esc-brass-rivet" />
              <span className="esc-brass-engraving">{'ESC Infinite Table 1 <2017>'}</span>
              <span className="esc-brass-rivet" />
            </div>
            <div className="esc-table-brass-corner esc-table-brass-corner--right">
              <span className="esc-brass-rivet" />
              <span className="esc-brass-rivet" />
            </div>
          </div>
          <div className="esc-table-recessed-apron" />
          <div className="esc-table-under-shadow" />
        </div>

        {/*
          2. THE ONE MOVING TEXT WITH BORDERS AND EVERYTHING — ULTRA CLEAR & LEGIBLE
        */}
        <div className="esc-single-moving-marquee-wrapper" aria-hidden="true">
          <div className="esc-single-moving-marquee-bar">
            <div ref={marqueeBridgeRef} className="esc-marquee-scroll-bridge">
              <div className="esc-single-marquee-continuous">
                <span className="esc-marquee-phrase">
                  / ENGLISH SPEAKING CLUB / EST. 2017 / WHERE VOICES RISE / RHETORIC · DEBATE · LEADERSHIP / CONQUER THE STAGE / DISCOVER YOUR VOICE /
                </span>
                <span className="esc-marquee-phrase">
                  / ENGLISH SPEAKING CLUB / EST. 2017 / WHERE VOICES RISE / RHETORIC · DEBATE · LEADERSHIP / CONQUER THE STAGE / DISCOVER YOUR VOICE /
                </span>
                <span className="esc-marquee-phrase">
                  / ENGLISH SPEAKING CLUB / EST. 2017 / WHERE VOICES RISE / RHETORIC · DEBATE · LEADERSHIP / CONQUER THE STAGE / DISCOVER YOUR VOICE /
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="esc-intro-textloop" aria-hidden="true">
          <TextLoop text="ESC introduction" shape="wave" speed={60} fontSize={56} fontWeight={800} curviness={46} tilt={-5} ribbonColor="#CD202A" ribbonWidth={96} color="#ffffff" edgeFade={0.25} separator="/" />
        </div>

        {/*
          3. CONCISE INTRODUCTION (PURE TEXT ONLY, NOT TOO LONG, NO CUTOFF)
        */}
        <div ref={textLayerRef} className="esc-pure-text-universe">
          <div className="esc-concise-intro-stream">
            <p className="esc-pure-kicker">
              EST. 2017 · THE ENGLISH SPEAKING CLUB
            </p>

            <ScrambledText className="esc-pure-hero-title" radius={110} duration={1.2} speed={0.5} scrambleChars=".:" scrambleColor="#CD202A">
              Where Voices Rise &amp; Leaders Are Forged.
            </ScrambledText>

            <p className="esc-pure-lead-paragraph">
              Founded in the autumn of <strong>2017</strong>, the <strong>English Speaking Club (ESC)</strong> was created with a bold, enduring mission: to break the paralyzing fear of the stage and offer an empowering sanctuary where every speaker discovers clarity, conviction, and resonance. Through parliamentary debate, speech workshops, and studio recordings, we forge articulate minds who speak with courage and shape the future.
            </p>

            <div className="esc-pure-milestones">
              <span className="esc-milestone-item"><strong>8+</strong> Years of Legacy</span>
              <span className="esc-milestone-bullet">/</span>
              <span className="esc-milestone-item"><strong>50+</strong> Championships</span>
              <span className="esc-milestone-bullet">/</span>
              <span className="esc-milestone-item"><strong>1,200+</strong> Mastered Speeches</span>
              <span className="esc-milestone-bullet">/</span>
              <span className="esc-milestone-item"><strong>850+</strong> Transformed Orators</span>
            </div>
          </div>
        </div>

        {/* Colour curtains: the section transitions */}
        <div className="esc-curtains" aria-hidden="true">
          {['#CD202A', '#283FC3', '#CD202A', '#1C1E4B'].map((c, i) => (
            <div key={c + i} ref={(el) => { curtainRefs.current[i] = el; }} className="esc-curtain" style={{ background: c }} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroClouds;
