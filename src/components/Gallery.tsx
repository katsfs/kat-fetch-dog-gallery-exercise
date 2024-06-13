'use client'

import { useBreedsContext } from "@/contexts/BreedsContext";
import classNames from "classnames";

export default function Gallery() {

  const { selectedBreeds, isLoading } = useBreedsContext();
  
    return (
        <div className="gallery">
          {Object.keys(selectedBreeds).map((selectedBreed) => (
            <div className="breed-card" key={selectedBreed}>
              <div className="breed-image-box">
                <div className="breed-image"><img src={selectedBreeds[selectedBreed]} alt={selectedBreed} /></div>
              </div>
              <div>{selectedBreed}</div>
            </div>
          ))}
          <div className={classNames("breed-card", { hidden: !isLoading })}>
            <div className="breed-image-box">
              <div className="breed-image">
                <div id="spinner" />
              </div>
            </div>
            <div>...loading</div>
          </div>
        </div>
    );
};
