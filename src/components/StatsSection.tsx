/**
 * @file StatsSection.tsx
 * Top-level component adapter re-exporting StatsSection from the modular stats package.
 * Retains complete backwards-compatibility for existing consumers like App.tsx.
 */

export { StatsSection as default, StatsSection } from './stats/StatsSection';
export { MEASURES } from './stats/measuresData';
export type { StatsSectionProps, MeasureData } from './stats/types';
