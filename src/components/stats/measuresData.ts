/**
 * @file measuresData.ts
 * Canonical measures dataset and helper utilities for stats module extension.
 *
 * To add a new measure:
 * Simply append a new `MeasureData` object to `MEASURES`, or use the `defineMeasure`
 * helper to guarantee strict type inference and validation.
 */

import type { MeasureData } from './types';

/**
 * Type-safe helper function to construct a MeasureData object with autocomplete
 * and compile-time validation.
 *
 * @param measure - The configuration for the new measure.
 * @returns An immutable MeasureData record.
 *
 * @example
 * ```ts
 * export const newMeasure = defineMeasure({
 *   id: 'alumni',
 *   stepCode: '06',
 *   target: 500,
 *   suffix: '+',
 *   eyebrow: '02.6 / GLOBAL NETWORK',
 *   label: 'Alumni Across 20+ Countries',
 *   subheading: 'Leaders, entrepreneurs, and orators driving global impact.',
 *   bg: '#121A38',
 *   pillColor: '#E63946',
 * });
 * ```
 */
export const defineMeasure = (measure: MeasureData): MeasureData => Object.freeze({ ...measure });

/**
 * Canonical measures dataset for the ESC scale and impact presentation.
 */
export const MEASURES: readonly MeasureData[] = Object.freeze([
  defineMeasure({
    id: 'members',
    stepCode: '01',
    target: 1250,
    suffix: '+',
    eyebrow: '02.1 / COMMUNITY SCALE',
    label: 'Active Members Since 2017',
    subheading: 'A vibrant community driven by passion, debate, and human connection across campuses.',
    bg: '#111744',
    pillColor: '#CD202A',
    theme: 'dark',
  }),
  defineMeasure({
    id: 'events',
    stepCode: '02',
    target: 120,
    suffix: '+',
    eyebrow: '02.2 / EXCELLENCE & IMPACT',
    label: 'Major Events & Tournaments',
    subheading: 'Inter-university debate championships, cultural summits, and speech competitions organized.',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
    theme: 'dark',
  }),
  defineMeasure({
    id: 'workshops',
    stepCode: '03',
    target: 48,
    suffix: '+',
    eyebrow: '02.3 / CONTINUOUS MASTERY',
    label: 'Intensive Speaking Workshops',
    subheading: 'Empowering club members with public speaking, rhetoric, leadership, and stage presence.',
    bg: '#0F1226',
    pillColor: '#CD202A',
    theme: 'dark',
  }),
  defineMeasure({
    id: 'awards',
    stepCode: '04',
    target: 15,
    suffix: '+',
    eyebrow: '02.4 / HONORS & RECOGNITION',
    label: 'National Debate Awards',
    subheading: 'Recognized trophies and top speaker titles earned in prestigious national tournaments.',
    bg: '#151B40',
    pillColor: '#A71017',
    theme: 'dark',
  }),
  defineMeasure({
    id: 'partners',
    stepCode: '05',
    target: 9,
    suffix: '+',
    eyebrow: '02.5 / STRATEGIC ALLIANCES',
    label: 'Partner University Clubs',
    subheading: 'Collaborative events, mutual mentorships, and joint intellectual symposiums nationwide.',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
    theme: 'dark',
  }),
]);
