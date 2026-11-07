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
  const { containerRef, canvasRef } = usePill3D({ color });

  return (
    <div
      ref={containerRef}
      className={`measure-pill-canvas-container ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="measure-pill-canvas" />
    </div>
  );
};

export default MeasurePill3D;
