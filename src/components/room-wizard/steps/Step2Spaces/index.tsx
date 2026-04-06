import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { SpaceEditor } from './SpaceEditor';
import { RoomOutlineSummary } from './RoomOutlineSummary';

export const Step2Spaces = () => (
  <StepContainer>
    <StepHeader
      title="Zones in de kamer"
      description="Stap 1 heeft de buitenkant van de kamer vastgelegd. Hier plaats je sub-ruimtes (zones) binnen die kamer. Sleep ze op de plattegrond links naar de juiste plek."
    />
    <RoomOutlineSummary />
    <div className="mt-1 border-t border-white/10 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Sub-ruimtes
      </p>
      <SpaceEditor />
    </div>
  </StepContainer>
);
