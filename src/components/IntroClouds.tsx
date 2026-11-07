import React, { useEffect, useRef } from 'react';
import ScrambledText from './reactbits/ScrambledText';
import TextLoop from './reactbits/TextLoop';

interface CloudPuffSpec {
  ox: number; // X offset (%)
  oy: number; // Y offset (%)
  w: number;  // Width (%)
  h: number;  // Height (%)
  tone: 'crown' | 'lit' | 'mid' | 'base' | 'vapor';
  rot: number;
}

interface CloudActorSpec {
  id: string;
  hemisphere: -1 | 1;
  layer: 'canopy' | 'mid' | 'deep';
  initX: number;       // Initial X in vw (-48 to +48)
  initY: number;       // Initial Y in vh (relative to viewport center)
  widthVw: number;     // Base cloud width in vw
  heightVw: number;    // Base cloud height in vw
  baseScale: number;
  diveLiftVh: number;  // How far UP the cloud rushes during Phase 1 dive
  partDistanceVw: number; // How far OUTWARD the cloud parts during Phase 2
  gatherX: number;     // Target X in vw when clouds gather back in Phase 4
  gatherY: number;     // Target Y in vh when clouds gather back in Phase 4
  gatherScale: number;
  seed: number;
  puffs?: CloudPuffSpec[];
}

const PUFF_PRESETS: CloudPuffSpec[][] = [
  [
    { ox: -26, oy: 10, w: 56, h: 62, tone: 'lit', rot: -6 },
    { ox: -6, oy: -18, w: 64, h: 74, tone: 'crown', rot: 4 },
    { ox: 24, oy: -6, w: 58, h: 66, tone: 'lit', rot: 8 },
    { ox: -34, oy: 24, w: 52, h: 48, tone: 'mid', rot: -4 },
    { ox: 4, oy: 18, w: 78, h: 56, tone: 'base', rot: 0 },
    { ox: 34, oy: 22, w: 50, h: 48, tone: 'mid', rot: 5 },
    { ox: 0, oy: 6, w: 92, h: 64, tone: 'vapor', rot: 0 },
  ],
  [
    { ox: -22, oy: -8, w: 62, h: 70, tone: 'crown', rot: -5 },
    { ox: 16, oy: -16, w: 60, h: 68, tone: 'crown', rot: 6 },
    { ox: -36, oy: 16, w: 50, h: 54, tone: 'lit', rot: -8 },
    { ox: 34, oy: 12, w: 54, h: 56, tone: 'lit', rot: 7 },
    { ox: -8, oy: 22, w: 82, h: 52, tone: 'base', rot: -2 },
    { ox: 18, oy: 26, w: 62, h: 48, tone: 'mid', rot: 3 },
    { ox: -4, oy: 8, w: 96, h: 62, tone: 'vapor', rot: 0 },
  ],
  [
    { ox: 0, oy: -20, w: 68, h: 76, tone: 'crown', rot: 2 },
    { ox: -28, oy: 2, w: 58, h: 62, tone: 'lit', rot: -7 },
    { ox: 28, oy: 4, w: 56, h: 60, tone: 'lit', rot: 6 },
    { ox: -18, oy: 24, w: 64, h: 50, tone: 'mid', rot: -3 },
    { ox: 18, oy: 24, w: 66, h: 52, tone: 'base', rot: 4 },
    { ox: 0, oy: 28, w: 86, h: 46, tone: 'base', rot: 0 },
    { ox: 2, oy: 10, w: 94, h: 66, tone: 'vapor', rot: 0 },
  ],
];

const CLOUD_ACTORS: CloudActorSpec[] = [
  // Upper Canopy Layer (Directly under the mahogany table rim)
  { id: 'c-01', hemisphere: -1, layer: 'canopy', initX: -42, initY: -34, widthVw: 38, heightVw: 21, baseScale: 1.18, diveLiftVh: 86, partDistanceVw: 58, gatherX: -28, gatherY: -22, gatherScale: 1.32, seed: 1.1, puffs: PUFF_PRESETS[0] },
  { id: 'c-02', hemisphere: -1, layer: 'canopy', initX: -18, initY: -38, widthVw: 42, heightVw: 23, baseScale: 1.24, diveLiftVh: 94, partDistanceVw: 66, gatherX: -10, gatherY: -26, gatherScale: 1.38, seed: 2.3, puffs: PUFF_PRESETS[1] },
  { id: 'c-03', hemisphere: 1,  layer: 'canopy', initX: 14,  initY: -36, widthVw: 44, heightVw: 24, baseScale: 1.22, diveLiftVh: 92, partDistanceVw: 68, gatherX: 12,  gatherY: -24, gatherScale: 1.36, seed: 3.7, puffs: PUFF_PRESETS[2] },
  { id: 'c-04', hemisphere: 1,  layer: 'canopy', initX: 40,  initY: -33, widthVw: 38, heightVw: 20, baseScale: 1.16, diveLiftVh: 84, partDistanceVw: 56, gatherX: 30,  gatherY: -20, gatherScale: 1.30, seed: 4.9, puffs: PUFF_PRESETS[0] },
  { id: 'c-05', hemisphere: -1, layer: 'canopy', initX: -4,  initY: -30, widthVw: 46, heightVw: 25, baseScale: 1.28, diveLiftVh: 98, partDistanceVw: 74, gatherX: -2,  gatherY: -16, gatherScale: 1.45, seed: 5.4, puffs: PUFF_PRESETS[2] },

  // Upper-Mid Stratosphere Layer
  { id: 'c-06', hemisphere: -1, layer: 'mid', initX: -46, initY: -12, widthVw: 36, heightVw: 20, baseScale: 1.10, diveLiftVh: 76, partDistanceVw: 52, gatherX: -34, gatherY: -6,  gatherScale: 1.28, seed: 6.2, puffs: PUFF_PRESETS[1] },
  { id: 'c-07', hemisphere: -1, layer: 'mid', initX: -24, initY: -14, widthVw: 40, heightVw: 22, baseScale: 1.16, diveLiftVh: 82, partDistanceVw: 62, gatherX: -16, gatherY: -8,  gatherScale: 1.35, seed: 7.8, puffs: PUFF_PRESETS[0] },
  { id: 'c-08', hemisphere: 1,  layer: 'mid', initX: 2,   initY: -10, widthVw: 44, heightVw: 24, baseScale: 1.20, diveLiftVh: 88, partDistanceVw: 70, gatherX: 4,   gatherY: -4,  gatherScale: 1.42, seed: 8.5, puffs: PUFF_PRESETS[2] },
  { id: 'c-09', hemisphere: 1,  layer: 'mid', initX: 26,  initY: -15, widthVw: 40, heightVw: 22, baseScale: 1.14, diveLiftVh: 80, partDistanceVw: 60, gatherX: 18,  gatherY: -10, gatherScale: 1.34, seed: 9.1, puffs: PUFF_PRESETS[1] },
  { id: 'c-10', hemisphere: 1,  layer: 'mid', initX: 46,  initY: -10, widthVw: 36, heightVw: 20, baseScale: 1.08, diveLiftVh: 74, partDistanceVw: 52, gatherX: 34,  gatherY: -4,  gatherScale: 1.26, seed: 10.3, puffs: PUFF_PRESETS[0] },

  // Core Heart Clouds (Dense center that parts dramatically)
  { id: 'c-11', hemisphere: -1, layer: 'canopy', initX: -34, initY: 8,  widthVw: 42, heightVw: 23, baseScale: 1.22, diveLiftVh: 90, partDistanceVw: 62, gatherX: -26, gatherY: 6,  gatherScale: 1.38, seed: 11.6, puffs: PUFF_PRESETS[2] },
  { id: 'c-12', hemisphere: -1, layer: 'canopy', initX: -12, initY: 6,  widthVw: 48, heightVw: 26, baseScale: 1.30, diveLiftVh: 96, partDistanceVw: 76, gatherX: -8,  gatherY: 4,  gatherScale: 1.48, seed: 12.4, puffs: PUFF_PRESETS[0] },
  { id: 'c-13', hemisphere: 1,  layer: 'canopy', initX: 12,  initY: 8,  widthVw: 48, heightVw: 26, baseScale: 1.30, diveLiftVh: 95, partDistanceVw: 76, gatherX: 8,   gatherY: 6,  gatherScale: 1.48, seed: 13.9, puffs: PUFF_PRESETS[1] },
  { id: 'c-14', hemisphere: 1,  layer: 'canopy', initX: 36,  initY: 10, widthVw: 42, heightVw: 23, baseScale: 1.20, diveLiftVh: 88, partDistanceVw: 62, gatherX: 26,  gatherY: 8,  gatherScale: 1.36, seed: 14.2, puffs: PUFF_PRESETS[2] },

  // Lower-Mid Billows (Rise from below as you dive into the sky)
  { id: 'c-15', hemisphere: -1, layer: 'mid', initX: -44, initY: 28, widthVw: 38, heightVw: 21, baseScale: 1.12, diveLiftVh: 82, partDistanceVw: 56, gatherX: -32, gatherY: 18, gatherScale: 1.30, seed: 15.7, puffs: PUFF_PRESETS[0] },
  { id: 'c-16', hemisphere: -1, layer: 'mid', initX: -20, initY: 26, widthVw: 44, heightVw: 24, baseScale: 1.18, diveLiftVh: 86, partDistanceVw: 66, gatherX: -14, gatherY: 16, gatherScale: 1.38, seed: 16.5, puffs: PUFF_PRESETS[1] },
  { id: 'c-17', hemisphere: 1,  layer: 'mid', initX: 0,   initY: 24, widthVw: 46, heightVw: 25, baseScale: 1.24, diveLiftVh: 92, partDistanceVw: 72, gatherX: 0,   gatherY: 14, gatherScale: 1.44, seed: 17.1, puffs: PUFF_PRESETS[2] },
  { id: 'c-18', hemisphere: 1,  layer: 'mid', initX: 22,  initY: 28, widthVw: 44, heightVw: 24, baseScale: 1.18, diveLiftVh: 86, partDistanceVw: 66, gatherX: 16,  gatherY: 18, gatherScale: 1.38, seed: 18.8, puffs: PUFF_PRESETS[0] },
  { id: 'c-19', hemisphere: 1,  layer: 'mid', initX: 44,  initY: 30, widthVw: 38, heightVw: 21, baseScale: 1.12, diveLiftVh: 80, partDistanceVw: 56, gatherX: 32,  gatherY: 20, gatherScale: 1.30, seed: 19.4, puffs: PUFF_PRESETS[1] },

  // Deep Immersion Layer
  { id: 'c-20', hemisphere: -1, layer: 'deep', initX: -36, initY: 48, widthVw: 40, heightVw: 22, baseScale: 1.06, diveLiftVh: 96,  partDistanceVw: 58, gatherX: -28, gatherY: 28, gatherScale: 1.32, seed: 20.2, puffs: PUFF_PRESETS[2] },
  { id: 'c-21', hemisphere: -1, layer: 'deep', initX: -14, initY: 46, widthVw: 46, heightVw: 25, baseScale: 1.15, diveLiftVh: 104, partDistanceVw: 70, gatherX: -10, gatherY: 26, gatherScale: 1.40, seed: 21.9, puffs: PUFF_PRESETS[0] },
  { id: 'c-22', hemisphere: 1,  layer: 'deep', initX: 14,  initY: 46, widthVw: 46, heightVw: 25, baseScale: 1.15, diveLiftVh: 104, partDistanceVw: 70, gatherX: 10,  gatherY: 26, gatherScale: 1.40, seed: 22.6, puffs: PUFF_PRESETS[1] },
  { id: 'c-23', hemisphere: 1,  layer: 'deep', initX: 36,  initY: 50, widthVw: 40, heightVw: 22, baseScale: 1.06, diveLiftVh: 96,  partDistanceVw: 58, gatherX: 28,  gatherY: 28, gatherScale: 1.32, seed: 23.3, puffs: PUFF_PRESETS[2] },
  { id: 'c-24', hemisphere: -1, layer: 'deep', initX: -26, initY: 64, widthVw: 44, heightVw: 24, baseScale: 1.10, diveLiftVh: 112, partDistanceVw: 64, gatherX: -18, gatherY: 34, gatherScale: 1.34, seed: 24.1, puffs: PUFF_PRESETS[1] },
  { id: 'c-25', hemisphere: 1,  layer: 'deep', initX: 0,   initY: 68, widthVw: 50, heightVw: 27, baseScale: 1.20, diveLiftVh: 118, partDistanceVw: 76, gatherX: 0,   gatherY: 36, gatherScale: 1.46, seed: 25.8, puffs: PUFF_PRESETS[0] },
  { id: 'c-26', hemisphere: 1,  layer: 'deep', initX: 26,  initY: 64, widthVw: 44, heightVw: 24, baseScale: 1.10, diveLiftVh: 112, partDistanceVw: 64, gatherX: 18,  gatherY: 34, gatherScale: 1.34, seed: 26.5, puffs: PUFF_PRESETS[2] },
];

const clamp = (val: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, val));

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const IntroClouds: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tableEdgeRef = useRef<HTMLDivElement | null>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
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

    const renderFrame = (timestamp: number) => {
      updateTargetFromScroll();

      const diff = targetProgress - currentProgress;
      currentProgress = Math.abs(diff) < 0.0002 ? targetProgress : currentProgress + diff * 0.14;

      const p = currentProgress;
      const timeSec = timestamp * 0.001;

      /*
       * DISCRETE SLIDE PHASES:
       * - Slide 1 (0.00 -> 0.20): Table bottom edge visible; diving into clouds (clouds surge UP).
       * - Slide 2 (0.16 -> 0.35): Clouds shrink and part outward.
       * - Slide 3 (0.28 -> 0.70): One crystal-clear moving text with borders + concise introduction.
       * - Slide 4 (0.68 -> 0.85): Clouds gather back in from sides to shroud the screen.
       * - Slide 5 (0.85 -> 1.00): Gathered clouds vanish cleanly (opacity -> 0) for Timeline (#tl).
       */
      const diveT = smoothstep(0.0, 0.22, p);
      const partT = smoothstep(0.15, 0.34, p);
      const introRevealT = smoothstep(0.24, 0.36, p);
      const introExitT = smoothstep(0.66, 0.76, p);
      const gatherT = smoothstep(0.66, 0.84, p);
      const vanishT = smoothstep(0.84, 0.98, p);

      // 1. Table End Edge transform
      if (tableEdgeRef.current) {
        const edgeLiftVh = diveT * -46;
        const edgeRotateX = diveT * 14;
        tableEdgeRef.current.style.transform = `translate3d(0, ${edgeLiftVh.toFixed(2)}vh, 0) perspective(900px) rotateX(${edgeRotateX.toFixed(2)}deg)`;
        tableEdgeRef.current.style.opacity = `${(1 - smoothstep(0.14, 0.24, p)).toFixed(3)}`;
      }

      // 2. Populated Individual Volumetric Cloud Elements
      for (let i = 0; i < CLOUD_ACTORS.length; i++) {
        const el = cloudRefs.current[i];
        if (!el) continue;
        const c = CLOUD_ACTORS[i];

        const breezeX = Math.sin(timeSec * 0.55 + c.seed) * 1.15;
        const breezeY = Math.cos(timeSec * 0.45 + c.seed * 1.3) * 0.9;

        // Phase 1 & 2: Dive UP and Part OUTWARD
        const postDiveY = c.initY - diveT * c.diveLiftVh * 0.52;
        const partedX = c.initX + c.hemisphere * partT * c.partDistanceVw;
        const partedY = postDiveY - partT * 12;
        const partedScale = lerp(c.baseScale, c.baseScale * 0.42, partT);
        const partedOpacity = lerp(1, 0.12, partT);

        // Phase 4: Gather AGAIN from parted sides back into dense cloud blanket
        const gatheredX = lerp(partedX, c.gatherX, gatherT);
        const gatheredY = lerp(partedY, c.gatherY, gatherT);
        const gatheredScale = lerp(partedScale, c.gatherScale, gatherT);
        const gatheredOpacity = lerp(partedOpacity, 1, gatherT);

        // Phase 5: Vanish completely before entering the Timeline (#tl)
        const finalX = gatheredX + c.hemisphere * vanishT * 14 + breezeX * (1 - vanishT);
        const finalY = gatheredY - vanishT * 48 + breezeY * (1 - vanishT);
        const finalScale = lerp(gatheredScale, gatheredScale * 1.22, vanishT);
        const finalOpacity = gatheredOpacity * (1 - vanishT);

        el.style.transform = `translate3d(${finalX.toFixed(2)}vw, ${finalY.toFixed(2)}vh, 0) scale(${finalScale.toFixed(3)})`;
        el.style.opacity = finalOpacity.toFixed(3);
        el.style.visibility = finalOpacity <= 0.005 ? 'hidden' : 'visible';
      }

      // 3. Crisp Introduction Layer (fades in cleanly, stays centered, never cut off)
      if (textLayerRef.current) {
        const textAlpha = introRevealT * (1 - introExitT);
        const textRiseY = (1 - introRevealT) * 12 - introExitT * 14;
        textLayerRef.current.style.opacity = textAlpha.toFixed(3);
        textLayerRef.current.style.transform = `translate3d(0, ${textRiseY.toFixed(2)}vh, 0)`;
        textLayerRef.current.style.visibility = textAlpha <= 0.005 ? 'hidden' : 'visible';
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
        <div className="esc-slide-snap-point" data-slide="table-to-clouds" />
        <div className="esc-slide-snap-point" data-slide="clouds-part" />
        <div className="esc-slide-snap-point" data-slide="moving-introduction" />
        <div className="esc-slide-snap-point" data-slide="clouds-gather-and-vanish" />
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
                  ✦ ENGLISH SPEAKING CLUB ✦ EST. 2017 ✦ WHERE VOICES RISE ✦ RHETORIC · DEBATE · LEADERSHIP ✦ CONQUER THE STAGE ✦ DISCOVER YOUR VOICE ✦
                </span>
                <span className="esc-marquee-phrase">
                  ✦ ENGLISH SPEAKING CLUB ✦ EST. 2017 ✦ WHERE VOICES RISE ✦ RHETORIC · DEBATE · LEADERSHIP ✦ CONQUER THE STAGE ✦ DISCOVER YOUR VOICE ✦
                </span>
                <span className="esc-marquee-phrase">
                  ✦ ENGLISH SPEAKING CLUB ✦ EST. 2017 ✦ WHERE VOICES RISE ✦ RHETORIC · DEBATE · LEADERSHIP ✦ CONQUER THE STAGE ✦ DISCOVER YOUR VOICE ✦
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="esc-intro-textloop" aria-hidden="true">
          <TextLoop text="ESC introduction" shape="wave" speed={60} fontSize={56} fontWeight={800} curviness={46} tilt={-5} ribbonColor="#CD202A" ribbonWidth={96} color="#ffffff" edgeFade={0.25} separator="✦" />
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
              <span className="esc-milestone-bullet">✦</span>
              <span className="esc-milestone-item"><strong>50+</strong> Championships</span>
              <span className="esc-milestone-bullet">✦</span>
              <span className="esc-milestone-item"><strong>1,200+</strong> Mastered Speeches</span>
              <span className="esc-milestone-bullet">✦</span>
              <span className="esc-milestone-item"><strong>850+</strong> Transformed Orators</span>
            </div>
          </div>
        </div>

        {/*
          4. POPULATED INDIVIDUAL VOLUMETRIC CLOUD ELEMENTS (26 Distinct Multi-Puff Clouds)
        */}
        <div className="esc-clouds-field" aria-hidden="true">
          {CLOUD_ACTORS.map((cloud, index) => (
            <div
              key={cloud.id}
              ref={(el) => {
                cloudRefs.current[index] = el;
              }}
              className={`esc-cloud-actor esc-cloud-actor--${cloud.layer}`}
              style={{
                width: `${cloud.widthVw}vw`,
                height: `${cloud.widthVw}vw`,
                marginLeft: `${-cloud.widthVw / 2}vw`,
                marginTop: `${-cloud.widthVw / 2}vw`,
              }}
            >
              <div className="esc-cloud-inner-breathe" style={{ animationDelay: `${-cloud.seed}s` }}>
                <img
                  src="/cloud.png"
                  alt=""
                  className="esc-cloud-image"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroClouds;
