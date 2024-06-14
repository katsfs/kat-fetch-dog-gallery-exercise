'use client'

import SelectableBreed from "./SelectableBreed";
import { useBreedsContext } from "@/contexts/BreedsContext";

export default function BreedList() {
  const { breeds, onSelectAll, onUnselectAll } = useBreedsContext();

  return (
    <div className="breed-list">
      <div className="breed-list-title">Select Breeds</div>
      <div className="breed-list-options">
        {Object.keys(breeds).map((breed) =>
          breeds[breed].length === 0
          ? <SelectableBreed key={breed} breed={breed} />
          : (
            <div className="sub-breed-list" key={breed}>
              <div className="breed-title" key={breed}>{breed}</div>
              {(breeds[breed]).map((subBreed) => (
                  <SelectableBreed key={subBreed} breed={breed} subBreed={subBreed} />
              ))}
            </div>
          )
        )}
      </div>
      <div className="breed-list-footer">
        <button onClick={onSelectAll}>Select All</button>
        <button onClick={onUnselectAll}>Unselect All</button>
      </div>
    </div>
  );
};
