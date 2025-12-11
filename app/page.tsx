import ConverterApp from "./components/ConverterApp";
import VLMProvider from "./context/VLMContext";

export default function Home() {
  return (
    <main>
      <VLMProvider>
        <ConverterApp />
      </VLMProvider>
    </main>
  );
}
