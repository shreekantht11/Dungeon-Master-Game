import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Badge } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import AdventureLogModal from '@/components/AdventureLogModal';
import InventoryModal from '@/components/InventoryModal';
import PuzzlePanel from '@/components/PuzzlePanel';
import QuestTracker from '@/components/QuestTracker';
import QuestDialog from '@/components/QuestDialog';
import GameOverScreen from '@/components/GameOverScreen';
import { resolveCombat } from '@/utils/combat';
import { getWeaponSymbol } from '@/utils/weaponSymbols';
import VisualEffects from '@/components/VisualEffects';
import CombatOverlay from '@/components/CombatOverlay';
import CharacterSheet from '@/components/CharacterSheet';
import WorldMapModal from '@/components/WorldMapModal';
import Statistics from '@/components/Statistics';
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
import DailyRewardsModal from './DailyRewardsModal';
import DailyChallengesPanel from './DailyChallengesPanel';
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
  ShoppingCart,
  Hammer,
  BookOpen,
  Calendar,
  TrendingUp,
} from 'lucide-react';

const MainGameUI = () => {
  const { i18n, t } = useTranslation();
  const {
    player,
    currentStory,
    playerChoices,
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
    addItem,
    addQuest,
    completeQuestWithScore,
    incrementAbandonedQuests,
    playerScore,
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

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAdventureLog, setShowAdventureLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTrophyRoom, setShowTrophyRoom] = useState(false);
  const [showCameoInvite, setShowCameoInvite] = useState(false);
  const [showCameoJoin, setShowCameoJoin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showQuestDialog, setShowQuestDialog] = useState(false);
  const [pendingQuest, setPendingQuest] = useState<any>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showWeaponSelection, setShowWeaponSelection] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<any>(null);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [combatAnimation, setCombatAnimation] = useState<'attacking' | 'victory' | 'defeat' | null>(null);
  const [combatEffectTrigger, setCombatEffectTrigger] = useState(0);
  const [aiStatus, setAiStatus] = useState<'active' | 'offline' | 'idle'>('idle');
  const [activeTab, setActiveTab] = useState('stats');
  const [loadingStory, setLoadingStory] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [quickSaves, setQuickSaves] = useState<any[]>([]);
  const { textSpeed, updateSettings, authUser } = useGameStore();
  const [lastDisplayedStory, setLastDisplayedStory] = useState<string>('');
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false); // Prevent multiple initializations
  const initializationStoryRef = useRef<string | null>(null); // Track the initialized story to prevent duplicates

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

  // Initialize game - generate quest first, show dialog, then start story on "Start" click
  useEffect(() => {
    // Prevent multiple initializations
    if (!player || !genre || gameState.isInitialized || initializationRef.current) {
      return;
    }
    
    // Mark as initializing IMMEDIATELY to prevent re-runs (even in React StrictMode)
    initializationRef.current = true;
    
    const generateQuestAndShowDialog = async () => {
      try {
        setLoadingStory(true);
        setAiStatus('active');
        setBadges([]);
        setCameos([]);
        const request = {
          player,
          genre: genre || 'Fantasy',
          previousEvents: [],
          choice: undefined,
          language: i18n.language || 'en', // Pass current language from i18n
        };
        
        const res = await api.initializeGame(request as any);
        
        // Check if using fallback (API service returns fallback on error)
        if (res.isFallback) {
          setAiStatus('offline');
        } else {
          setAiStatus('active');
        }
        
        // Store quest and show dialog
        if (res.quest) {
          const questWithProgress = {
            ...res.quest,
            progress: res.questProgress !== undefined ? res.questProgress : (res.quest.progress || 0),
          };
          setPendingQuest({ quest: questWithProgress, response: res });
          setShowQuestDialog(true);
        } else {
          // No quest, start story immediately
          startStoryWithResponse(res);
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setAiStatus('offline');
        // Fallback
        updateStory("Your adventure begins...");
        setPlayerChoices(['Explore', 'Investigate', 'Proceed']);
        updateGameState({ isInitialized: true, turnCount: 0 });
      } finally {
        setLoadingStory(false);
      }
    };
    
    generateQuestAndShowDialog();
    
    // Cleanup: Reset refs when player/genre changes to allow re-initialization
    return () => {
      // Only reset if this is a real change (not just StrictMode unmount)
      // We'll check in the effect itself if we should allow re-initialization
      const currentPlayer = useGameStore.getState().player;
      const currentGenre = useGameStore.getState().genre;
      // If player or genre changed, reset to allow new initialization
      if (currentPlayer?.name !== player?.name || currentPlayer?.class !== player?.class || currentGenre !== genre) {
        initializationRef.current = false;
        initializationStoryRef.current = null;
      }
    };
  }, [player?.name, player?.class, genre]); // Use specific player properties to avoid unnecessary re-runs

  // Function to start story after quest dialog is confirmed
  const startStoryWithResponse = (res: any) => {
    // Add quest to store
    if (res.quest && activeQuests.length === 0) {
      const questWithProgress = {
        ...res.quest,
        progress: res.questProgress !== undefined ? res.questProgress : (res.quest.progress || 0),
      };
      addQuest(questWithProgress);
    }
    
    // Add story
    if (res.story) {
      const storyText = typeof res.story === 'string' ? res.story : String(res.story || '');
      if (initializationStoryRef.current !== storyText) {
        initializationStoryRef.current = storyText;
        updateStory(storyText);
        addStoryEvent({ text: storyText, type: 'story' });
      }
    }
    
    // Add badges
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

    // Add choices
    if (res.choices && Array.isArray(res.choices)) {
      const validChoices = res.choices
        .filter((choice: any) => typeof choice === 'string')
        .map((choice: string) => String(choice).trim())
        .filter((choice: string) => choice.length > 0);
      setPlayerChoices(validChoices.length > 0 ? validChoices : ['Continue', 'Explore', 'Investigate']);
    }
    
    // Add items
    if (res.items && Array.isArray(res.items)) {
      res.items.forEach((item: any) => addItem(item));
    }
    
    updateGameState({ isInitialized: true, turnCount: 0 });
  };

  // Handle quest dialog "Start" button
  const handleQuestDialogStart = () => {
    if (pendingQuest) {
      startStoryWithResponse(pendingQuest.response);
      setShowQuestDialog(false);
      setPendingQuest(null);
    }
  };

  // Continue story after combat victory - INSTANT continuation
  const continueStoryAfterCombat = async () => {
    if (!player || !genre) return;
    
    // Clear combat states immediately
    setIsCombatActive(false);
    setShowWeaponSelection(false);
    
    try {
      setLoadingStory(true);
      setDisplayedText(''); // Clear to show loading
      
      const activeQuest = activeQuests.length > 0 ? activeQuests[0] : null;
      const request = {
        player,
        genre: genre || 'Fantasy',
        previousEvents: storyLog || [],
        choice: undefined,
        gameState: {
          turnCount: gameState.turnCount,
          storyPhase: 'exploration',
          combatEncounters: (gameState.combatEncounters || 0) + 1,
          combatEscapes: gameState.combatEscapes || 0,
          isAfterCombat: true,
          isFinalPhase: gameState.isFinalPhase,
          badges,
          cameos,
        },
        activeQuest: activeQuest,
        currentLocation: currentLocation,
      };

      const res = await api.generateStory(request as any);

      if (res.story) {
        updateStory(res.story);
        addStoryEvent({ text: res.story, type: 'story' });
      }

      if (res.choices && Array.isArray(res.choices)) {
        const validChoices = res.choices
          .filter((choice: any) => typeof choice === 'string')
          .map((choice: string) => String(choice).trim())
          .filter((choice: string) => choice.length > 0);
        setPlayerChoices(validChoices.length > 0 ? validChoices : ['Continue', 'Explore', 'Investigate']);
      }

      updateGameState({
        isAfterCombat: false,
        storyPhase: res.storyPhase || 'exploration',
      });
    } catch (error) {
      console.error('Failed to continue story after combat:', error);
    } finally {
      setLoadingStory(false);
    }
  };

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

  // Letter-by-letter animation for story text at 2x speed
  useEffect(() => {
    if (!currentStory) return;
    
    // Skip animation if this is the same story (e.g., coming back from settings)
    if (currentStory === lastDisplayedStory) {
      setDisplayedText(currentStory);
      setIsTyping(false);
      return;
    }
    
    setIsTyping(true);
    setDisplayedText('');
    setLastDisplayedStory(currentStory);
    
    // Letter-by-letter animation at 2x speed (15ms per letter, half of normal 30ms)
    let charIndex = 0;
    const animateText = () => {
      if (charIndex < currentStory.length) {
        setDisplayedText(currentStory.slice(0, charIndex + 1));
        charIndex++;
        animationTimeoutRef.current = setTimeout(animateText, 15); // 2x speed: 15ms per letter
      } else {
        setIsTyping(false);
        animationTimeoutRef.current = null;
      }
    };
    animateText();
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [currentStory, lastDisplayedStory]);

  const handleChoice = async (choice: string) => {
    if (!player) return;
    // Prevent concurrent requests
    if (loadingStory) return;
    
    // Check if this is a weapon selection (combat)
    if (showWeaponSelection && currentEnemy) {
      const selectedWeapon = player.inventory.find(item => item.name === choice || item.id === choice);
      
      // Start attack animation
      setCombatAnimation('attacking');
      setCombatEffectTrigger(prev => prev + 1); // Trigger combat-hit effect
      
      // Brief attack animation, then resolve combat (400ms for snappy feel)
      setTimeout(async () => {
        const combatResult = resolveCombat(player, selectedWeapon || null, currentEnemy);
        
        if (combatResult.won) {
          setCombatAnimation('victory');
          setCombatEffectTrigger(prev => prev + 1); // Trigger victory particles
          toast.success(combatResult.message);
          addStoryEvent({ text: combatResult.message, type: 'story' });
          setShowWeaponSelection(false);
          setCurrentEnemy(null);
          setIsCombatActive(false);
          // Continue story immediately after brief victory animation (300ms)
          setTimeout(async () => {
            setCombatAnimation(null);
            await continueStoryAfterCombat();
          }, 300);
        } else {
          setCombatAnimation('defeat');
          setCombatEffectTrigger(prev => prev + 1); // Trigger defeat particles
          setGameOverMessage(combatResult.message);
          setShowGameOver(true);
          setShowWeaponSelection(false);
          setCurrentEnemy(null);
          setIsCombatActive(false);
          setCombatAnimation(null);
        }
      }, 400);
      return;
    }
    
    // Check if player chose "Attack" - show weapon selection
    if (choice.toLowerCase().includes('attack') && currentEnemy) {
      // Activate combat mode with visual feedback
      setIsCombatActive(true);
      setCombatEffectTrigger(prev => prev + 1); // Trigger screen shake
      
      const weapons = player.inventory.filter(item => item.type === 'weapon');
      if (weapons.length > 0) {
        setShowWeaponSelection(true);
        // Add weapons plus "Fight with fists" option
        setPlayerChoices([...weapons.map(w => w.name), 'Fight with fists']);
        return;
      } else {
        // No weapons, fight with fists immediately
        setCombatAnimation('attacking');
        // Brief attack animation (400ms for snappy feel)
        setTimeout(async () => {
          const combatResult = resolveCombat(player, null, currentEnemy);
        if (combatResult.won) {
          setCombatAnimation('victory');
          setCombatEffectTrigger(prev => prev + 1); // Trigger victory particles
          toast.success(combatResult.message);
          addStoryEvent({ text: combatResult.message, type: 'story' });
          setCurrentEnemy(null);
          setIsCombatActive(false);
          // Continue story immediately after brief victory animation (300ms)
          setTimeout(async () => {
            setCombatAnimation(null);
            await continueStoryAfterCombat();
          }, 300);
          } else {
            setCombatAnimation('defeat');
            setCombatEffectTrigger(prev => prev + 1); // Trigger defeat particles
            setGameOverMessage(combatResult.message);
            setShowGameOver(true);
            setCurrentEnemy(null);
            setIsCombatActive(false);
            setCombatAnimation(null);
            return;
          }
        }, 400);
        return;
      }
    }
    
    // Handle "Fight with fists" choice
    if (choice.toLowerCase().includes('fight with fists') && currentEnemy && showWeaponSelection) {
      setCombatAnimation('attacking');
      setCombatEffectTrigger(prev => prev + 1);
      
      setTimeout(async () => {
        const combatResult = resolveCombat(player, null, currentEnemy);
        if (combatResult.won) {
          setCombatAnimation('victory');
          setCombatEffectTrigger(prev => prev + 1);
          toast.success(combatResult.message);
          addStoryEvent({ text: combatResult.message, type: 'story' });
          setShowWeaponSelection(false);
          setCurrentEnemy(null);
          setIsCombatActive(false);
          // Continue story immediately after brief victory animation (300ms)
          setTimeout(async () => {
            setCombatAnimation(null);
            await continueStoryAfterCombat();
          }, 300);
        } else {
          setCombatAnimation('defeat');
          setCombatEffectTrigger(prev => prev + 1);
          setGameOverMessage(combatResult.message);
          setShowGameOver(true);
          setShowWeaponSelection(false);
          setCurrentEnemy(null);
          setIsCombatActive(false);
          setCombatAnimation(null);
        }
      }, 400);
      return;
    }
    
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
        // Complete quest with score reward if there's an active quest
        if (activeQuests.length > 0) {
          completeQuestWithScore(activeQuests[0].id);
          toast.success('Quest completed! +20 score');
        }
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
        language: i18n.language || 'en', // Pass current language from i18n
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

      // Only add new quest if no active quest exists (prevent duplicate quests)
      if ((res as any).quest && activeQuests.length === 0) {
        addQuest((res as any).quest);
      }

      // Update quest progress based on AI-driven progress (from API response)
      // Always sync quest progress from AI when there's an active quest
      if (activeQuests.length > 0) {
        const currentQuest = activeQuests[0];
        // AI decides quest progress - use it if provided, otherwise keep current progress
        const newProgress = res.questProgress !== undefined ? res.questProgress : (currentQuest.progress || 0);
        const updatedQuest = {
          ...currentQuest,
          progress: newProgress,
        };
        // Update quest in store to keep in sync with story
        const updatedQuests = [...activeQuests];
        updatedQuests[0] = updatedQuest;
        useGameStore.setState({ activeQuests: updatedQuests });
        
        // If quest is 100% complete, complete it with score reward
        if (newProgress >= 100) {
          completeQuestWithScore(currentQuest.id);
          toast.success('Quest completed! +20 score');
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

      // If an enemy is returned, store it for weapon selection
      if ((res as any).enemy && res.shouldStartCombat) {
        setCurrentEnemy((res as any).enemy);
        // Don't start combat panel - wait for player to choose "Attack"
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
        const { getPlayerId, getGoogleId } = await import('@/utils/playerId');
        const { serializeGameState } = await import('@/utils/saveState');
        
        const playerId = getPlayerId();
        if (!playerId) {
          console.warn('Cannot save: no player ID available');
          return;
        }
        
        const serializedState = serializeGameState(latestState);
        
        // Verify critical data is included
        if (!serializedState.player) {
          console.error('Save failed: player data missing');
          return;
        }
        
        const saveResult = await api.saveGame({
          playerId: playerId,
          googleId: getGoogleId() || undefined,
          saveSlot: 1,
          saveName: 'AutoSave',
          gameState: serializedState,
          storyLog: latestState.storyLog,
          badges: latestState.badges,
          cameos: latestState.cameos,
          schemaVersion: 1,
        });
        
        if (saveResult?.success) {
          console.log('Game saved successfully:', {
            playerId,
            coins: serializedState.player?.coins,
            inventoryCount: serializedState.player?.inventory?.length || 0,
            equippedItems: Object.keys(serializedState.player?.equippedItems || {}).length,
          });
        }
      } catch (saveErr) {
        console.error('Autosave failed', saveErr);
        // Don't show toast to avoid spamming user, but log for debugging
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

  const handleExitGame = () => {
    setShowExitDialog(true);
  };

  const confirmExitGame = async () => {
    setShowExitDialog(false);
    
    // Check if player has active quests - if yes, decrease score
    if (activeQuests.length > 0) {
      incrementAbandonedQuests();
      toast.warning('Quest abandoned', {
        description: `Score decreased by 10. Complete quests to maintain your score!`,
      });
      
      // Auto-save with updated score
      try {
        const latestState = useGameStore.getState();
        const { getPlayerId, getGoogleId } = await import('@/utils/playerId');
        const { serializeGameState } = await import('@/utils/saveState');

        const playerId = getPlayerId();
        if (playerId) {
          const serializedState = serializeGameState(latestState);
          if (serializedState.player) {
            await api.saveGame({
              playerId: playerId,
              googleId: getGoogleId() || undefined,
              saveSlot: 1,
              saveName: 'AutoSave',
              gameState: serializedState,
              storyLog: latestState.storyLog,
              badges: latestState.badges,
              cameos: latestState.cameos,
              schemaVersion: 1,
            });
          }
        }
      } catch (saveErr) {
        console.error('Autosave failed on exit', saveErr);
      }
    }
    
    // Return to home page without logging out
    // Use setTimeout to ensure state updates complete before navigation
    setTimeout(() => {
      setScreen('intro');
    }, 100);
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
      {/* Visual Effects */}
      {combatAnimation === 'attacking' && (
        <VisualEffects 
          key={`attack-${combatEffectTrigger}`}
          type="combat-hit" 
          trigger={true}
          position={{ x: 50, y: 50 }}
        />
      )}
      {combatAnimation === 'victory' && (
        <VisualEffects 
          key={`victory-${combatEffectTrigger}`}
          type="victory" 
          trigger={true}
          position={{ x: 50, y: 50 }}
        />
      )}
      {combatAnimation === 'defeat' && (
        <VisualEffects 
          key={`defeat-${combatEffectTrigger}`}
          type="combat-hit" 
          trigger={true}
          position={{ x: 50, y: 50 }}
        />
      )}
      {isCombatActive && !showWeaponSelection && combatEffectTrigger > 0 && (
        <VisualEffects 
          key={`combat-init-${combatEffectTrigger}`}
          type="combat-hit" 
          trigger={true}
          position={{ x: 50, y: 50 }}
        />
      )}

      {/* Combat Overlay */}
      <CombatOverlay
        isActive={isCombatActive}
        enemy={currentEnemy}
        showWeaponSelection={showWeaponSelection}
      />

      {/* Tutorial */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

      {/* Puzzle Panel - Shows like combat popup */}
      <AnimatePresence>
        {currentPuzzle && gameState.storyPhase === 'final-puzzle' && <PuzzlePanel />}
      </AnimatePresence>

      {/* Modals */}
      <QuestDialog
        open={showQuestDialog}
        quest={pendingQuest?.quest || null}
        genre={genre || 'Fantasy'}
        onStart={handleQuestDialogStart}
      />
      <GameOverScreen
        open={showGameOver}
        deathMessage={gameOverMessage}
        onReturnToMenu={() => {
          setShowGameOver(false);
          resetGame();
          setScreen('intro');
        }}
      />
      <DailyRewardsModal />
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
          <div className="container mx-auto flex flex-wrap items-center gap-3 justify-between">
            {/* Left Section: Player Info + HP/XP Stacked */}
            <div className="flex items-center gap-3 flex-shrink-0">
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

              {/* HP, XP, and Coins - Stacked Vertically */}
              <div className="flex flex-col gap-1.5 w-40">
                {/* Health Bar */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Heart className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {player.health}/{player.maxHealth}
                    </span>
                  </div>
                  <Progress value={healthPercentage} className="h-2 bg-muted" />
                </div>

                {/* XP Bar */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      XP: {player.xp}/{player.maxXp}
                    </span>
                  </div>
                  <Progress value={xpPercentage} className="h-2 bg-muted" />
                </div>

                {/* Coins Display */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/30">
                    <span className="text-yellow-500 font-bold text-sm">🪙</span>
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
                      {player.coins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section: AI Status + Quest Progress */}
            <div className="flex flex-1 flex-wrap items-center justify-center gap-3 min-w-0">
              {/* Quest Progress Bar */}
              {activeQuests.length > 0 && (
                <div className="min-w-48 max-w-72 flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Target className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {activeQuests[0].title || 'Quest'}
                    </span>
                    {activeQuests[0].progress !== undefined && (
                      <span className="text-xs text-muted-foreground ml-auto flex-shrink-0 whitespace-nowrap">
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

            {/* Right Section: Quick Saves, Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0 flex-wrap justify-end">
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
                            const { deserializeGameState } = await import('@/utils/saveState');
                            const restoredState = deserializeGameState(loaded);
                            
                            // Restore all game state
                            useGameStore.setState(restoredState);
                            
                            // Ensure game is initialized
                            updateGameState({ isInitialized: true });
                            
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
                onClick={() => setScreen('shop')}
                title="Vendor Shop"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setScreen('crafting')}
                title="Crafting"
              >
                <Hammer className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setScreen('codex')}
                title="Codex"
              >
                <BookOpen className="w-5 h-5" />
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
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-16">
                    {gameState.turnCount === 0 ? (
                      // Initial load - before first story
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm font-elegant">AI is unfolding your story...</p>
                      </>
                    ) : (
                      // After first turn - show typing indicator
                      <div className="flex items-center gap-2">
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-2xl text-primary"
                        >
                          ▊
                        </motion.span>
                        <p className="text-sm font-elegant">AI is crafting your story...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-primary ml-1"
                      >
                        ▊
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </ScrollArea>

            {/* Player Choices - Always visible at bottom */}
            {!isTyping && playerChoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`space-y-2 mt-4 pt-4 border-t flex-shrink-0 transition-all duration-300 ${
                  showWeaponSelection 
                    ? 'border-destructive/50 bg-destructive/5 rounded-lg p-4' 
                    : 'border-border'
                }`}
              >
                <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                  showWeaponSelection ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {showWeaponSelection && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-destructive"
                    >
                      ⚔️
                    </motion.span>
                  )}
                  {showWeaponSelection ? 'Choose your weapon:' : 'What will you do?'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {playerChoices.map((choice, index) => {
                    // Check if this is a weapon choice
                    const weapon = showWeaponSelection ? player?.inventory.find(item => item.name === choice || item.id === choice) : null;
                    const weaponSymbol = weapon ? getWeaponSymbol(weapon.name, weapon.type) : null;
                    const isFists = choice.toLowerCase().includes('fight with fists');
                    
                    return (
                      <motion.div
                        key={index}
                        animate={showWeaponSelection ? {
                          borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.3)'],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Button
                          onClick={() => handleChoice(choice)}
                          disabled={loadingStory || combatAnimation !== null}
                          className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-300 group ${
                            showWeaponSelection
                              ? 'bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/50 hover:border-destructive'
                              : 'bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary'
                          } ${
                            loadingStory || combatAnimation !== null ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          variant="outline"
                        >
                          {showWeaponSelection && weaponSymbol ? (
                            <motion.span 
                              className="text-2xl mr-3"
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            >
                              {weaponSymbol}
                            </motion.span>
                          ) : showWeaponSelection && isFists ? (
                            <motion.span 
                              className="text-2xl mr-3"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              👊
                            </motion.span>
                          ) : (
                            <Play className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          )}
                          <span className="font-elegant text-base leading-relaxed">{choice}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            
            {/* Combat Animation Display */}
            {combatAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${
                  combatAnimation === 'victory' ? 'bg-green-500/20' :
                  combatAnimation === 'defeat' ? 'bg-red-500/20' :
                  'bg-yellow-500/20'
                }`}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className={`text-4xl font-bold ${
                    combatAnimation === 'victory' ? 'text-green-500' :
                    combatAnimation === 'defeat' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}
                >
                  {combatAnimation === 'victory' && '⚔️ VICTORY! ⚔️'}
                  {combatAnimation === 'defeat' && '💀 DEFEATED 💀'}
                  {combatAnimation === 'attacking' && '⚔️ ATTACKING! ⚔️'}
                </motion.div>
              </motion.div>
            )}
          </Card>

          {/* Stats & Actions Panel (Right) */}
          <div className="w-80 space-y-4">
            {/* Tabs for different views */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="stats" className="text-xs">
                    <User className="w-4 h-4 mr-1" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="quests" className="text-xs">
                    <Target className="w-4 h-4 mr-1" />
                    Quests
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="text-xs">
                    <Target className="w-4 h-4 mr-1" />
                    Challenges
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
                        {typeof player.stats?.strength === 'number' ? player.stats.strength : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Intelligence</span>
                      <span className="font-semibold text-primary">
                        {typeof player.stats?.intelligence === 'number' ? player.stats.intelligence : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Agility</span>
                      <span className="font-semibold text-primary">
                        {typeof player.stats?.agility === 'number' ? player.stats.agility : 0}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span 
                          className={`font-semibold ${
                            playerScore > 80 
                              ? 'text-green-500' 
                              : playerScore >= 50 
                              ? 'text-yellow-500' 
                              : 'text-red-500'
                          }`}
                        >
                          {playerScore}
                        </span>
                      </div>
                      {activeQuests.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete quests to increase score!
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quests" className="mt-4">
                  <div className="max-h-64 overflow-y-auto">
                    <QuestTracker />
                  </div>
                </TabsContent>

                <TabsContent value="challenges" className="mt-4">
                  <div className="max-h-64 overflow-y-auto">
                    <DailyChallengesPanel />
                  </div>
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
                  {player.inventory.slice(0, 3).map((item) => {
                    const weaponSymbol = getWeaponSymbol(item.name, item.type);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <span className="text-sm flex items-center gap-2">
                          {weaponSymbol && <span className="text-lg">{weaponSymbol}</span>}
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </span>
                      </div>
                    );
                  })}
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
