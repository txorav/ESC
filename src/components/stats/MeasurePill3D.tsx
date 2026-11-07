/**
 * @file MeasurePill3D.tsx
 * Presentational component for the 3D lacquer capsule pill.
 * Delegates WebGL lifecycle, interaction, and cleanup to usePill3D.
 */

import React from 'react';
import type { MeasurePill3DProps } from './types';
import { usePill3D } from './usePill3D';

/**
 * MeasurePill3D renders an interactive 3D capsule pill with candy lacquer clearcoat
 * and subtle pointer responsiveness.
 */
export const MeasurePill3D: React.FC<MeasurePill3DProps> = ({
  color,
  className = '',
  style,
}) => {
  const { containerRef, canvasRef, isWebGLSupported } = usePill3D({ color });

  const fallbackStyle: React.CSSProperties = !isWebGLSupported
    ? {
        background: color,
        borderRadius: '9999px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`measure-pill-canvas-container ${!isWebGLSupported ? 'fallback-capsule' : ''} ${className}`.trim()}
      style={{ ...fallbackStyle, ...style }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="measure-pill-canvas" />
    </div>
  );
};

export default MeasurePill3D;
