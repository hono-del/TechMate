'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function WorkPlanningRedirect() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  useEffect(() => {
    router.replace(`/job/${jobId}/repair`);
  }, [jobId, router]);

  return (
    <div className="p-8 text-sm text-slate-500">Redirecting to Repair…</div>
  );
}
