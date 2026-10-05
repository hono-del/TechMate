import { notFound } from 'next/navigation';
import { getJob } from '@/data/mockData';
import { ContextHeader } from '@/components/workflow/ContextHeader';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';

interface JobLayoutProps {
  children: React.ReactNode;
  params: Promise<{ jobId: string }>;
}

export default async function JobLayout({ children, params }: JobLayoutProps) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) notFound();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed context header */}
      <div className="flex-shrink-0">
        <ContextHeader job={job} />
        <WorkflowStepper jobId={jobId} />
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}
