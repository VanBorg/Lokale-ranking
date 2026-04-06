import { useRoomStore } from '../../../../store/roomStore';

export const VertexEditor = () => {
  const vertices = useRoomStore((s) => s.draft.vertices);
  const updateVertex = useRoomStore((s) => s.updateVertex);
  const addVertex = useRoomStore((s) => s.addVertex);
  const removeVertex = useRoomStore((s) => s.removeVertex);

  const canRemove = vertices.length > 3;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Hoekpunten
      </p>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-2 py-1.5 text-left font-medium w-6"></th>
              <th className="px-2 py-1.5 text-left font-medium">X (cm)</th>
              <th className="px-2 py-1.5 text-left font-medium">Y (cm)</th>
              <th className="px-2 py-1.5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vertices.map((v, i) => (
              <tr key={i} className="bg-white">
                <td className="px-2 py-1 text-gray-400 font-medium">
                  {String.fromCharCode(65 + i)}
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs focus:border-orange-400 focus:outline-none"
                    value={v.x}
                    min={0}
                    onChange={(e) =>
                      updateVertex(i, { x: parseInt(e.target.value, 10) || 0, y: v.y })
                    }
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs focus:border-orange-400 focus:outline-none"
                    value={v.y}
                    min={0}
                    onChange={(e) =>
                      updateVertex(i, { x: v.x, y: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </td>
                <td className="px-1 py-1">
                  <div className="flex gap-1 justify-end">
                    <button
                      type="button"
                      title="Punt toevoegen na dit punt"
                      onClick={() => addVertex(i)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      title="Punt verwijderen"
                      onClick={() => removeVertex(i)}
                      disabled={!canRemove}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
