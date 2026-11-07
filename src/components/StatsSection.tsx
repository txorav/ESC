import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

export interface MeasureItem {
  id: string;
  target: number;
  suffix: string;
  eyebrow: string;
  label: string;
  subheading: string;
  bg: string;
  pillColor: string;
}

export const MEASURES: MeasureItem[] = [
  {
    id: 'members',
    target: 1250,
    suffix: '+',
    eyebrow: '02.1 / COMMUNITY SCALE',
    label: 'Active Members Since 2017',
    subheading: 'A vibrant community driven by passion, debate, and human connection across campuses.',
    bg: '#111744',
    pillColor: '#CD202A',
  },
  {
    id: 'events',
    target: 120,
    suffix: '+',
    eyebrow: '02.2 / EXCELLENCE & IMPACT',
    label: 'Major Events & Tournaments',
    subheading: 'Inter-university debate championships, cultural summits, and speech competitions organized.',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
  },
  {
    id: 'workshops',
    target: 48,
    suffix: '+',
    eyebrow: '02.3 / CONTINUOUS MASTERY',
    label: 'Intensive Speaking Workshops',
    subheading: 'Empowering club members with public speaking, rhetoric, leadership, and stage presence.',
    bg: '#0F1226',
    pillColor: '#CD202A',
  },
  {
    id: 'awards',
    target: 15,
    suffix: '+',
    eyebrow: '02.4 / HONORS & RECOGNITION',
    label: 'National Debate Awards',
    subheading: 'Recognized trophies and top speaker titles earned in prestigious national tournaments.',
    bg: '#111744',
    pillColor: '#A71017',
  },
  {
    id: 'partners',
    target: 9,
    suffix: '+',
    eyebrow: '02.5 / STRATEGIC ALLIANCES',
    label: 'Partner University Scientific Clubs',
    subheading: 'Collaborative events, mutual mentorships, and joint intellectual symposiums nationwide.',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
  },
];

/* -------------------------------------------------------------
   THREE.JS 3D GLOSSY PILL CANVAS WITH REAL-TIME LIGHTING & SPRING
   ------------------------------------------------------------- */
const StatsPill3DCanvas: React.FC<{
  color: string;
  triggerKey: number;
}> = ({ color, triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    material: THREE.MeshPhysicalMaterial;
    mesh: THREE.Mesh;
    targetColor: THREE.Color;
    wobbleAmp: number;
    wobblePhase: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

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

    // 3D Capsule Geometry (horizontal pill: radius 1.16, length 2.25)
    const geom = new THREE.CapsuleGeometry(1.16, 2.25, 32, 64);
    geom.rotateZ(Math.PI / 2);

    const targetColor = new THREE.Color(color);
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

    // Studio Lighting setup
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.4);
    rimLight.position.set(-4, -3, -3);
    scene.add(rimLight);

    const specularLight = new THREE.PointLight(0xffffff, 2.6, 14);
    specularLight.position.set(0, 3, 3.5);
    scene.add(specularLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const state = {
      material,
      mesh,
      targetColor,
      wobbleAmp: 0,
      wobblePhase: 0,
      mouseX: 0,
      mouseY: 0,
    };
    sceneRef.current = state;

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
      state.mouseX = nx;
      state.mouseY = ny;
    };

    const handlePointerLeave = () => {
      state.mouseX = 0;
      state.mouseY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    let raf = 0;
    let clock = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      clock += 0.02;

      // Smooth color lerping
      material.color.lerp(state.targetColor, 0.08);

      // Mouse interactive tilt
      const targetRotY = state.mouseX * 0.45;
      const targetRotX = -state.mouseY * 0.35;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.08;
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.08;

      // Floating gentle motion
      mesh.position.y = Math.sin(clock * 1.5) * 0.06;

      // Spring wobble on step change
      if (state.wobbleAmp > 0.001) {
        state.wobblePhase += 0.28;
        state.wobbleAmp *= 0.91;
        const wobble = Math.sin(state.wobblePhase) * state.wobbleAmp;
        mesh.rotation.z = Math.sin(state.wobblePhase * 0.8) * state.wobbleAmp * 0.35;
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
      sceneRef.current = null;
    };
  }, []);

  // When color or triggerKey changes, trigger 3D impulse & color update
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.targetColor.set(color);
      sceneRef.current.wobbleAmp = 0.38;
      sceneRef.current.wobblePhase = 0;
    }
  }, [color, triggerKey]);

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
    const startVal = Math.round(target * 0.4);

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
   MAIN PINNED STATS EXPERIENCE (PINNED SCROLL, NOT CLASSIC SCROLL)
   ------------------------------------------------------------- */
export const StatsSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

        // Progress from 0 to 1 through the pinned section
        const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
        const index = Math.min(MEASURES.length - 1, Math.floor(progress * MEASURES.length));
        setActiveIndex(index);

        // Synchronize section background with active measure color
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
    const track = trackRef.current;
    if (!track) return;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    const totalScrollable = track.offsetHeight - window.innerHeight;
    const targetY = trackTop + (index / (MEASURES.length - 1)) * totalScrollable + 15;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const current = MEASURES[activeIndex];

  return (
    <section
      id="stats"
      ref={trackRef}
      className="stats-pin-container"
      data-bg={current.bg}
      data-theme="dark"
    >
      <div className="stats-sticky-stage">
        {/* WRITING OUTSIDE (TOP EYEBROW) */}
        <div className="stat-outside-eyebrow-wrap">
          <span key={current.id} className="stat-outside-eyebrow">
            {current.eyebrow}
          </span>
        </div>

        {/* 3D CATCHY PILL CONTAINER */}
        <div className="stats-3d-pill-wrapper">
          {/* THREE.JS GLOSSY 3D PILL */}
          <StatsPill3DCanvas
            color={current.pillColor}
            triggerKey={activeIndex}
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

        {/* WRITING OUTSIDE (BOTTOM SUBTITLE) */}
        <div className="stat-outside-subheading-wrap">
          <p key={`sub-${current.id}`} className="stat-outside-subheading">
            {current.subheading}
          </p>
        </div>

        {/* STEP CONTROLLERS */}
        <div className="stats-steps-nav">
          {MEASURES.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              className={`stats-step-btn ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => goToIndex(idx)}
              aria-label={`Go to ${m.label}`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
