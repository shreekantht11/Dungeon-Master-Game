import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Badge } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge as UIBadge } from '@/components/ui/badge';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import AdventureLogModal from '@/components/AdventureLogModal';
import InventoryModal from '@/components/InventoryModal';
import CombatPanel from '@/components/CombatPanel';
import PuzzlePanel from '@/components/PuzzlePanel';
import QuestTracker from '@/components/QuestTracker';
import CharacterSheet from '@/components/CharacterSheet';
import WorldMapModal from '@/components/WorldMapModal';
import Statistics from '@/components/Statistics';
import ShareModal from '@/components/ShareModal';
import TrophyRoom from '@/components/TrophyRoom';
import CameoInviteModal from '@/components/CameoInviteModal';
import CameoJoinModal from '@/components/CameoJoinModal';
import Tutorial from '@/components/Tutorial';
import { AchievementGallery } from '@/components/AchievementNotification';
import ExitDialog from '@/components/ExitDialog';
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
  Award,
  Target,
  User,
  UserPlus,
  Users,
  Activity,
  Wifi,
  WifiOff,
  CheckCircle2,
  Gauge,
  Clock,
  Loader2,
} from 'lucide-react';

const MainGameUI = () => {
  const {
    player,
    currentStory,
    playerChoices,
    inCombat,
    currentEnemy,
    currentPuzzle,
    storyLog,
    genre,
    gameState,
    activeQuests,
    currentDungeonLevel,
    currentLocation,
    updateStory,
    setPlayerChoices,
    addStoryEvent,
    startCombat,
    addItem,
    addQuest,
    updateGameState,
    setPuzzle,
    updatePlayer,
    setScreen,
    resetGame,
    badges,
    setBadges,
    unlockBadges,
    cameos,
    setCameos,
    addCameo,
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
  const [showTrophyRoom, setShowTrophyRoom] = useState(false);
  const [showCameoInvite, setShowCameoInvite] = useState(false);
  const [showCameoJoin, setShowCameoJoin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [aiStatus, setAiStatus] = useState<'active' | 'offline' | 'idle'>('idle');
  const [activeTab, setActiveTab] = useState('stats');
  const [loadingStory, setLoadingStory] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [storySpeed, setStorySpeed] = useState(1); // 0.5x, 1x, 2x multiplier
  const [quickSaves, setQuickSaves] = useState<any[]>([]);
  const { textSpeed, updateSettings, authUser } = useGameStore();

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
        setDisplayedText(''); // Clear story text to show loading message
        setLoadingStory(true);
        setAiStatus('active');
        setBadges([]);
        setCameos([]);
        const request = {
          player,
          genre: genre || 'Fantasy',
          previousEvents: [],
          choice: undefined,
        };
        
        const res = await api.initializeGame(request as any);
        
        // Check if using fallback (API service returns fallback on error)
        if (res.isFallback) {
          setAiStatus('offline');
        } else {
          setAiStatus('active');
        }
        
        if (res.story) {
          // Ensure story is a string, not an object
          const storyText = typeof res.story === 'string' ? res.story : String(res.story || '');
          updateStory(storyText);
          addStoryEvent({ text: storyText, type: 'story' });
        }
        
        if (Array.isArray(res.unlockedBadges) && res.unlockedBadges.length > 0) {
          const newlyUnlocked = res.unlockedBadges as Badge[];
          unlockBadges(newlyUnlocked);
          newlyUnlocked.forEach((badge) => {
            toast.success(`🏅 ${badge.title}`, {
              description: badge.description,
            });
          });
        }

        if (Array.isArray(res.badges)) {
          setBadges(res.badges as Badge[]);
        }

        if (Array.isArray((res as any).cameos)) {
          setCameos((res as any).cameos as any);
        }

        if (res.choices && Array.isArray(res.choices)) {
          // Filter and ensure all choices are strings (not objects)
          const validChoices = res.choices
            .filter((choice: any) => typeof choice === 'string')
            .map((choice: string) => String(choice).trim())
            .filter((choice: string) => choice.length > 0);
          setPlayerChoices(validChoices.length > 0 ? validChoices : ['Continue', 'Explore', 'Investigate']);
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
        setAiStatus('offline');
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

  // Load quick saves
  useEffect(() => {
    const loadQuickSaves = async () => {
      if (!authUser?.name) return;
      try {
        const saves = await api.getSaves(authUser.name);
        if (saves && saves.length > 0) {
          setQuickSaves(saves.slice(0, 5)); // Top 5 saves
        }
      } catch (e) {
        // Silently fail
      }
    };
    loadQuickSaves();
  }, [authUser?.name, gameState.turnCount]);

  // Typewriter effect for story animation
  useEffect(() => {
    if (!currentStory) return;
    
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    
    // Calculate speed: base textSpeed (50ms) divided by storySpeed multiplier
    const baseSpeed = textSpeed || 50;
    const actualSpeed = baseSpeed / storySpeed;
    
    const interval = setInterval(() => {
      if (index < currentStory.length) {
        setDisplayedText((prev) => prev + currentStory[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, actualSpeed);

    return () => clearInterval(interval);
  }, [currentStory, storySpeed, textSpeed]);

  const handleChoice = async (choice: string) => {
    if (!player) return;
    // Prevent concurrent requests
    if (loadingStory) return;
    
    // Handle final puzzle answer
    if (gameState.storyPhase === 'final-puzzle' && currentPuzzle) {
      const isCorrect = choice.toLowerCase().includes(currentPuzzle.correctAnswer.toLowerCase()) || 
                       currentPuzzle.correctAnswer.toLowerCase().includes(choice.toLowerCase());
      
      if (isCorrect) {
        toast.success('🎉 Puzzle Solved! You Win!');
        addStoryEvent({ text: 'You solved the puzzle and completed your quest!', type: 'story' });
        updateGameState({ isFinalPhase: false, storyPhase: 'completed' });
        setPuzzle(null);
        // Give victory rewards
        updatePlayer({ xp: player.xp + 500 });
        return;
      } else {
        toast.error('❌ Wrong Answer! Game Over!');
        addStoryEvent({ text: 'You failed to solve the puzzle. The adventure ends...', type: 'story' });
        setTimeout(() => {
          resetGame();
          setScreen('intro');
        }, 3000);
        return;
      }
    }
    
    // Immediate UI feedback - clear choices instantly
    setPlayerChoices([]);
    setDisplayedText(''); // Clear story text to show loading message
    setLoadingStory(true);
    setAiStatus('active');
    
    try {
      // Update turn count
      const newTurnCount = gameState.turnCount + 1;
      
      // Get active quest (first one if multiple)
      const activeQuest = activeQuests.length > 0 ? activeQuests[0] : null;
      
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
          combatEscapes: gameState.combatEscapes || 0,
          isAfterCombat: gameState.isAfterCombat,
          isFinalPhase: gameState.isFinalPhase,
          badges,
          cameos,
        },
        activeQuest: activeQuest,
        currentLocation: currentLocation,
      };

      // Call backend
      const res = await api.generateStory(request as any);

      // Check if using fallback
      if (res.isFallback) {
        setAiStatus('offline');
      } else {
        setAiStatus('active');
      }

      // Update story and choices instantly
      if (res.story) {
        // Ensure story is a string, not an object
        const storyText = typeof res.story === 'string' ? res.story : String(res.story || '');
        updateStory(storyText);
        addStoryEvent({ text: storyText, type: 'story' });
      }

      if (res.choices && Array.isArray(res.choices)) {
        // Filter and ensure all choices are strings (not objects)
        const validChoices = res.choices
          .filter((choice: any) => typeof choice === 'string')
          .map((choice: string) => String(choice).trim())
          .filter((choice: string) => choice.length > 0);
        setPlayerChoices(validChoices.length > 0 ? validChoices : ['Continue', 'Explore', 'Investigate']);
      } else {
        setPlayerChoices([]);
      }

      if (Array.isArray((res as any).badges)) {
        setBadges((res as any).badges as Badge[]);
      }

      if (Array.isArray((res as any).cameos)) {
        setCameos((res as any).cameos as any);
      }

      // Update quest progress based on AI-driven progress (from API response)
      if (res.questProgress !== undefined && activeQuest && activeQuests.length > 0) {
        const questIndex = activeQuests.findIndex(q => q.id === activeQuest.id);
        if (questIndex !== -1) {
          const quest = activeQuests[questIndex];
          const updatedQuest = {
            ...quest,
            progress: res.questProgress,
          };
          // Update quest in store
          const updatedQuests = [...activeQuests];
          updatedQuests[questIndex] = updatedQuest;
          useGameStore.setState({ activeQuests: updatedQuests });
        }
      }
      
      // Track combat escapes if player chose to hide/run
      if (choice && (choice.toLowerCase().includes('hide') || choice.toLowerCase().includes('run') || 
          choice.toLowerCase().includes('flee') || choice.toLowerCase().includes('escape'))) {
        const currentEscapes = gameState.combatEscapes || 0;
        updateGameState({ combatEscapes: currentEscapes + 1 });
      }

      // Update game state
      updateGameState({
        turnCount: newTurnCount,
        storyPhase: res.storyPhase || gameState.storyPhase,
        isAfterCombat: false,
        isFinalPhase: res.isFinalPhase || gameState.isFinalPhase,
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

      // Handle final puzzle (NOT combat) - show in popup like combat
      if (res.puzzle && res.isFinalPhase) {
        setPuzzle(res.puzzle);
        updateGameState({ storyPhase: 'final-puzzle', isFinalPhase: true });
        // Clear choices when puzzle appears
        setPlayerChoices([]);
      }

      // Add any items returned
      if (res.items && Array.isArray(res.items)) {
        res.items.forEach((it: any) => addItem(it));
      }

      // Auto-save to backend (best-effort)
      try {
        const latestState = useGameStore.getState();
        await api.saveGame({
          playerId: latestState.player?.name,
          saveSlot: 1,
          saveName: 'AutoSave',
          gameState: {
            player: latestState.player,
            genre: latestState.genre,
            story: latestState.currentStory,
            choices: latestState.playerChoices,
            storyPhase: latestState.gameState.storyPhase,
            turnCount: latestState.gameState.turnCount,
            combatEncounters: latestState.gameState.combatEncounters,
            combatEscapes: latestState.gameState.combatEscapes,
            isAfterCombat: latestState.gameState.isAfterCombat,
            isFinalPhase: latestState.gameState.isFinalPhase,
            puzzle: latestState.currentPuzzle,
            activeQuest: activeQuest,
            storyLog: latestState.storyLog,
            badges: latestState.badges,
            cameos: latestState.cameos,
          },
          storyLog: latestState.storyLog,
          badges: latestState.badges,
          cameos: latestState.cameos,
          schemaVersion: 1,
        });
      } catch (saveErr) {
        console.warn('Autosave failed', saveErr);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setAiStatus('offline');
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
    setShowExitDialog(true);
  };

  const confirmExitGame = () => {
    setShowExitDialog(false);
    setScreen('intro');
  };

  const cancelExitGame = () => {
    setShowExitDialog(false);
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

      {/* Puzzle Panel - Shows like combat popup */}
      <AnimatePresence>
        {currentPuzzle && gameState.storyPhase === 'final-puzzle' && <PuzzlePanel />}
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
      <TrophyRoom
        open={showTrophyRoom}
        onOpenChange={setShowTrophyRoom}
        badges={badges}
      />
      <CameoInviteModal
        open={showCameoInvite}
        onOpenChange={setShowCameoInvite}
      />
      <CameoJoinModal
        open={showCameoJoin}
        onOpenChange={setShowCameoJoin}
      />
      <ExitDialog
        open={showExitDialog}
        onConfirm={confirmExitGame}
        onCancel={cancelExitGame}
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
        <div className="p-3 bg-card/90 backdrop-blur-sm border-b-2 border-primary/30">
          <div className="container mx-auto flex flex-wrap items-center gap-3">
            {/* Left Section: Player Info + HP/XP Stacked */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[220px]">
              {/* Player Info */}
              <div className="flex-shrink-0">
                <h2 className="text-xl font-fantasy text-primary leading-tight">{player.name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground leading-tight">
                    Level {player.level} {player.class}
                  </p>
                  {currentDungeonLevel > 1 && (
                    <UIBadge variant="outline" className="text-xs">
                      Floor {currentDungeonLevel}
                    </UIBadge>
                  )}
                </div>
              </div>

              {/* HP and XP Bars - Stacked Vertically */}
              <div className="flex flex-col gap-1.5 min-w-40">
                {/* Health Bar */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-semibold">
                      {player.health}/{player.maxHealth}
                    </span>
                  </div>
                  <Progress value={healthPercentage} className="h-2 bg-muted" />
                </div>

                {/* XP Bar */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold">
                      XP: {player.xp}/{player.maxXp}
                    </span>
                  </div>
                  <Progress value={xpPercentage} className="h-2 bg-muted" />
                </div>
              </div>
            </div>

            {/* Center Section: AI Status + Quest Progress */}
            <div className="flex flex-1 flex-wrap items-center justify-center gap-3 min-w-[240px]">
              {/* Quest Progress Bar */}
              {activeQuests.length > 0 && (
                <div className="min-w-48 max-w-72 flex-shrink">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Target className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {activeQuests[0].title || 'Quest'}
                    </span>
                    {activeQuests[0].progress !== undefined && (
                      <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                        {activeQuests[0].progress}%
                      </span>
                    )}
                  </div>
                  <Progress 
                    value={activeQuests[0].progress || 0} 
                    className="h-2 bg-muted" 
                  />
                  {activeQuests[0].progress === 100 && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Quest Complete!</span>
                    </div>
                  )}
                </div>
              )}

              {cameos.length > 0 && (
                <div
                  className="flex flex-wrap items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 flex-shrink-0"
                  aria-label="Active cameo companions"
                >
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Cameos
                  </span>
                  {cameos.slice(0, 3).map((cameo) => (
                    <span
                      key={cameo.code}
                      className="rounded-full border border-primary/40 bg-background/90 px-1.5 py-0.5 text-xs font-medium text-foreground"
                      aria-label={`Cameo ally ${cameo.guest?.name || 'Unnamed hero'}`}
                    >
                      {cameo.guest?.name || 'Ally'}
                    </span>
                  ))}
                  {cameos.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{cameos.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Section: Speed Controls, Quick Saves, Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto min-w-[260px] flex-wrap justify-end">
              {/* Story Speed Controls */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50 border border-border/50">
                <Gauge className="w-3 h-3 text-muted-foreground" />
                {[0.5, 1, 2].map((speed) => (
                  <Button
                    key={speed}
                    variant={storySpeed === speed ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 px-1.5 text-xs"
                    onClick={() => setStorySpeed(speed)}
                    title={`${speed}x speed`}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>

              {/* Quick Save Slots */}
              {quickSaves.length > 0 && (
                <div className="flex items-center gap-1">
                  <Save className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex gap-1">
                    {quickSaves.slice(0, 3).map((save, idx) => (
                      <Button
                        key={save._id || idx}
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-xs"
                        onClick={async () => {
                          try {
                            const loaded = await api.loadGame(save._id);
                            if (loaded?.player) useGameStore.setState({ player: loaded.player });
                            if (loaded?.genre) setGenre(loaded.genre);
                            if (loaded?.story) updateStory(loaded.story);
                            if (Array.isArray(loaded?.choices)) setPlayerChoices(loaded.choices);
                            toast.success('Game loaded');
                          } catch (e) {
                            toast.error('Failed to load save');
                          }
                        }}
                        title={save.name || `Save ${idx + 1}`}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-1.5">
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
                onClick={() => setShowTrophyRoom(true)}
                title="Trophy Room"
              >
                <span className="relative inline-flex">
                  <Trophy className="w-5 h-5" />
                  {badges.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {badges.length}
                    </span>
                  )}
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowAchievements(true)}
                title={t('game.achievements')}
              >
                <Award className="w-5 h-5" />
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
                onClick={() => setShowCameoInvite(true)}
                title="Invite Cameo"
              >
                <UserPlus className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowCameoJoin(true)}
                title="Join with Code"
              >
                <Users className="w-5 h-5" />
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
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 container mx-auto p-4 flex gap-4 overflow-y-auto">
          {/* Story Panel (Left) */}
          <Card className="flex-1 panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-6 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border flex-shrink-0">
              <Book className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-fantasy text-primary">The Tale Unfolds</h3>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50 border border-border/50">
                {aiStatus === 'active' ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-green-500">AI Active</span>
                  </>
                ) : aiStatus === 'offline' ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-500">AI Offline</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">AI Idle</span>
                  </>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert font-elegant text-lg leading-relaxed"
              >
                {loadingStory && !displayedText ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-muted-foreground py-8"
                  >
                    <Activity className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-lg italic">
                      AI is unfolding your story...
                    </span>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-primary"
                    >
                      ✨
                    </motion.span>
                  </motion.div>
                ) : (
                  <>
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
                  </>
                )}
              </motion.div>
            </ScrollArea>

            {/* Player Choices - Always visible at bottom */}
            {!isTyping && playerChoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2 mt-4 pt-4 border-t border-border flex-shrink-0"
              >
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  What will you do?
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {playerChoices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      disabled={loadingStory}
                      className={`w-full justify-start text-left h-auto py-1.5 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary transition-all duration-300 group ${
                        loadingStory ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      variant="outline"
                    >
                      <Play className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      <span className="font-elegant text-xs leading-tight">{choice}</span>
                    </Button>
                  ))}
                </div>
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
