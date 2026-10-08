'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { WorkflowProvider } from '@/context/WorkflowContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WorkflowProvider>
      <LanguageProvider>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </LanguageProvider>
    </WorkflowProvider>
  );
}
