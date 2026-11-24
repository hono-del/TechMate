'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getJob } from '@/data/mockData';
import { jobOpenHref } from '@/data/jobAssignment';

export default function JobIndexPage() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const jobId = params.jobId as string;

  useEffect(() => {
    if (!ready || !user) return;
    const job = getJob(jobId);
    const step = job?.currentStep ?? 'reception';
    router.replace(jobOpenHref(jobId, step, user.role));
  }, [ready, user, jobId, router]);

  return (
    <div className="p-8 text-sm text-slate-500">Loading…</div>
  );
}
