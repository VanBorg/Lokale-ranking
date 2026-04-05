import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { SpaceEditor } from './SpaceEditor';
import { FloorCeilingEditor } from './FloorCeilingEditor';

export const Step2Spaces = () => (
  <StepContainer>
    <StepHeader
      title="Sub-ruimtes & Indeling"
      description="Voeg eventuele sub-ruimtes toe, zoals een inloopkast, nis of uitbouw. Stel ook het vloer- en plafondtype in."
    />
    <SpaceEditor />
    <FloorCeilingEditor />
  </StepContainer>
);
