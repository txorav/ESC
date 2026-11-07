import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

export interface MeasureItem {
  id: string;
  stepCode: string;
  target: number;
  suffix: string;
  eyebrow: string;
  label: string;
  subheading: string;
  tag: string;
  bg: string;
  pillColor: string;
}

export const MEASURES: MeasureItem[] = [
  {
    id: 'members',
    stepCode: '01',
    target: 1250,
    suffix: '+',
    eyebrow: '02.1 / COMMUNITY SCALE',
    label: 'Active Members Since 2017',
    subheading: 'A vibrant community driven by passion, debate, and human connection across campuses.',
    tag: 'SCALE & REACH',
    bg: '#111744',
    pillColor: '#CD202A',
  },
  {
    id: 'events',
    stepCode: '02',
    target: 120,
    suffix: '+',
    eyebrow: '02.2 / EXCELLENCE & IMPACT',
    label: 'Major Events & Tournaments',
    subheading: 'Inter-university debate championships, cultural summits, and speech competitions organized.',
    tag: 'TOURNAMENTS',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
  },
  {
    id: 'workshops',
    stepCode: '03',
    target: 48,
    suffix: '+',
    eyebrow: '02.3 / CONTINUOUS MASTERY',
    label: 'Intensive Speaking Workshops',
    subheading: 'Empowering club members with public speaking, rhetoric, leadership, and stage presence.',
    tag: 'WORKSHOPS',
    bg: '#0F1226',
    pillColor: '#CD202A',
  },
  {
    id: 'awards',
    stepCode: '04',
    target: 15,
    suffix: '+',
    eyebrow: '02.4 / HONORS & RECOGNITION',
    label: 'National Debate Awards',
    subheading: 'Recognized trophies and top speaker titles earned in prestigious national tournaments.',
    tag: 'RECOGNITION',
    bg: '#111744',
    pillColor: '#A71017',
  },
  {
    id: 'partners',
    stepCode: '05',
    target: 9,
    suffix: '+',
    eyebrow: '02.5 / STRATEGIC ALLIANCES',
    label: 'Partner University Clubs',
    subheading: 'Collaborative events, mutual mentorships, and joint intellectual symposiums nationwide.',
    tag: 'ALLIANCES',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
  },
];

/* -------------------------------------------------------------
   THREE.JS 3D GLOSSY PILL CANVAS WITH CONTINUOUS SCROLL PHYSICS
   ------------------------------------------------------------- */
interface Pill3DCanvasProps {
  color: string;
  triggerKey: number;
  scrollProgress: number;
  scrollVelocity: number;
}

const StatsPill3DCanvas: React.FC<Pill3DCanvasProps> = ({
  color,
  triggerKey,
  scrollProgress,
  scrollVelocity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    material: null as THREE.MeshPhysicalMaterial | null,
    mesh: null as THREE.Mesh | null,
    keyLight: null as THREE.DirectionalLight | null,
    specularLight: null as THREE.PointLight | null,
    targetColor: new THREE.Color(color),
    wobbleAmp: 0,
    wobblePhase: 0,
    mouseX: 0,
    mouseY: 0,
    scrollProgress: 0,
    scrollVelocity: 0,
  });

  // Sync props to stateRef every frame without re-instantiating scene
  useEffect(() => {
    stateRef.current.scrollProgress = scrollProgress;
    stateRef.current.scrollVelocity = scrollVelocity;
  }, [scrollProgress, scrollVelocity]);

  useEffect(() => {
    const s = stateRef.current;
    s.targetColor.set(color);
    s.wobbleAmp = 0.35;
    s.wobblePhase = 0;
  }, [color, triggerKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // 3D Capsule Pill Geometry: horizontal orientation
    const geom = new THREE.CapsuleGeometry(1.16, 2.25, 32, 64);
    geom.rotateZ(Math.PI / 2);

    const targetColor = stateRef.current.targetColor;
    const material = new THREE.MeshPhysicalMaterial({
      color: targetColor.clone(),
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });

    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

    // Studio lighting with moving specular light linked to scroll
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.4);
    rimLight.position.set(-4, -3, -3);
    scene.add(rimLight);

    const specularLight = new THREE.PointLight(0xffffff, 2.8, 14);
    specularLight.position.set(0, 3, 3.5);
    scene.add(specularLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    stateRef.current.material = material;
    stateRef.current.mesh = mesh;
    stateRef.current.keyLight = keyLight;
    stateRef.current.specularLight = specularLight;

    const resize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouseX = nx;
      stateRef.current.mouseY = ny;
    };

    const handlePointerLeave = () => {
      stateRef.current.mouseX = 0;
      stateRef.current.mouseY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    let raf = 0;
    let clock = 0;
    let smoothProgress = 0;
    let smoothVelocity = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      clock += 0.02;
      const s = stateRef.current;

      // Smooth dampening for continuous scroll reactivity
      smoothProgress += (s.scrollProgress - smoothProgress) * 0.12;
      smoothVelocity += (s.scrollVelocity - smoothVelocity) * 0.15;

      // Smooth color lerping
      material.color.lerp(s.targetColor, 0.08);

      // Mouse interactive tilt + continuous scroll momentum tilt
      const targetRotY = s.mouseX * 0.42 + (smoothProgress - 0.5) * 0.8 + smoothVelocity * 0.025;
      const targetRotX = -s.mouseY * 0.32 - smoothVelocity * 0.035;

      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.08;
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.08;

      // Ambient floating & dynamic scroll breathing
      mesh.position.y = Math.sin(clock * 1.5) * 0.06 - smoothVelocity * 0.015;

      // Move specular glint light dynamically across pill as scroll progresses
      if (specularLight) {
        specularLight.position.x = Math.sin(smoothProgress * Math.PI * 2) * 3.5;
        specularLight.position.y = 2.5 + Math.cos(smoothProgress * Math.PI * 2) * 1.0;
      }

      // Spring wobble on step transition
      if (s.wobbleAmp > 0.001) {
        s.wobblePhase += 0.28;
        s.wobbleAmp *= 0.91;
        const wobble = Math.sin(s.wobblePhase) * s.wobbleAmp;
        mesh.rotation.z = Math.sin(s.wobblePhase * 0.8) * s.wobbleAmp * 0.35;
        mesh.scale.set(1 + wobble * 0.15, 1 - wobble * 0.12, 1 + wobble * 0.08);
      } else {
        mesh.rotation.z += (0 - mesh.rotation.z) * 0.1;
        mesh.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      geom.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="stats-3d-pill-canvas-container">
      <canvas ref={canvasRef} className="stats-3d-pill-canvas" />
    </div>
  );
};

/* -------------------------------------------------------------
   ANIMATED NUMBER COUNTER (SMOOTH SPRING INTERPOLATION)
   ------------------------------------------------------------- */
const AnimatedCounter: React.FC<{
  target: number;
  suffix: string;
}> = ({ target, suffix }) => {
  const [val, setVal] = useState(target);

  useEffect(() => {
    let raf: number;
    const startTime = performance.now();
    const duration = 650;
    const startVal = Math.round(target * 0.45);

    const step = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(startVal + (target - startVal) * ease));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setVal(target);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/* -------------------------------------------------------------
   EXCEPTIONAL PINNED SCROLL STATS EXPERIENCE WITH ALL-SIDES TELEMETRY
   ------------------------------------------------------------- */
export const StatsSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressVal, setProgressVal] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const track = trackRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        if (totalScrollable <= 0) return;

        // Current scroll velocity
        const now = performance.now();
        const dt = Math.max(16, now - lastTime.current);
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        const velocity = (delta / dt) * 16; // velocity in px per frame
        lastScrollY.current = currentY;
        lastTime.current = now;
        setScrollVelocity(Math.max(-30, Math.min(30, velocity)));

        // Continuous progress through the pinned track (0 to 1)
        const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
        setProgressVal(progress);

        // Map to active index
        const index = Math.min(MEASURES.length - 1, Math.floor(progress * MEASURES.length));
        setActiveIndex(index);

        // Update body background smoothly to active measure color
        const currentBg = MEASURES[index].bg;
        document.body.style.setProperty('--esc-bg', currentBg);
        document.body.style.backgroundColor = currentBg;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToIndex = (index: number) => {
    setActiveIndex(index);
    setProgressVal(index / (MEASURES.length - 1));
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const trackTop = rect.top + window.scrollY;
    const totalScrollable = track.offsetHeight - window.innerHeight;
    const targetY = trackTop + (index / MEASURES.length) * totalScrollable + 20;
    try {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, targetY);
    }
  };

  const current = MEASURES[activeIndex];
  const percentDisplay = Math.round(progressVal * 100);

  return (
    <section
      id="stats"
      ref={trackRef}
      className="stats-pin-container"
      data-bg={current.bg}
      data-theme="dark"
    >
      <div className="stats-sticky-stage">
        {/* PARALLAX WATERMARK NUMERAL IN BACKGROUND */}
        <div
          className="stats-ambient-watermark"
          aria-hidden="true"
          style={{
            transform: `translate3d(0, ${(0.5 - progressVal) * 80}px, 0) scale(${1 + (progressVal % 0.2) * 0.3})`,
          }}
        >
          {current.stepCode}
        </div>

        {/* ========================================================
            LEFT SIDE: ARCHITECTURAL INDEX RAIL & SCRUB TRACK
            ======================================================== */}
        <aside className="stats-side-rail stats-rail-left" aria-label="Measures Index">
          <div className="stats-rail-header">
            <span className="stats-rail-eyebrow">ESC INDEX</span>
            <div className="stats-rail-live-tag">LIVE TELEMETRY</div>
          </div>

          <div className="stats-rail-items">
            {MEASURES.map((m, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`stats-rail-item ${isActive ? 'active' : ''}`}
                  onClick={() => goToIndex(idx)}
                >
                  <span className="stats-rail-step">{m.stepCode}</span>
                  <span className="stats-rail-tag">{m.tag}</span>
                  <span className="stats-rail-dot" />
                </button>
              );
            })}
          </div>

          {/* Continuous vertical progress fill line */}
          <div className="stats-rail-track-line">
            <div
              className="stats-rail-progress-fill"
              style={{ height: `${Math.max(4, Math.min(100, progressVal * 100))}%` }}
            />
          </div>
        </aside>

        {/* ========================================================
            CENTER STAGE: EYEBROW + 3D PILL + SUBTITLE
            ======================================================== */}
        <div className="stats-center-stage">
          {/* Top Eyebrow */}
          <div className="stat-outside-eyebrow-wrap">
            <span key={current.id} className="stat-outside-eyebrow">
              {current.eyebrow}
            </span>
          </div>

          {/* 3D Catchy Pill Stage */}
          <div className="stats-3d-pill-wrapper">
            {/* THREE.JS GLOSSY 3D PILL CANVAS */}
            <StatsPill3DCanvas
              color={current.pillColor}
              triggerKey={activeIndex}
              scrollProgress={progressVal}
              scrollVelocity={scrollVelocity}
            />

            {/* TEXT INSIDE THE 3D PILL */}
            <div className="stats-3d-pill-overlay">
              <div key={`num-${current.id}`} className="stat-pill-number-anim">
                <AnimatedCounter target={current.target} suffix={current.suffix} />
              </div>
              <div key={`lbl-${current.id}`} className="stat-pill-label-anim">
                {current.label}
              </div>
            </div>
          </div>

          {/* Bottom Subtitle */}
          <div className="stat-outside-subheading-wrap">
            <p key={`sub-${current.id}`} className="stat-outside-subheading">
              {current.subheading}
            </p>
          </div>

          {/* Interactive Bottom Step Buttons */}
          <div className="stats-steps-nav">
            {MEASURES.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                className={`stats-step-btn ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => goToIndex(idx)}
                aria-label={`Jump to ${m.label}`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            RIGHT SIDE: LIVE AUDIT & KINETIC CLUB METRICS
            ======================================================== */}
        <aside className="stats-side-rail stats-rail-right" aria-label="Section Telemetry">
          <div className="stats-telemetry-box">
            <div className="stats-telemetry-head">
              <span className="stats-telemetry-beacon" />
              <span className="stats-telemetry-title">IMPACT MONITOR</span>
            </div>

            <div className="stats-telemetry-metric">
              <span className="stats-telemetry-num">{percentDisplay}%</span>
              <span className="stats-telemetry-sub">SCRUB DEPTH</span>
            </div>

            <div className="stats-telemetry-meta">
              <div className="stats-telemetry-row">
                <span>EPOCH</span>
                <strong>EST. 2017</strong>
              </div>
              <div className="stats-telemetry-row">
                <span>AUDIT</span>
                <strong>CONFIRMED</strong>
              </div>
              <div className="stats-telemetry-row">
                <span>ACTIVE</span>
                <strong>{current.label.slice(0, 16)}...</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default StatsSection;
