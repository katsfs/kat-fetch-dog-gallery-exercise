import BreedList from "@/components/BreedList";
import { BreedsContextProvider } from "@/contexts/BreedsContext";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <main>
      <BreedsContextProvider>
        <BreedList />
        <Gallery />
      </BreedsContextProvider>
    </main>
  )
}
