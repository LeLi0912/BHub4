import type { WeeklyDigest } from '@/types';
import archiveData from '../../data/archive.json';

/**
 * Get all available week IDs, ordered descending (latest first).
 */
export async function getAllWeekIds(): Promise<string[]> {
  return archiveData.weeks.map(w => w.week);
}

/**
 * Get the latest week ID.
 */
export async function getLatestWeek(): Promise<string> {
  return archiveData.weeks[0].week;
}

/**
 * Get week metadata from archive.
 */
export function getWeekMeta(week: string) {
  return archiveData.weeks.find(w => w.week === week) || null;
}

/**
 * Dynamic import of a specific week's data.
 * Use this in client components.
 */
export async function getWeekData(week: string): Promise<WeeklyDigest> {
  const data = await import(`../../data/weeks/${week}.json`);
  return data as unknown as WeeklyDigest;
}

/**
 * Get the total number of available weeks.
 */
export function getWeekCount(): number {
  return archiveData.weeks.length;
}

/**
 * Check if a week exists.
 */
export function hasWeek(week: string): boolean {
  return archiveData.weeks.some(w => w.week === week);
}

/**
 * Get navigation context: previous and next week IDs.
 */
export function getWeekNav(week: string): { prev: string | null; next: string | null } {
  const idx = archiveData.weeks.findIndex(w => w.week === week);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx < archiveData.weeks.length - 1 ? archiveData.weeks[idx + 1].week : null,
    next: idx > 0 ? archiveData.weeks[idx - 1].week : null,
  };
}
