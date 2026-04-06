import { StepContainer } from '../../shared/StepContainer';
import { StepHeader } from '../../shared/StepHeader';
import { WallCarousel } from './WallCarousel';
import { WallCanvas } from './WallCanvas';
import { WallElementPicker } from './WallElementPicker';
import { WallElementList } from './WallElementList';
import { WallDetailEditor } from './WallDetailEditor';
import { WallPhotoUpload } from './WallPhotoUpload';

export const Step3Walls = () => (
  <StepContainer>
    <StepHeader
      title="Wanden"
      description="De plattegrond links blijft je volledige kamer tonen. Hieronder kies je per wand elementen en details — de kaart is ter referentie, het echte werk gebeurt in dit paneel."
    />
    <WallCarousel />
    <WallCanvas />
    <WallElementPicker />
    <WallElementList />
    <WallDetailEditor />
    <WallPhotoUpload />
  </StepContainer>
);
