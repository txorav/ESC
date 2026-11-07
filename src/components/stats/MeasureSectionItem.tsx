/**
 * @file MeasureSectionItem.tsx
 * Presentational component rendering a single measure section in the stats flow.
 * Coordinates entrance reveal, 3D pill visualization, and animated statistics.
 */

import React from 'react';
import type { MeasureSectionItemProps } from './types';
import { MeasurePill3D } from './MeasurePill3D';
import { AnimatedCounter } from './AnimatedCounter';
import { useInView } from './useInView';

/**
 * MeasureSectionItem renders an individual full-viewport measure stage.
 * Exposes DOM data-bg and data-theme attributes for global background color shifts.
 */
export const MeasureSectionItem: React.FC<MeasureSectionItemProps> = ({
  measure,
  isFirst = false,
  className = '',
  customPill,
}) => {
  const { ref: sectionRef, isInView } = useInView<HTMLElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
    triggerOnce: true,
  });

  const sectionId = isFirst ? 'stats' : `measure-${measure.id}`;
  const theme = measure.theme || 'dark';

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`measure-section ${className}`.trim()}
      data-bg={measure.bg}
      data-theme={theme}
    >
      <div className={`measure-content-wrap ${isInView ? 'in' : ''}`}>
        {/* Outside Writing: Eyebrow */}
        <h2 className="measure-outside-eyebrow">
          <span>{measure.eyebrow}</span>
        </h2>

        {/* 3D Catchy Pill Stage */}
        <div className="measure-pill-stage">
          {customPill ?? <MeasurePill3D color={measure.pillColor} />}

          {/* Number & Tagline Inside the 3D Pill */}
          <div className="measure-pill-overlay">
            <span className="measure-pill-number">
              <AnimatedCounter
                target={measure.target}
                prefix={measure.prefix}
                suffix={measure.suffix}
                duration={measure.duration ?? 1400}
                active={isInView}
              />
            </span>
            <h3 className="measure-pill-tagline">{measure.label}</h3>
          </div>
        </div>

        {/* Outside Writing: Narrative context */}
        <p className="measure-outside-subheading">{measure.subheading}</p>
      </div>
    </section>
  );
};

export default MeasureSectionItem;
