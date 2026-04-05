import type { ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
}

export const StepContainer = ({ children }: StepContainerProps) => (
  <div className="flex flex-col gap-4 p-4">{children}</div>
);
