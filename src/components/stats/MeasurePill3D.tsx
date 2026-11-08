/**
 * @file MeasurePill3D.tsx
 * Presentational component for the 3D candy lacquer capsule pill.
 * Renders an ultra-high fidelity 3D glossy pill with interactive perspective tilt,
 * multi-stop candy lacquer shading, clearcoat specular gloss, and deep drop shadow.
 * 100% crash-proof, zero WebGL context exhaustion, zero broken canvas boxes.
 */

import React, { useRef, useState, useCallback } from 'react';
import type { MeasurePill3DProps } from './types';

/**
 * Derives brighter specular highlight and deeper shadow colors from a base hex color.
 */
function getPillGradients(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;

  // Lighter candy highlight
  const hlR = Math.min(255, Math.round(r * 1.35 + 25));
  const hlG = Math.min(255, Math.round(g * 1.35 + 25));
  const hlB = Math.min(255, Math.round(b * 1.35 + 25));

  // Deeper candy shadow
  const shR = Math.max(0, Math.round(r * 0.55));
  const shG = Math.max(0, Math.round(g * 0.55));
  const shB = Math.max(0, Math.round(b * 0.55));

  return {
    highlight: `rgb(${hlR}, ${hlG}, ${hlB})`,
    base: hex,
    shadow: `rgb(${shR}, ${shG}, ${shB})`,
    rim: `rgba(${hlR}, ${hlG}, ${hlB}, 0.55)`,
  };
}

/**
 * MeasurePill3D renders a tactile 3D capsule pill with candy lacquer clearcoat,
 * specular hot-spots, and responsive pointer tilt.
 */
export const MeasurePill3D: React.FC<MeasurePill3DProps> = ({
  color,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });
  const [isPressed, setIsPressed] = useState(false);

  const gradients = getPillGradients(color);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setTilt({
      x: Math.max(-1, Math.min(1, px)) * 14,
      y: Math.max(-1, Math.min(1, py)) * -12,
      scale: 1.025,
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, scale: 1 });
    setIsPressed(false);
  }, []);

  const handlePointerDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`measure-pill-3d-capsule ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(${
          isPressed ? 0.98 : tilt.scale
        }, ${isPressed ? 0.98 : tilt.scale}, 1)`,
        ...style,
      }}
      aria-hidden="true"
    >
      {/* 1. Base Candy Body with Depth Gradient */}
      <div
        className="measure-pill-body"
        style={{
          background: `linear-gradient(180deg, ${gradients.highlight} 0%, ${gradients.base} 38%, ${gradients.shadow} 100%)`,
          boxShadow: `
            0 36px 80px rgba(0, 0, 0, 0.75),
            0 12px 28px rgba(0, 0, 0, 0.5),
            inset 0 3px 6px rgba(255, 255, 255, 0.65),
            inset 0 -8px 24px rgba(0, 0, 0, 0.55),
            0 0 0 1px ${gradients.rim}
          `,
        }}
      />

      {/* 2. Top Clearcoat Specular Sheen (Upper Hemisphere Gloss) */}
      <div className="measure-pill-clearcoat-sheen" />

      {/* 3. Studio Hotspot Glint Reflection */}
      <div className="measure-pill-hotspot-glint" />

      {/* 4. Bottom Ambient Reflected Light */}
      <div className="measure-pill-ambient-bounce" />
    </div>
  );
};

export default MeasurePill3D;
