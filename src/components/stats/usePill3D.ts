/**
 * @file usePill3D.ts
 * Dedicated Three.js WebGL controller and lifecycle manager for 3D pill visualization.
 * Ensures rigorous memory teardown, GPU resource release, and offscreen performance pausing.
 */

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

interface UsePill3DParams {
  color: string;
}

interface UsePill3DReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * Checks whether WebGL is supported in the current browsing context.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Manages the complete lifecycle, render loop, interactive tilt, and teardown
 * of the Three.js 3D Capsule Pill scene.
 *
 * @param params - Contains pill coloration and visual options.
 * @returns Object with containerRef and canvasRef to bind to JSX elements.
 */
export function usePill3D({ color }: UsePill3DParams): UsePill3DReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (!isWebGLAvailable()) {
      return;
    }

    // Check system preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer setup with ACESFilmicToneMapping for rich dye saturation
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // Horizontal 3D Capsule Pill Geometry
    const geom = new THREE.CapsuleGeometry(1.18, 2.3, 32, 64);
    geom.rotateZ(Math.PI / 2);

    // Automotive Candy Clearcoat Lacquer Material
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.98,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xffffff),
    });

    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

    // 4-Point High-Key Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(5.0, 6.0, 5.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xddeeff, 3.2);
    rimLight.position.set(-5.0, -4.0, -4.0);
    scene.add(rimLight);

    const specularLight = new THREE.PointLight(0xffffff, 3.2, 15);
    specularLight.position.set(0, 3, 3.5);
    scene.add(specularLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    // Render loop and interaction state container
    const state = {
      isVisible: true,
      pointerX: 0,
      pointerY: 0,
      rafId: 0,
      clock: 0,
    };

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    handleResize();

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Pause rendering loop when off-screen for battery & performance savings
    const io = new IntersectionObserver(([entry]) => {
      state.isVisible = Boolean(entry?.isIntersecting);
    });
    io.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      state.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handlePointerReset = () => {
      state.pointerX = 0;
      state.pointerY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerReset, { passive: true });
    container.addEventListener('pointercancel', handlePointerReset, { passive: true });

    const animate = () => {
      state.rafId = requestAnimationFrame(animate);
      if (!state.isVisible) return;

      if (!prefersReducedMotion) {
        state.clock += 0.02;

        // Smooth interactive 3D perspective tilt
        const targetRotY = state.pointerX * 0.44;
        const targetRotX = -state.pointerY * 0.32;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.08;
        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.08;

        // Gentle floating micro-motion
        mesh.position.y = Math.sin(state.clock * 1.5) * 0.07;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Comprehensive memory leak prevention and GPU cleanup
    return () => {
      cancelAnimationFrame(state.rafId);
      ro.disconnect();
      io.disconnect();

      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerReset);
      container.removeEventListener('pointercancel', handlePointerReset);

      // Geometry and Material release
      geom.dispose();
      material.dispose();

      // Lighting and Scene clearance
      scene.remove(mesh);
      scene.remove(keyLight);
      scene.remove(rimLight);
      scene.remove(specularLight);
      scene.remove(ambientLight);
      scene.clear();

      // Force WebGL context release
      try {
        renderer.forceContextLoss();
      } catch {
        // Ignore if already lost
      }
      renderer.dispose();
    };
  }, [color]);

  return { containerRef, canvasRef };
}

export default usePill3D;
