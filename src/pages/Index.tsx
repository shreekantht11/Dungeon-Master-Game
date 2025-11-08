import { useGameStore } from '@/store/gameStore';
import IntroScreen from '@/components/IntroScreen';
import CharacterSetup from '@/components/CharacterSetup';
import GenreSelection from '@/components/GenreSelection';
import MainGameUI from '@/components/MainGameUI';
import Settings from '@/components/Settings';
import ShopPage from '@/components/ShopPage';
import CraftingPage from '@/components/CraftingPage';
import CodexPage from '@/components/CodexPage';
import MilestonesPage from '@/components/MilestonesPage';
import EventsPage from '@/components/EventsPage';
import CollectionsPage from '@/components/CollectionsPage';
import ProgressionPage from '@/components/ProgressionPage';
import StoryReplayPage from '@/components/StoryReplayPage';
import LeaderboardsPage from '@/components/LeaderboardsPage';
import UnlocksPage from '@/components/UnlocksPage';
import ProfilePage from '@/components/ProfilePage';

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
      {currentScreen === 'milestones' && <MilestonesPage />}
      {currentScreen === 'events' && <EventsPage />}
      {currentScreen === 'collections' && <CollectionsPage />}
      {currentScreen === 'progression' && <ProgressionPage />}
      {currentScreen === 'replay' && <StoryReplayPage />}
      {currentScreen === 'leaderboards' && <LeaderboardsPage />}
      {currentScreen === 'unlocks' && <UnlocksPage />}
      {currentScreen === 'profile' && <ProfilePage />}
    </div>
  );
};

export default Index;
