import { useRef } from 'react';
import { useUiStore } from '../../../../store/uiStore';
import { useRoomStore } from '../../../../store/roomStore';
import { Button } from '../../../ui/Button';

export const WallPhotoUpload = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wallIndex = useUiStore((s) => s.activeWallIndex);
  const walls = useRoomStore((s) => s.draft.walls);
  const addPhoto = useRoomStore((s) => s.addWallPhoto);
  const removePhoto = useRoomStore((s) => s.removeWallPhoto);

  const wall = walls[wallIndex];
  if (!wall) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          addPhoto(wall.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white">Foto&apos;s</p>

      {wall.photos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {wall.photos.map((src, i) => (
            <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-md border border-line">
              <img src={src} alt={`Wand foto ${i + 1}`} className="h-full w-full object-cover" />
              <button
                className="absolute right-0 top-0 hidden rounded-bl bg-red-600 px-1 text-xs text-white group-hover:block"
                onClick={() => removePhoto(wall.id, i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="secondary"
        className="text-xs"
        onClick={() => inputRef.current?.click()}
      >
        + Foto uploaden
      </Button>
    </div>
  );
};
