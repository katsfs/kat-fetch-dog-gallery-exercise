'use client'

import { getBreedName } from "@/components/util";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "fetch-test-selected-breeds";

interface BreedImageInfo {
  [name: string]: string
}

interface BreedsContextProps {
  breeds: { [name: string]: string[] };
  selectedBreeds: BreedImageInfo;
  onBreedSelected: (breed: string, subBreed?: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  isLoading: boolean;
}

const BreedsContext = createContext<BreedsContextProps>({
  breeds: {},
  selectedBreeds: {},
  onBreedSelected: () => undefined,
  onSelectAll: () => undefined,
  onUnselectAll: () => undefined,
  isLoading: false
});

export const useBreedsContext = () => useContext(BreedsContext);

export const BreedsContextProvider = ({ children } : { children?: ReactNode }) => {
  const [breeds, setBreeds] = useState<{[name: string]: string[]}>({});
  const [selectedBreeds, setSelectedBreeds] = useState<BreedImageInfo>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const localStorageSelectedBreeds = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (localStorageSelectedBreeds) {
      setSelectedBreeds(JSON.parse(localStorageSelectedBreeds));
    }

    fetch('https://dog.ceo/api/breeds/list/all')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error Getting Breeds');
      })
      .then((data: { message: {[name: string]: string[]}, status: string }) => {
        if (data.status === "success") {
          setBreeds(data.message);
        }

        throw new Error('Error Getting Breeds');
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => setIsLoading(false), [selectedBreeds]);

  const updateLocalStorage = (newSelectedBreeds: BreedImageInfo) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSelectedBreeds));

  const requestBreedImage = useCallback(async (breed: string, subBreed?: string) : Promise<BreedImageInfo | undefined> => {
    const breedName = getBreedName(breed, subBreed);

    if (selectedBreeds[breedName]) {
      return;
    }

    const breedRoute = subBreed ? breed + '/' + subBreed : breed;
    const response = await fetch(`https://dog.ceo/api/breed/${breedRoute}/images/random`);

    if (response.ok) {
      const data : { message: string, status: string } = await response.json();
    
      if (data.status === "success") {
        return { [breedName]: data.message };
      }
    }

    console.error(`Error Getting Image: ${breedRoute}`);
  }, [selectedBreeds]);

  const removeSelectedBreed = useCallback((prev: BreedImageInfo, breedName: string) => {
    // Created a new selected breeds object without removed breed
    const newSelectedBreeds = Object.keys(prev)
      .filter((key) => key !== breedName)
      .reduce((res: BreedImageInfo, key) => (res[key] = prev[key], res), {});

    updateLocalStorage(newSelectedBreeds);

    return newSelectedBreeds;
  }, []);

  const addSelectedBreed = useCallback((prev: BreedImageInfo, breedImageInfo: BreedImageInfo) => {
    const newSelectedBreeds: BreedImageInfo = ({ ...prev, ...breedImageInfo });

    updateLocalStorage(newSelectedBreeds);

    return newSelectedBreeds;
  }, []);

  const appendSelectedBreeds = useCallback((prev: BreedImageInfo, allBreedImages: (BreedImageInfo | undefined)[]) => {
    // Filter out failed requests
    const validBreeds = allBreedImages
      .filter((breedImageInfo): breedImageInfo is BreedImageInfo => breedImageInfo !== undefined);

    // Create a new object with new breeds appended
    const newSelectedBreeds: BreedImageInfo = Object.assign({}, prev, ...validBreeds);

    updateLocalStorage(newSelectedBreeds);

    return newSelectedBreeds;
  }, []);
  
  const onBreedSelected = useCallback(async (breed: string, subBreed?: string) => {
    setIsLoading(true);

    const breedName = getBreedName(breed, subBreed);

    if (selectedBreeds[breedName]) {
      setSelectedBreeds((prev) => removeSelectedBreed(prev, breedName));
    }
    else {
      requestBreedImage(breed, subBreed)
        .then((breedImageInfo) => {
          if (breedImageInfo) {
            setSelectedBreeds((prev) => addSelectedBreed(prev, breedImageInfo));
          }
        });
    }
  }, [selectedBreeds, setSelectedBreeds]);

  const onSelectAll = useCallback(() => {
    setIsLoading(true);

    const allBreedImageRequests = Object.keys(breeds).flatMap((breed) => {
      if (breeds[breed].length) {
        return breeds[breed].map((subBreed) => requestBreedImage(breed, subBreed));
      }
      else {
        return requestBreedImage(breed);
      }
    });

    Promise.all(allBreedImageRequests)
      .then((allBreedImages) => setSelectedBreeds((prev) => appendSelectedBreeds(prev, allBreedImages)));
  }, [breeds, requestBreedImage]);

  const onUnselectAll = useCallback(() => {
    updateLocalStorage({});
    setSelectedBreeds({});
  }, []);

  return (
    <BreedsContext.Provider value={{ breeds, selectedBreeds, onBreedSelected, onSelectAll, onUnselectAll, isLoading }}>
      {children}
    </BreedsContext.Provider>
  );
};
