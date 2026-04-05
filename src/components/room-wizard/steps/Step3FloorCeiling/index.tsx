import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { FloorCeilingEditor } from '../Step2Spaces/FloorCeilingEditor';

export const Step3FloorCeiling = () => (
  <StepContainer>
    <StepHeader
      title="Vloer & Plafond"
      description="Kies het vloertype en plafondtype, en noteer eventuele bijzonderheden."
    />
    <FloorCeilingEditor />
  </StepContainer>
);
