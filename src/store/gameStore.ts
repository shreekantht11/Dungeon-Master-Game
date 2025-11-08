import { create } from 'zustand';

export interface Player {
  name: string;
  class: 'Warrior' | 'Mage' | 'Rogue';
  gender: 'Male' | 'Female' | 'Other';
  level: number;
  health: number;
  maxHealth: number;
  xp: number;
  maxXp: number;
  dungeonLevel: number;
  position: { x: number; y: number };
  inventory: Item[];
  abilities: Record<string, Ability>;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
  };
  appearance?: {
    hairColor?: string;
    skinColor?: string;
    outfitColor?: string;
    hairStyle?: string;
    accessories?: string[];
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface CameoGuest {
  name: string;
  class: Player['class'];
  gender: Player['gender'];
  level: number;
  health: number;
  maxHealth: number;
  xp: number;
  maxXp: number;
  stats: Player['stats'];
  [key: string]: any;
}

export interface CameoEntry {
  code: string;
  hostPlayerId?: string;
  guest: CameoGuest;
  message?: string;
  joinedAt?: string;
  status?: string;
}

export interface ArcadePuzzleSummary {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  rewardXp: number;
  timeLimit: number;
  theme: string;
  bestTime?: number | null;
  highestScore?: number | null;
  plays?: number;
  wins?: number;
}

export interface ArcadePuzzleDetail {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  question: string;
  options: string[];
  hints?: string[];
  rewardXp: number;
  timeLimit: number;
  theme: string;
}

export interface ArcadePuzzleProgress {
  plays: number;
  wins: number;
  streak?: number;
  bestTime?: number;
  highestScore?: number;
  totalScore?: number;
  lastPlayed?: string;
  lastResult?: {
    correct: boolean;
    score: number;
    timeTaken: number;
    hintsUsed: number;
    playedAt: string;
  };
}

export interface ArcadeLeaderboardEntry {
  playerId: string;
  bestTime?: number;
  highestScore: number;
}

export interface ArcadePuzzleResult {
  puzzleId: string;
  correct: boolean;
  score: number;
  xpAward: number;
  triggeredBadges: string[];
  unlockedBadges: Badge[];
  progress: ArcadePuzzleProgress;
  leaderboard: ArcadeLeaderboardEntry[];
}

export interface AuthUser {
  name: string;
  email?: string;
  picture?: string;
  token?: string;
}

export interface StoryEnding {
  id: string;
  title: string;
  description: string;
  genre: string;
  unlockedAt?: string;
  choicePath: string[];
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChoiceHistory {
  turn: number;
  choice: string;
  consequence: string;
  isMajor: boolean;
  timestamp: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  objectives: Array<{ text: string; completed: boolean }>;
  rewards: {
    xp: number;
    gold?: number;
    items?: string[];
    badge?: string;
  };
  completed: boolean;
  expiresAt: string;
}

export interface Friend {
  playerId: string;
  name: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedBy: string;
  addedAt: string;
  lastSeen?: string;
  stats?: {
    level: number;
    totalXp: number;
    badgesCount: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  score: number;
  level: number;
  badgesCount: number;
  isFriend?: boolean;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'key' | 'quest';
  effect?: string;
  quantity: number;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  position: { x: number; y: number };
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlockedAt: number; // player level required
  cooldown?: number;
  manaCost?: number;
  effect: string;
  class: 'Warrior' | 'Mage' | 'Rogue';
}

export interface LocationStats {
  timesVisited: number;
  enemiesDefeated: number;
  itemsFound: number;
  highestLevel: number;
  completed: boolean;
}

export interface StoryEvent {
  id: string;
  text: string;
  timestamp: Date;
  type: 'story' | 'combat' | 'item' | 'level-up';
}

interface GameState {
  // Game State
  currentScreen: 'intro' | 'character' | 'genre' | 'game' | 'settings';
  gameStarted: boolean;
  genre: 'Fantasy' | 'Sci-Fi' | 'Mystery' | 'Mythical' | null;
  
  // Player
  player: Player | null;
  
  // Story
  storyLog: StoryEvent[];
  currentStory: string;
  playerChoices: string[];
  
  // Combat
  inCombat: boolean;
  currentEnemy: Enemy | null;
  
  // Puzzle
  currentPuzzle: any | null;
  setPuzzle: (puzzle: any) => void;
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  unlockBadges: (badges: Badge[]) => void;
  cameos: CameoEntry[];
  setCameos: (cameos: CameoEntry[]) => void;
  addCameo: (cameo: CameoEntry) => void;
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  clearAuthUser: () => void;
  miniGames: {
    catalog: ArcadePuzzleSummary[];
    progress: Record<string, ArcadePuzzleProgress>;
    loading: boolean;
    activePuzzle: ArcadePuzzleDetail | null;
    lastResult: ArcadePuzzleResult | null;
  };
  setMiniGameLoading: (loading: boolean) => void;
  setMiniGameCatalog: (catalog: ArcadePuzzleSummary[]) => void;
  setMiniGameProgress: (puzzleId: string, progress: ArcadePuzzleProgress) => void;
  startMiniGame: (detail: ArcadePuzzleDetail, progress?: ArcadePuzzleProgress | null) => void;
  completeMiniGame: (result: ArcadePuzzleResult) => void;
  closeMiniGame: () => void;
  
  // Quests
  activeQuests: any[];
  completedQuests: any[];
  addQuest: (quest: any) => void;
  completeQuest: (questId: string) => void;
  
  // Game State Tracking
  gameState: {
    turnCount: number;
    storyPhase: string;
    combatEncounters: number;
    combatEscapes: number; // Track how many times player escaped from combat
    isAfterCombat: boolean;
    isFinalPhase: boolean;
    isInitialized: boolean;
  };
  updateGameState: (updates: Partial<GameState['gameState']>) => void;
  
  // Story Branching & Endings
  choiceHistory: ChoiceHistory[];
  addChoiceToHistory: (choice: ChoiceHistory) => void;
  unlockedEndings: StoryEnding[];
  setUnlockedEndings: (endings: StoryEnding[]) => void;
  unlockEnding: (ending: StoryEnding) => void;
  
  // Daily Challenges
  dailyChallenge: DailyChallenge | null;
  setDailyChallenge: (challenge: DailyChallenge | null) => void;
  challengeStreak: number;
  setChallengeStreak: (streak: number) => void;
  
  // Social Features
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (playerId: string) => void;
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  
  // World
  currentLocation: string;
  discoveredLocations: string[];
  currentDungeonLevel: number;
  locationProgress: Record<string, number>; // Track highest level reached per location
  locationStats: Record<string, LocationStats>; // Track location statistics
  
  // Settings
  language: 'English' | 'Kannada' | 'Telugu';
  textSpeed: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Actions
  setScreen: (screen: GameState['currentScreen']) => void;
  setGenre: (genre: GameState['genre']) => void;
  createCharacter: (character: Omit<Player, 'level' | 'xp' | 'maxXp' | 'position' | 'inventory' | 'stats'>) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  addStoryEvent: (event: Omit<StoryEvent, 'id' | 'timestamp'>) => void;
  updateStory: (story: string) => void;
  setPlayerChoices: (choices: string[]) => void;
  startCombat: (enemy: Enemy) => void;
  endCombat: () => void;
  damageEnemy: (damage: number) => void;
  damagePlayer: (damage: number) => void;
  addItem: (item: Item) => void;
  useItem: (itemId: string) => void;
  unlockAbility: (abilityId: string) => void;
  upgradeAbility: (abilityId: string) => void;
  useAbility: (abilityId: string) => void;
  updateSettings: (settings: Partial<Pick<GameState, 'language' | 'textSpeed' | 'soundEnabled' | 'musicEnabled'>>) => void;
  setDungeonLevel: (level: number) => void;
  incrementDungeonLevel: () => void;
  setLocationProgress: (locationId: string, level: number) => void;
  updateLocationStats: (locationId: string, updates: Partial<LocationStats>) => void;
  resetGame: () => void;
}

const initialState = {
  currentScreen: 'intro' as const,
  gameStarted: false,
  genre: null,
  player: null,
  storyLog: [],
  currentStory: '',
  playerChoices: [],
  inCombat: false,
  currentEnemy: null,
  currentPuzzle: null,
  badges: [] as Badge[],
  cameos: [] as CameoEntry[],
  authUser: null,
  miniGames: {
    catalog: [] as ArcadePuzzleSummary[],
    progress: {} as Record<string, ArcadePuzzleProgress>,
    loading: false,
    activePuzzle: null,
    lastResult: null,
  },
  activeQuests: [],
  completedQuests: [],
  gameState: {
    turnCount: 0,
    storyPhase: 'exploration',
    combatEncounters: 0,
    combatEscapes: 0,
    isAfterCombat: false,
    isFinalPhase: false,
    isInitialized: false,
  },
  choiceHistory: [] as ChoiceHistory[],
  unlockedEndings: [] as StoryEnding[],
  dailyChallenge: null as DailyChallenge | null,
  challengeStreak: 0,
  friends: [] as Friend[],
  leaderboard: [] as LeaderboardEntry[],
  currentLocation: 'village',
  discoveredLocations: ['village'],
  currentDungeonLevel: 1,
  locationProgress: {} as Record<string, number>,
  locationStats: {} as Record<string, LocationStats>,
  language: 'English' as const,
  textSpeed: 50,
  soundEnabled: true,
  musicEnabled: true,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ currentScreen: screen }),
  
  setGenre: (genre) => set({ genre, gameStarted: true }),
  
  createCharacter: (character) => {
    const classStats = {
      Warrior: { strength: 10, intelligence: 5, agility: 7 },
      Mage: { strength: 5, intelligence: 10, agility: 6 },
      Rogue: { strength: 7, intelligence: 6, agility: 10 },
    };
    
    set({
      player: {
        ...character,
        level: 1,
        health: 100,
        maxHealth: 100,
        xp: 0,
        maxXp: 100,
        dungeonLevel: 1,
        position: { x: 100, y: 300 },
        inventory: [],
        abilities: {},
        stats: classStats[character.class],
      },
    });
  },
  
  updatePlayer: (updates) =>
    set((state) => {
      if (!state.player) return state;
      
      const updatedPlayer = { ...state.player, ...updates };
      
      // Check for level up when XP is updated (handle multiple level ups)
      if ('xp' in updates) {
        let finalPlayer = updatedPlayer;
        let levelUps = 0;
        
        // Handle multiple level ups if XP is very high
        while (finalPlayer.xp >= finalPlayer.maxXp) {
          levelUps++;
          const newLevel = finalPlayer.level + 1;
          const newMaxXp = Math.floor(finalPlayer.maxXp * 1.5); // Increase max XP by 50%
          const newMaxHealth = Math.floor(finalPlayer.maxHealth * 1.2); // Increase health by 20%
          const xpOverflow = finalPlayer.xp - finalPlayer.maxXp;
          
          finalPlayer = {
            ...finalPlayer,
            level: newLevel,
            xp: xpOverflow,
            maxXp: newMaxXp,
            maxHealth: newMaxHealth,
            health: newMaxHealth, // Full heal on level up
            stats: {
              ...finalPlayer.stats,
              strength: finalPlayer.stats.strength + 2,
              intelligence: finalPlayer.stats.intelligence + 2,
              agility: finalPlayer.stats.agility + 2,
            }
          };
        }
        
        // Add level up event if any level ups occurred
        if (levelUps > 0) {
          state.addStoryEvent({
            text: `🎉 Level Up! You reached level ${finalPlayer.level}! (+${levelUps} level${levelUps > 1 ? 's' : ''})`,
            type: 'level-up'
          });
          
          return {
            player: finalPlayer,
          };
        }
      }
      
      return {
        player: updatedPlayer,
      };
    }),
  
  addStoryEvent: (event) =>
    set((state) => ({
      storyLog: [
        ...state.storyLog,
        { ...event, id: Date.now().toString(), timestamp: new Date() },
      ],
    })),
  
  updateStory: (story) => set({ currentStory: story }),
  
  setPlayerChoices: (choices) => set({ playerChoices: choices }),
  
  startCombat: (enemy) => set({ inCombat: true, currentEnemy: enemy }),
  
  endCombat: () => set({ inCombat: false, currentEnemy: null }),
  
  setPuzzle: (puzzle) => set({ currentPuzzle: puzzle }),

  setBadges: (badges) => set({ badges }),

  unlockBadges: (badges) =>
    set((state) => {
      const existingIds = new Set(state.badges.map((b) => b.id));
      const newBadges = (badges || []).filter((badge) => badge && !existingIds.has(badge.id));
      if (newBadges.length === 0) return state;
      return {
        badges: [...state.badges, ...newBadges],
      };
    }),

  setCameos: (cameos) => set({ cameos: cameos || [] }),

  addCameo: (cameo) =>
    set((state) => {
      if (!cameo) return state;
      const exists = state.cameos.some((entry) => entry.code === cameo.code);
      if (exists) {
        return {
          cameos: state.cameos.map((entry) =>
            entry.code === cameo.code ? { ...entry, ...cameo } : entry
          ),
        };
      }
      return {
        cameos: [...state.cameos, cameo],
      };
    }),

  setAuthUser: (user) => set({ authUser: user }),

  clearAuthUser: () => set({ authUser: null }),

  setMiniGameLoading: (loading) =>
    set((state) => ({ miniGames: { ...state.miniGames, loading } })),

  setMiniGameCatalog: (catalog) =>
    set((state) => ({ miniGames: { ...state.miniGames, catalog } })),

  setMiniGameProgress: (puzzleId, progress) =>
    set((state) => ({
      miniGames: {
        ...state.miniGames,
        progress: { ...state.miniGames.progress, [puzzleId]: progress },
      },
    })),

  startMiniGame: (detail, progress) =>
    set((state) => ({
      miniGames: {
        ...state.miniGames,
        activePuzzle: detail,
        lastResult: null,
        progress: progress
          ? { ...state.miniGames.progress, [detail.id]: progress }
          : state.miniGames.progress,
      },
    })),

  completeMiniGame: (result) =>
    set((state) => {
      const existingIds = new Set(state.badges.map((b) => b.id));
      const newBadges = (result.unlockedBadges || []).filter((badge) => !existingIds.has(badge.id));
      const updatedCatalog = state.miniGames.catalog.map((entry) =>
        entry.id === result.puzzleId
          ? {
              ...entry,
              wins: result.progress.wins,
              plays: result.progress.plays,
              bestTime: result.progress.bestTime ?? entry.bestTime,
              highestScore: result.progress.highestScore ?? entry.highestScore,
            }
          : entry
      );
      return {
        miniGames: {
          ...state.miniGames,
          activePuzzle: state.miniGames.activePuzzle,
          lastResult: result,
          progress: {
            ...state.miniGames.progress,
            [result.puzzleId]: result.progress,
          },
          catalog: updatedCatalog,
        },
        badges: newBadges.length ? [...state.badges, ...newBadges] : state.badges,
      };
    }),

  closeMiniGame: () =>
    set((state) => ({
      miniGames: {
        ...state.miniGames,
        activePuzzle: null,
      },
    })),
  
  damageEnemy: (damage) =>
    set((state) => {
      if (!state.currentEnemy) return state;
      const newHealth = Math.max(0, state.currentEnemy.health - damage);
      return {
        currentEnemy: { ...state.currentEnemy, health: newHealth },
      };
    }),
  
  damagePlayer: (damage) =>
    set((state) => {
      if (!state.player) return state;
      const newHealth = Math.max(0, state.player.health - damage);
      return {
        player: { ...state.player, health: newHealth },
      };
    }),
  
  addItem: (item) =>
    set((state) => {
      if (!state.player) return state;
      const existingItem = state.player.inventory.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          player: {
            ...state.player,
            inventory: state.player.inventory.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          },
        };
      }
      return {
        player: {
          ...state.player,
          inventory: [...state.player.inventory, item],
        },
      };
    }),
  
  useItem: (itemId) =>
    set((state) => {
      if (!state.player) return state;
      const item = state.player.inventory.find((i) => i.id === itemId);
      if (!item) return state;
      
      // Apply item effect (simplified)
      let updates: Partial<Player> = {};
      if (item.type === 'potion') {
        updates.health = Math.min(state.player.maxHealth, state.player.health + 30);
      }
      
      return {
        player: {
          ...state.player,
          ...updates,
          inventory: state.player.inventory
            .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        },
      };
    }),
  
  unlockAbility: (abilityId) =>
    set((state) => {
      if (!state.player) return state;
      // Ability unlocking is handled by ability definitions utility
      // This is a placeholder - actual logic will be in abilities.ts
      return state;
    }),
  
  upgradeAbility: (abilityId) =>
    set((state) => {
      if (!state.player) return state;
      const ability = state.player.abilities[abilityId];
      if (!ability || ability.level >= ability.maxLevel) return state;
      
      return {
        player: {
          ...state.player,
          abilities: {
            ...state.player.abilities,
            [abilityId]: {
              ...ability,
              level: ability.level + 1,
            },
          },
        },
      };
    }),
  
  useAbility: (abilityId) =>
    set((state) => {
      if (!state.player) return state;
      const ability = state.player.abilities[abilityId];
      if (!ability) return state;
      // Ability usage effects are handled in combat
      return state;
    }),
  
  updateSettings: (settings) => set(settings),
  
  setDungeonLevel: (level) =>
    set((state) => {
      if (!state.player) return state;
      return {
        player: { ...state.player, dungeonLevel: level },
        currentDungeonLevel: level,
      };
    }),
  
  incrementDungeonLevel: () =>
    set((state) => {
      if (!state.player) return state;
      const newLevel = state.player.dungeonLevel + 1;
      return {
        player: { ...state.player, dungeonLevel: newLevel },
        currentDungeonLevel: newLevel,
      };
    }),
  
  setLocationProgress: (locationId, level) =>
    set((state) => {
      const currentProgress = state.locationProgress[locationId] || 0;
      if (level > currentProgress) {
        return {
          locationProgress: { ...state.locationProgress, [locationId]: level },
        };
      }
      return state;
    }),
  
  updateLocationStats: (locationId, updates) =>
    set((state) => {
      const currentStats = state.locationStats[locationId] || {
        timesVisited: 0,
        enemiesDefeated: 0,
        itemsFound: 0,
        highestLevel: 0,
        completed: false,
      };
      return {
        locationStats: {
          ...state.locationStats,
          [locationId]: { ...currentStats, ...updates },
        },
      };
    }),
  
  updateGameState: (updates) =>
    set((state) => ({
      gameState: { ...state.gameState, ...updates },
    })),
  
  addQuest: (quest) =>
    set((state) => ({
      activeQuests: [...state.activeQuests, quest],
    })),
  
  completeQuest: (questId) =>
    set((state) => {
      const quest = state.activeQuests.find((q) => q.id === questId);
      if (!quest) return state;
      return {
        activeQuests: state.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...state.completedQuests, { ...quest, completed: true }],
      };
    }),
  
  // Story Branching & Endings Actions
  addChoiceToHistory: (choice) =>
    set((state) => ({
      choiceHistory: [...state.choiceHistory, choice],
    })),
  
  setUnlockedEndings: (endings) =>
    set({ unlockedEndings: endings }),
  
  unlockEnding: (ending) =>
    set((state) => {
      const exists = state.unlockedEndings.some((e) => e.id === ending.id);
      if (exists) return state;
      return {
        unlockedEndings: [...state.unlockedEndings, { ...ending, unlockedAt: new Date().toISOString() }],
      };
    }),
  
  // Daily Challenge Actions
  setDailyChallenge: (challenge) =>
    set({ dailyChallenge: challenge }),
  
  setChallengeStreak: (streak) =>
    set({ challengeStreak: streak }),
  
  // Social Features Actions
  setFriends: (friends) =>
    set({ friends }),
  
  addFriend: (friend) =>
    set((state) => {
      const exists = state.friends.some((f) => f.playerId === friend.playerId);
      if (exists) return state;
      return { friends: [...state.friends, friend] };
    }),
  
  removeFriend: (playerId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.playerId !== playerId),
    })),
  
  setLeaderboard: (entries) =>
    set({ leaderboard: entries }),
  
  resetGame: () =>
    set(() => ({
      ...initialState,
      storyLog: [],
      playerChoices: [],
      badges: [] as Badge[],
      cameos: [] as CameoEntry[],
      activeQuests: [],
      completedQuests: [],
      currentPuzzle: null,
      choiceHistory: [],
      unlockedEndings: [],
      dailyChallenge: null,
      challengeStreak: 0,
      friends: [],
      leaderboard: [],
      currentDungeonLevel: 1,
      locationProgress: {} as Record<string, number>,
      locationStats: {} as Record<string, LocationStats>,
    })),
}));
