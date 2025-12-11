import MainLandingPage from "./components/MainLandingPage";
import VLMProvider from "./context/VLMContext";

export default function Home() {
  return (
    <main>
      <VLMProvider>
        <MainLandingPage />
      </VLMProvider>
    </main>
  );
}
