'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── Reception answers: { questionId -> option index (0-based), -1 if unanswered } ──
export type ReceptionAnswers = Record<string, number>;

interface WorkflowContextType {
  receptionAnswers: ReceptionAnswers;
  setReceptionAnswers: (answers: ReceptionAnswers) => void;
  confirmedCauseId: string | null;
  setConfirmedCauseId: (id: string | null) => void;
  returnedFromRepair: boolean;
  setReturnedFromRepair: (value: boolean) => void;
  clearWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType>({
  receptionAnswers: {},
  setReceptionAnswers: () => {},
  confirmedCauseId: null,
  setConfirmedCauseId: () => {},
  returnedFromRepair: false,
  setReturnedFromRepair: () => {},
  clearWorkflow: () => {},
});

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [receptionAnswers, setReceptionAnswersState] = useState<ReceptionAnswers>({});
  const [confirmedCauseId, setConfirmedCauseIdState] = useState<string | null>(null);
  const [returnedFromRepair, setReturnedFromRepairState] = useState(false);

  const setReceptionAnswers = useCallback((answers: ReceptionAnswers) => {
    setReceptionAnswersState(answers);
  }, []);

  const setConfirmedCauseId = useCallback((id: string | null) => {
    setConfirmedCauseIdState(id);
  }, []);

  const setReturnedFromRepair = useCallback((value: boolean) => {
    setReturnedFromRepairState(value);
  }, []);

  const clearWorkflow = useCallback(() => {
    setReceptionAnswersState({});
    setConfirmedCauseIdState(null);
    setReturnedFromRepairState(false);
  }, []);

  return (
    <WorkflowContext.Provider value={{ receptionAnswers, setReceptionAnswers, confirmedCauseId, setConfirmedCauseId, returnedFromRepair, setReturnedFromRepair, clearWorkflow }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  return useContext(WorkflowContext);
}
