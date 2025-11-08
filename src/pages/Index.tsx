import { useGameStore } from '@/store/gameStore';
import IntroScreen from '@/components/IntroScreen';
import CharacterSetup from '@/components/CharacterSetup';
import GenreSelection from '@/components/GenreSelection';
import MainGameUI from '@/components/MainGameUI';
import Settings from '@/components/Settings';
import ShopPage from '@/components/ShopPage';
import CraftingPage from '@/components/CraftingPage';
import CodexPage from '@/components/CodexPage';

const Index = () => {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <div className="min-h-screen">
      {currentScreen === 'intro' && <IntroScreen />}
      {currentScreen === 'character' && <CharacterSetup />}
      {currentScreen === 'genre' && <GenreSelection />}
      {currentScreen === 'game' && <MainGameUI />}
      {currentScreen === 'settings' && <Settings />}
      {currentScreen === 'shop' && <ShopPage />}
      {currentScreen === 'crafting' && <CraftingPage />}
      {currentScreen === 'codex' && <CodexPage />}
    </div>
  );
};

export default Index;
