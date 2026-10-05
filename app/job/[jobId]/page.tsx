import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobIndexPage({ params }: PageProps) {
  const { jobId } = await params;
  redirect(`/job/${jobId}/reception`);
}
