import type { ExplanationNote } from '@/types';

export type ReviewStatus = 'draft' | 'submitted' | 'reviewed';

export interface JobReview {
  status: ReviewStatus;
  techComment: string;
  saComment: string;
  note: ExplanationNote | null;
}

const KEY = 'techmate-job-reviews';

const EMPTY: JobReview = {
  status: 'draft',
  techComment: '',
  saComment: '',
  note: null,
};

export function readReviews(): Record<string, JobReview> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, JobReview>;
  } catch {
    return {};
  }
}

export function getReview(jobId: string): JobReview {
  return readReviews()[jobId] ?? { ...EMPTY };
}

export function writeReview(jobId: string, next: JobReview) {
  if (typeof window === 'undefined') return;
  const map = readReviews();
  map[jobId] = next;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}
