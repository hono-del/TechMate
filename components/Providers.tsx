'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { WorkflowProvider } from '@/context/WorkflowContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WorkflowProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </WorkflowProvider>
  );
}
