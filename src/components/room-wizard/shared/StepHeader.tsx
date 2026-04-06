interface StepHeaderProps {
  title: string;
  description?: string;
}

export const StepHeader = ({ title, description }: StepHeaderProps) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    {description && <p className="mt-1 text-sm text-muted">{description}</p>}
  </div>
);
