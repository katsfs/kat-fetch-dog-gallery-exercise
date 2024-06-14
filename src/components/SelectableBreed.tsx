import { useBreedsContext } from "@/contexts/BreedsContext";
import { useCallback, useMemo } from "react";
import { getBreedName } from "./util";
import classNames from "classnames";

export default function SelectableBreed ({ breed, subBreed } : Readonly<{ breed: string, subBreed?: string }>) {
  const { selectedBreeds, onBreedSelected } = useBreedsContext();
  const breedName = useMemo(() => getBreedName(breed, subBreed), [breed, subBreed]);

  const onClick = useCallback(() => onBreedSelected(breed, subBreed), [onBreedSelected]);

  return (
    <button className={classNames("selectable-breed", { selected: !!selectedBreeds[breedName] })} onClick={onClick}>
      {subBreed ?? breed}
    </button>
  );
};
