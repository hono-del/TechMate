'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── Reception answers: { questionId -> option index (0-based), -1 if unanswered } ──
export type ReceptionAnswers = Record<string, number>;

interface WorkflowContextType {
  receptionAnswers: ReceptionAnswers;
  setReceptionAnswers: (answers: ReceptionAnswers) => void;
  clearWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType>({
  receptionAnswers: {},
  setReceptionAnswers: () => {},
  clearWorkflow: () => {},
});

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [receptionAnswers, setReceptionAnswersState] = useState<ReceptionAnswers>({});

  const setReceptionAnswers = useCallback((answers: ReceptionAnswers) => {
    setReceptionAnswersState(answers);
  }, []);

  const clearWorkflow = useCallback(() => {
    setReceptionAnswersState({});
  }, []);

  return (
    <WorkflowContext.Provider value={{ receptionAnswers, setReceptionAnswers, clearWorkflow }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  return useContext(WorkflowContext);
}
