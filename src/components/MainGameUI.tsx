import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import AdventureLogModal from '@/components/AdventureLogModal';
import InventoryModal from '@/components/InventoryModal';
import CombatPanel from '@/components/CombatPanel';
import QuestTracker from '@/components/QuestTracker';
import CharacterSheet from '@/components/CharacterSheet';
import WorldMapModal from '@/components/WorldMapModal';
import Statistics from '@/components/Statistics';
import ShareModal from '@/components/ShareModal';
import Tutorial from '@/components/Tutorial';
import { AchievementGallery } from '@/components/AchievementNotification';
import { storage, setupAutoSave } from '@/utils/storage';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { api } from '@/services/api';
import {
  Sword,
  Shield,
  Package,
  Heart,
  Zap,
  Book,
  ArrowUp,
  Play,
  Settings,
  LogOut,
  Save,
  HelpCircle,
  Menu,
  Map,
  BarChart3,
  Share2,
  Trophy,
  Target,
  User,
} from 'lucide-react';

const MainGameUI = () => {
  const {
    player,
    currentStory,
    playerChoices,
    inCombat,
    currentEnemy,
    storyLog,
    genre,
    gameState,
    updateStory,
    setPlayerChoices,
    addStoryEvent,
    startCombat,
    addItem,
    addQuest,
    updateGameState,
    setScreen,
    resetGame,
  } = useGameStore();

  const { t } = useTranslation();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAdventureLog, setShowAdventureLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [loadingStory, setLoadingStory] = useState(false);

  // Auto-save setup
  useEffect(() => {
    const cleanup = setupAutoSave(() => useGameStore.getState());
    return cleanup;
  }, []);

  // Check tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  // Initialize game with AI-generated story and loot
  useEffect(() => {
    if (!player || !genre || gameState.isInitialized) return;
    
    const initializeGame = async () => {
      try {
        setLoadingStory(true);
        const request = {
          player,
          genre: genre || 'Fantasy',
          previousEvents: [],
          choice: undefined,
        };
        
        const res = await api.initializeGame(request as any);
        
        if (res.story) {
          updateStory(res.story);
          addStoryEvent({ text: res.story, type: 'story' });
        }
        
        if (res.choices && Array.isArray(res.choices)) {
          setPlayerChoices(res.choices);
        }
        
        if (res.quest) {
          addQuest(res.quest);
        }
        
        if (res.items && Array.isArray(res.items)) {
          res.items.forEach((item: any) => addItem(item));
        }
        
        updateGameState({ isInitialized: true, turnCount: 0 });
      } catch (error) {
        console.error('Failed to initialize game:', error);
        // Fallback to basic story
        updateStory("Your adventure begins...");
        setPlayerChoices(['Explore', 'Investigate', 'Proceed']);
        updateGameState({ isInitialized: true, turnCount: 0 });
      } finally {
        setLoadingStory(false);
      }
    };
    
    initializeGame();
  }, [player, genre, gameState.isInitialized]);

  // Display story instantly (no typewriter delay)
  useEffect(() => {
    if (!currentStory) return;
    setDisplayedText(currentStory);
    setIsTyping(false);
  }, [currentStory]);

  const handleChoice = async (choice: string) => {
    if (!player) return;
    // Prevent concurrent requests
    if (loadingStory) return;
    
    // Immediate UI feedback - clear choices instantly
    setPlayerChoices([]);
    setLoadingStory(true);
    
    try {
      // Update turn count
      const newTurnCount = gameState.turnCount + 1;
      
      // Prepare request object with game state
      const request = {
        player,
        genre: genre || 'Fantasy',
        previousEvents: storyLog || [],
        choice,
        gameState: {
          turnCount: newTurnCount,
          storyPhase: gameState.storyPhase,
          combatEncounters: gameState.combatEncounters,
          isAfterCombat: gameState.isAfterCombat,
          isFinalPhase: gameState.isFinalPhase,
        },
      };

      // Call backend
      const res = await api.generateStory(request as any);

      // Update story and choices instantly
      if (res.story) {
        updateStory(res.story);
        addStoryEvent({ text: res.story, type: 'story' });
      }

      if (res.choices && Array.isArray(res.choices)) {
        setPlayerChoices(res.choices);
      } else {
        setPlayerChoices([]);
      }

      // Update game state
      updateGameState({
        turnCount: newTurnCount,
        storyPhase: res.storyPhase || newStoryPhase,
        isAfterCombat: false,
      });

      // If an enemy is returned, start combat
      if ((res as any).enemy && res.shouldStartCombat) {
        try {
          startCombat((res as any).enemy as any);
          updateGameState({ storyPhase: 'combat' });
        } catch (e) {
          console.warn('Failed to start combat from response', e);
        }
      }

      // Add any items returned
      if (res.items && Array.isArray(res.items)) {
        res.items.forEach((it: any) => addItem(it));
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to get story from server. Using fallback.');
      // Fallback minimal behavior
      updateStory(`You chose to ${choice.toLowerCase()}. The path continues...`);
      setPlayerChoices(['Approach cautiously', 'Draw your weapon', 'Retreat quietly']);
      updateGameState({ turnCount: gameState.turnCount + 1 });
    } finally {
      setLoadingStory(false);
    }
  };

  const handleSaveGame = () => {
    const state = useGameStore.getState();
    const success = storage.saveToSlot(
      'manual-save',
      `${player?.name} - Level ${player?.level}`,
      state
    );
    if (success) {
      toast.success(t('messages.gameSaved'));
    } else {
      toast.error('Failed to save game');
    }
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit? Make sure to save your progress!')) {
      setScreen('intro');
    }
  };

  const handleOpenSettings = () => {
    setScreen('settings');
  };

  const handleHelp = () => {
    toast.info('Controls: Use the action buttons below to interact with the game. Make choices to progress your story!', {
      duration: 5000,
    });
  };

  if (!player) return null;

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const xpPercentage = (player.xp / player.maxXp) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Tutorial */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

      {/* Combat Panel */}
      <AnimatePresence>
        {inCombat && <CombatPanel />}
      </AnimatePresence>

      {/* Modals */}
      <AdventureLogModal
        isOpen={showAdventureLog}
        onClose={() => setShowAdventureLog(false)}
      />
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
      <Statistics
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
      <AchievementGallery
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
      <WorldMapModal
        isOpen={showWorldMap}
        onClose={() => setShowWorldMap(false)}
      />

      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${dungeonBg})` }}
        />
        <div className="absolute inset-0 bg-background/75" />
      </motion.div>

      {/* Main Game Container */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
        {/* Top HUD */}
        <div className="p-4 bg-card/90 backdrop-blur-sm border-b-2 border-primary/30">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Player Info */}
              <div>
                <h2 className="text-2xl font-fantasy text-primary">{player.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Level {player.level} {player.class}
                </p>
              </div>

              {/* Health Bar */}
              <div className="min-w-48">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold">
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-3 bg-muted" />
              </div>

              {/* XP Bar */}
              <div className="min-w-48">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">
                    XP: {player.xp}/{player.maxXp}
                  </span>
                </div>
                <Progress value={xpPercentage} className="h-3 bg-muted" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowInventory(true)}
                title={t('game.inventory')}
              >
                <Package className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowAdventureLog(true)}
                title={t('game.log')}
              >
                <Book className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowWorldMap(true)}
                title={t('game.map')}
              >
                <Map className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowStatistics(true)}
                title="Statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowAchievements(true)}
                title={t('game.achievements')}
              >
                <Trophy className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowShare(true)}
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleSaveGame}
                title={t('game.save')}
              >
                <Save className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleHelp}
                title={t('game.help')}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleOpenSettings}
                title={t('game.settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-destructive/20 border-destructive/30"
                onClick={handleExitGame}
                title={t('game.exit')}
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 container mx-auto p-4 flex gap-4 overflow-y-auto">
          {/* Story Panel (Left) */}
          <Card className="flex-1 panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-6 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border flex-shrink-0">
              <Book className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-fantasy text-primary">The Tale Unfolds</h3>
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert font-elegant text-lg leading-relaxed"
              >
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-primary"
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            </ScrollArea>

            {/* Player Choices - Always visible at bottom */}
            {!isTyping && playerChoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mt-6 pt-6 border-t border-border flex-shrink-0"
              >
                <p className="text-sm text-muted-foreground font-semibold mb-3">
                  What will you do?
                </p>
                {playerChoices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    disabled={loadingStory}
                    className={`w-full justify-start text-left h-auto py-4 px-6 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary transition-all duration-300 group ${
                      loadingStory ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                    <span className="font-elegant text-base">{choice}</span>
                  </Button>
                ))}
              </motion.div>
            )}
          </Card>

          {/* Stats & Actions Panel (Right) */}
          <div className="w-80 space-y-4">
            {/* Tabs for different views */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stats" className="text-xs">
                    <User className="w-4 h-4 mr-1" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="quests" className="text-xs">
                    <Target className="w-4 h-4 mr-1" />
                    Quests
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-xs">
                    <Map className="w-4 h-4 mr-1" />
                    Map
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      <span className="font-semibold text-primary">
                        {player.stats.strength}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Intelligence</span>
                      <span className="font-semibold text-primary">
                        {player.stats.intelligence}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Agility</span>
                      <span className="font-semibold text-primary">
                        {player.stats.agility}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quests" className="mt-4 max-h-64 overflow-y-auto">
                  <QuestTracker />
                </TabsContent>

                <TabsContent value="map" className="mt-4">
                  <Button
                    onClick={() => setShowWorldMap(true)}
                    className="w-full gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Open Full Map
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Explore the world and discover new locations
                  </p>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Action Buttons */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <h3 className="text-lg font-fantasy text-primary mb-4">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-destructive/20 border-destructive/30"
                  onClick={() => toast.info('Combat action - Coming soon!')}
                >
                  <Sword className="w-6 h-6" />
                  <span className="text-xs">Attack</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 border-secondary/30"
                  onClick={() => toast.info('Defense action - Coming soon!')}
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-xs">Defend</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/20 border-primary/30"
                  onClick={() => setShowInventory(true)}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs">Use Item</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-accent/20 border-accent/30"
                  onClick={() => toast.info('Jump action - Coming soon!')}
                >
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-xs">Jump</span>
                </Button>
              </div>
            </Card>

            {/* Inventory Preview */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <h3 className="text-lg font-fantasy text-primary mb-4">Inventory</h3>
              {player.inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  Your inventory is empty
                </p>
              ) : (
                <div className="space-y-2">
                  {player.inventory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainGameUI;
