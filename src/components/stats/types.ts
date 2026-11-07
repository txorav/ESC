/**
 * @file types.ts
 * Strongly-typed data models and component prop contracts for the Stats module.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Core data model representing an individual measure or statistic.
 * Designed for effortless extension and strict type safety.
 */
export interface MeasureData {
  /** Unique identifier for DOM anchor IDs and React reconciliation keys */
  readonly id: string;
  /** Section step indicator code (e.g., '01', '02') */
  readonly stepCode: string;
  /** Numerical target value to animate towards */
  readonly target: number;
  /** Optional prefix symbol (e.g., '$', '#') */
  readonly prefix?: string;
  /** Suffix symbol following the number (e.g., '+', '%', 'K') */
  readonly suffix: string;
  /** Eyebrow categorization text above the 3D pill */
  readonly eyebrow: string;
  /** Descriptive label/tagline rendered inside the 3D pill */
  readonly label: string;
  /** Narrative context rendered below the 3D pill */
  readonly subheading: string;
  /** Dynamic section background hex color (triggers page-wide theme transition) */
  readonly bg: string;
  /** Primary lacquer pigment color for the Three.js 3D pill material */
  readonly pillColor: string;
  /** Color theme for text/navigation contrast over this section's background */
  readonly theme?: 'dark' | 'light';
  /** Optional custom animation duration in milliseconds for the counter */
  readonly duration?: number;
}

/**
 * Props for the AnimatedCounter component.
 */
export interface AnimatedCounterProps {
  /** Target numerical value */
  readonly target: number;
  /** Optional prefix text */
  readonly prefix?: string;
  /** Suffix symbol attached to the number */
  readonly suffix?: string;
  /** Animation duration in milliseconds (default: 1400ms) */
  readonly duration?: number;
  /** Whether the counter animation should be triggered */
  readonly active?: boolean;
  /** Optional custom number formatter (defaults to toLocaleString) */
  readonly formatter?: (value: number) => string;
  /** Optional CSS class name */
  readonly className?: string;
}

/**
 * Props for the MeasurePill3D component.
 */
export interface MeasurePill3DProps {
  /** Hex color code for the 3D capsule pill */
  readonly color: string;
  /** Optional CSS class name */
  readonly className?: string;
  /** Optional inline styles */
  readonly style?: CSSProperties;
}

/**
 * Props for an individual MeasureSectionItem.
 */
export interface MeasureSectionItemProps {
  /** The measure data model to render */
  readonly measure: MeasureData;
  /** Whether this is the first section (assigns id="stats" for nav targeting) */
  readonly isFirst?: boolean;
  /** Optional CSS class name */
  readonly className?: string;
  /** Optional custom pill element or override */
  readonly customPill?: ReactNode;
}

/**
 * Props for the master StatsSection container.
 */
export interface StatsSectionProps {
  /**
   * Optional custom array of measures.
   * Defaults to canonical MEASURES list if omitted.
   */
  readonly measures?: readonly MeasureData[];
  /** Optional container element ID (default: "stats-flow") */
  readonly id?: string;
  /** Optional CSS class name */
  readonly className?: string;
}

/**
 * Viewport observer options for useInView hook.
 */
export interface UseInViewOptions {
  /** Threshold for IntersectionObserver (0.0 to 1.0) */
  readonly threshold?: number | number[];
  /** Margin around the root element */
  readonly rootMargin?: string;
  /** Disconnect observer once element is revealed (default: true for performance) */
  readonly triggerOnce?: boolean;
  /** Initial visibility state before hydration/observer fires */
  readonly initialInView?: boolean;
}
