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
      description="Navigeer door elke wand en voeg elementen en details toe."
    />
    <WallCarousel />
    <WallCanvas />
    <WallElementPicker />
    <WallElementList />
    <WallDetailEditor />
    <WallPhotoUpload />
  </StepContainer>
);
