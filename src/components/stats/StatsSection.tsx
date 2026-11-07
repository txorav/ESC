/**
 * @file StatsSection.tsx
 * Container component orchestrating the complete stats and impact narrative flow.
 * Supports custom measures injection for effortless testing and page extensions.
 */

import React from 'react';
import type { StatsSectionProps } from './types';
import { MEASURES } from './measuresData';
import { MeasureSectionItem } from './MeasureSectionItem';

/**
 * StatsSection renders the sequential flow of scale and impact measures.
 * Accepts optional `measures` prop to easily override or extend statistics.
 */
export const StatsSection: React.FC<StatsSectionProps> = ({
  measures = MEASURES,
  id = 'stats-flow',
  className = '',
}) => {
  return (
    <div className={`stats-master-flow ${className}`.trim()} id={id}>
      {measures.map((measure, index) => (
        <MeasureSectionItem
          key={measure.id}
          measure={measure}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
};

export default StatsSection;
