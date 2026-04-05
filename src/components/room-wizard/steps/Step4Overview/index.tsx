import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { RoomSummary } from './RoomSummary';
import { SaveActions } from './SaveActions';

export const Step4Overview = () => (
  <StepContainer>
    <StepHeader
      title="Overzicht & Bevestiging"
      description="Controleer alle gegevens en sla de kamer op."
    />
    <RoomSummary />
    <SaveActions />
  </StepContainer>
);
