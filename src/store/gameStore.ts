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
  coins: number;
  dungeonLevel: number;
  position: { x: number; y: number };
  inventory: Item[];
  abilities: Record<string, Ability>;
  equippedItems: Record<string, string | null>; // slot -> itemId
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
  googleId?: string; // Google user ID (sub from OAuth)
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
    coins?: number;
    gold?: number;
    items?: string[];
    badge?: string;
  };
  completed: boolean;
  expiresAt: string;
  category?: 'combat' | 'exploration' | 'collection' | 'social';
}

export interface DailyReward {
  day: number;
  coins: number;
  items?: string[];
  multiplier?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'combat' | 'exploration' | 'collection' | 'social' | 'story';
  target: number;
  current: number;
  reward: {
    coins?: number;
    items?: string[];
    unlock?: string;
  };
  completed: boolean;
  completedAt?: string;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'double_xp' | 'treasure_hunt' | 'boss_rush' | 'collection' | 'community';
  startDate: string;
  endDate: string;
  rewards: {
    coins?: number;
    items?: string[];
    exclusive?: boolean;
  };
  active: boolean;
}

export interface CollectionSet {
  id: string;
  name: string;
  description: string;
  items: string[];
  collected: number;
  reward: {
    coins?: number;
    statBonus?: Record<string, number>;
    unlock?: string;
  };
  completed: boolean;
}

export interface ProgressionStats {
  totalPlaytime: number;
  storiesCompleted: number;
  enemiesDefeated: number;
  itemsCollected: number;
  locationsDiscovered: number;
  achievementsUnlocked: number;
  coinsEarned: number;
  coinsSpent: number;
  highestLevel: number;
  lastUpdated: string;
}

export interface StoryBranch {
  id: string;
  title: string;
  choices: string[];
  ending?: string;
  completedAt: string;
  playtime: number;
}

export interface UnlockableContent {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'vendor' | 'recipe' | 'ability' | 'cosmetic' | 'mode';
  unlocked: boolean;
  unlockRequirements: {
    level?: number;
    achievement?: string;
    milestone?: string;
    coins?: number;
  };
  preview?: string;
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
  type: 'weapon' | 'armor' | 'potion' | 'key' | 'quest' | 'material' | 'consumable';
  effect?: string;
  quantity: number;
  slot?: 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet';
  statBonuses?: {
    attack?: number;
    defense?: number;
    health?: number;
    strength?: number;
    intelligence?: number;
    agility?: number;
  };
  price?: number; // Coin cost
  levelRequirement?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
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
  currentScreen: 'intro' | 'character' | 'genre' | 'game' | 'settings' | 'shop' | 'crafting' | 'codex' | 'milestones' | 'events' | 'collections' | 'progression' | 'replay' | 'leaderboards' | 'unlocks';
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
  
  // Score System
  playerScore: number;
  abandonedQuests: number;
  updatePlayerScore: (score: number) => void;
  incrementAbandonedQuests: () => void;
  completeQuestWithScore: (questId: string) => void;
  
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
  weeklyChallenge: DailyChallenge | null;
  setWeeklyChallenge: (challenge: DailyChallenge | null) => void;
  
  // Daily Login Rewards
  lastLoginDate: string | null;
  lastRewardClaimTime: string | null; // ISO timestamp of last reward claim
  loginStreak: number;
  dailyRewardsClaimed: number; // Day in current cycle (1-7)
  claimDailyReward: () => void;
  
  // Milestones
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
  updateMilestone: (milestoneId: string, progress: number) => void;
  claimMilestone: (milestoneId: string) => void;
  
  // Events
  currentEvents: GameEvent[];
  setCurrentEvents: (events: GameEvent[]) => void;
  
  // Collections
  collectionSets: CollectionSet[];
  setCollectionSets: (sets: CollectionSet[]) => void;
  updateCollection: (setId: string, itemId: string) => void;
  
  // Progression
  progressionStats: ProgressionStats | null;
  setProgressionStats: (stats: ProgressionStats) => void;
  updateProgressionStats: (updates: Partial<ProgressionStats>) => void;
  
  // Story Replay
  storyBranches: StoryBranch[];
  addStoryBranch: (branch: StoryBranch) => void;
  selectedBranch: StoryBranch | null;
  setSelectedBranch: (branch: StoryBranch | null) => void;
  
  // Unlockable Content
  unlockableContent: UnlockableContent[];
  setUnlockableContent: (content: UnlockableContent[]) => void;
  unlockContent: (contentId: string) => void;
  
  // Seasonal Content
  seasonalEvents: SeasonalEvent[];
  setSeasonalEvents: (events: SeasonalEvent[]) => void;
  
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
  // Coin system
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  // Equipment system
  equipItem: (itemId: string, slot: string) => void;
  unequipItem: (slot: string) => void;
  getEffectiveStats: () => { attack: number; defense: number; health: number; strength: number; intelligence: number; agility: number } | null;
  // Vendor system
  vendorReputation: Record<string, number>;
  setVendorReputation: (vendorId: string, reputation: number) => void;
  // Codex system
  codex: {
    enemies: Record<string, any>;
    locations: Record<string, any>;
    items: Record<string, any>;
    npcs: Record<string, any>;
    lore: Record<string, any>;
  };
  addCodexEntry: (type: 'enemies' | 'locations' | 'items' | 'npcs' | 'lore', id: string, data: any) => void;
  // Crafting system
  learnedRecipes: string[];
  learnRecipe: (recipeId: string) => void;
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
  playerScore: 100,
  abandonedQuests: 0,
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
  vendorReputation: {} as Record<string, number>,
  codex: {
    enemies: {} as Record<string, any>,
    locations: {} as Record<string, any>,
    items: {} as Record<string, any>,
    npcs: {} as Record<string, any>,
    lore: {} as Record<string, any>,
  },
  learnedRecipes: [] as string[],
  weeklyChallenge: null as DailyChallenge | null,
  lastLoginDate: null as string | null,
  lastRewardClaimTime: null as string | null,
  loginStreak: 0,
  dailyRewardsClaimed: 0,
  milestones: [] as Milestone[],
  currentEvents: [] as GameEvent[],
  collectionSets: [] as CollectionSet[],
  progressionStats: null as ProgressionStats | null,
  storyBranches: [] as StoryBranch[],
  selectedBranch: null as StoryBranch | null,
  unlockableContent: [] as UnlockableContent[],
  seasonalEvents: [] as SeasonalEvent[],
  language: 'English' as const,
  textSpeed: 50,
  soundEnabled: true,
  musicEnabled: true,
};

// Load authUser from localStorage on initialization
const loadAuthFromStorage = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem('gilded-scrolls-auth');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load auth from localStorage:', e);
  }
  return null;
};

// Initialize with auth from localStorage if available
const initialAuthUser = loadAuthFromStorage();
if (initialAuthUser) {
  initialState.authUser = initialAuthUser;
}

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
    
    const startingCoins = {
      Warrior: 200,
      Mage: 150,
      Rogue: 250,
    };
    
    set({
      player: {
        ...character,
        level: 1,
        health: 100,
        maxHealth: 100,
        xp: 0,
        maxXp: 100,
        coins: startingCoins[character.class],
        dungeonLevel: 1,
        position: { x: 100, y: 300 },
        inventory: [],
        abilities: {},
        equippedItems: {
          weapon: null,
          armor: null,
          helmet: null,
          boots: null,
          ring: null,
          amulet: null,
        },
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

  setAuthUser: (user) => {
    // Save to localStorage when setting auth user
    if (user) {
      try {
        localStorage.setItem('gilded-scrolls-auth', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to save auth to localStorage:', e);
      }
    }
    set({ authUser: user });
  },

  clearAuthUser: () => {
    // Remove from localStorage when clearing auth
    try {
      localStorage.removeItem('gilded-scrolls-auth');
    } catch (e) {
      console.error('Failed to remove auth from localStorage:', e);
    }
    set({ authUser: null });
  },

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
  
  // Coin system actions
  addCoins: (amount) =>
    set((state) => {
      if (!state.player) return state;
      return {
        player: {
          ...state.player,
          coins: state.player.coins + amount,
        },
      };
    }),
  
  spendCoins: (amount) => {
    const state = useGameStore.getState();
    if (!state.player || state.player.coins < amount) return false;
    useGameStore.setState({
      player: {
        ...state.player,
        coins: state.player.coins - amount,
      },
    });
    return true;
  },
  
  // Equipment system actions
  equipItem: (itemId, slot) =>
    set((state) => {
      if (!state.player) return state;
      const item = state.player.inventory.find((i) => i.id === itemId);
      if (!item || !item.slot || item.slot !== slot) return state;
      
      // Unequip current item in slot if any
      const currentEquipped = state.player.equippedItems[slot];
      let newInventory = [...state.player.inventory];
      if (currentEquipped) {
        const currentItem = newInventory.find((i) => i.id === currentEquipped);
        if (currentItem) {
          newInventory = newInventory.map((i) =>
            i.id === currentEquipped ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
      }
      
      // Remove item from inventory and equip it
      const itemIndex = newInventory.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) return state;
      
      newInventory = newInventory.map((i, idx) =>
        idx === itemIndex ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0);
      
      return {
        player: {
          ...state.player,
          inventory: newInventory,
          equippedItems: {
            ...state.player.equippedItems,
            [slot]: itemId,
          },
        },
      };
    }),
  
  unequipItem: (slot) =>
    set((state) => {
      if (!state.player) return state;
      const equippedItemId = state.player.equippedItems[slot];
      if (!equippedItemId) return state;
      
      const item = state.player.inventory.find((i) => i.id === equippedItemId) || 
        { id: equippedItemId, name: 'Unknown', type: 'weapon' as const, quantity: 0 };
      
      return {
        player: {
          ...state.player,
          inventory: [
            ...state.player.inventory,
            { ...item, quantity: item.quantity + 1 },
          ],
          equippedItems: {
            ...state.player.equippedItems,
            [slot]: null,
          },
        },
      };
    }),
  
  getEffectiveStats: () => {
    const state = useGameStore.getState();
    if (!state.player) return null;
    
    const baseStats = {
      attack: state.player.stats.strength * 2 + state.player.stats.agility,
      defense: state.player.stats.strength + state.player.stats.agility,
      health: state.player.maxHealth,
      strength: state.player.stats.strength,
      intelligence: state.player.stats.intelligence,
      agility: state.player.stats.agility,
    };
    
    // Add equipment bonuses
    Object.values(state.player.equippedItems).forEach((itemId) => {
      if (!itemId) return;
      const item = state.player?.inventory.find((i) => i.id === itemId);
      if (item?.statBonuses) {
        baseStats.attack += item.statBonuses.attack || 0;
        baseStats.defense += item.statBonuses.defense || 0;
        baseStats.health += item.statBonuses.health || 0;
        baseStats.strength += item.statBonuses.strength || 0;
        baseStats.intelligence += item.statBonuses.intelligence || 0;
        baseStats.agility += item.statBonuses.agility || 0;
      }
    });
    
    return baseStats;
  },
  
  // Vendor system actions
  setVendorReputation: (vendorId, reputation) =>
    set((state) => ({
      vendorReputation: {
        ...state.vendorReputation,
        [vendorId]: reputation,
      },
    })),
  
  // Codex system actions
  addCodexEntry: (type, id, data) =>
    set((state) => ({
      codex: {
        ...state.codex,
        [type]: {
          ...state.codex[type],
          [id]: {
            ...data,
            discoveredAt: new Date().toISOString(),
          },
        },
      },
    })),
  
  // Crafting system actions
  learnRecipe: (recipeId) =>
    set((state) => {
      if (state.learnedRecipes.includes(recipeId)) return state;
      return {
        learnedRecipes: [...state.learnedRecipes, recipeId],
      };
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
    set((state) => {
      // Check if quest already exists to prevent duplicates
      const existingQuest = state.activeQuests.find((q) => q.id === quest.id);
      if (existingQuest) {
        return state; // Quest already exists, don't add duplicate
      }
      return {
        activeQuests: [...state.activeQuests, quest],
      };
    }),
  
  completeQuest: (questId) =>
    set((state) => {
      const quest = state.activeQuests.find((q) => q.id === questId);
      if (!quest) return state;
      return {
        activeQuests: state.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...state.completedQuests, { ...quest, completed: true }],
      };
    }),

  // Score System Actions
  updatePlayerScore: (score) =>
    set({ playerScore: Math.max(0, score) }), // Ensure score doesn't go below 0

  incrementAbandonedQuests: () =>
    set((state) => ({
      abandonedQuests: state.abandonedQuests + 1,
      playerScore: Math.max(0, state.playerScore - 10), // Decrease score by 10 per abandoned quest
    })),

  completeQuestWithScore: (questId) =>
    set((state) => {
      const quest = state.activeQuests.find((q) => q.id === questId);
      if (!quest) return state;
      // Increase score by 20 and reset abandoned quests counter
      return {
        activeQuests: state.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...state.completedQuests, { ...quest, completed: true }],
        playerScore: state.playerScore + 20,
        abandonedQuests: 0, // Reset counter on quest completion
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
  
  setWeeklyChallenge: (challenge) =>
    set({ weeklyChallenge: challenge }),
  
  // Daily Login Rewards Actions
  claimDailyReward: () =>
    set((state) => {
      const now = new Date();
      const nowISO = now.toISOString();
      const today = nowISO.split('T')[0];
      
      // Check if reward was already claimed today
      if (state.lastRewardClaimTime) {
        const lastClaimDate = new Date(state.lastRewardClaimTime);
        const lastClaimDateStr = lastClaimDate.toISOString().split('T')[0];
        
        // If already claimed today, don't allow another claim
        if (lastClaimDateStr === today) {
          return state;
        }
      }
      
      const lastLogin = state.lastLoginDate;
      let newStreak = state.loginStreak;
      let newDay = state.dailyRewardsClaimed;
      
      // Check if streak should continue or reset
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          newStreak = state.loginStreak + 1;
          newDay = state.dailyRewardsClaimed + 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak = 1;
          newDay = 1;
        } else if (daysDiff === 0) {
          // Same day - should not happen due to check above, but handle gracefully
          return state;
        }
      } else {
        // First login
        newStreak = 1;
        newDay = 1;
      }
      
      // Calculate multiplier
      let multiplier = 1;
      if (newStreak >= 7) multiplier = 2;
      else if (newStreak >= 4) multiplier = 1.5;
      
      // Reward structure
      const rewards = [
        { coins: 50 },
        { coins: 75, items: ['potion_health'] },
        { coins: 100 },
        { coins: 150, items: ['item_common'] },
        { coins: 200 },
        { coins: 250, items: ['item_uncommon'] },
        { coins: 500, items: ['item_rare', 'item_xp_booster'] },
      ];
      
      const dayReward = rewards[newDay - 1] || rewards[0];
      const finalCoins = Math.floor(dayReward.coins * multiplier);
      
      // Add rewards
      if (state.player) {
        state.addCoins(finalCoins);
        if (dayReward.items) {
          dayReward.items.forEach((itemId) => {
            state.addItem({
              id: itemId,
              name: itemId.replace('_', ' '),
              type: itemId.includes('potion') ? 'potion' : 'quest',
              quantity: 1,
            });
          });
        }
      }
      
      return {
        lastLoginDate: today,
        lastRewardClaimTime: nowISO, // Store exact timestamp
        loginStreak: newStreak,
        dailyRewardsClaimed: newDay >= 7 ? 0 : newDay,
      };
    }),
  
  // Milestones Actions
  setMilestones: (milestones) =>
    set({ milestones }),
  
  updateMilestone: (milestoneId, progress) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, current: Math.min(progress, m.target), completed: progress >= m.target && !m.completed }
          : m
      ),
    })),
  
  claimMilestone: (milestoneId) =>
    set((state) => {
      const milestone = state.milestones.find((m) => m.id === milestoneId);
      if (!milestone || !milestone.completed || milestone.completedAt) return state;
      
      // Add rewards
      if (milestone.reward.coins && state.player) {
        state.addCoins(milestone.reward.coins);
      }
      if (milestone.reward.items) {
        milestone.reward.items.forEach((itemId) => {
          state.addItem({
            id: itemId,
            name: itemId.replace('_', ' '),
            type: 'quest',
            quantity: 1,
          });
        });
      }
      
      return {
        milestones: state.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completedAt: new Date().toISOString() } : m
        ),
      };
    }),
  
  // Events Actions
  setCurrentEvents: (events) =>
    set({ currentEvents: events }),
  
  // Collections Actions
  setCollectionSets: (sets) =>
    set({ collectionSets: sets }),
  
  updateCollection: (setId, itemId) =>
    set((state) => ({
      collectionSets: state.collectionSets.map((set) =>
        set.id === setId && !set.items.includes(itemId)
          ? { ...set, items: [...set.items, itemId], collected: set.collected + 1, completed: set.collected + 1 >= set.items.length }
          : set
      ),
    })),
  
  // Progression Actions
  setProgressionStats: (stats) =>
    set({ progressionStats: stats }),
  
  updateProgressionStats: (updates) =>
    set((state) => ({
      progressionStats: state.progressionStats
        ? { ...state.progressionStats, ...updates, lastUpdated: new Date().toISOString() }
        : null,
    })),
  
  // Story Replay Actions
  addStoryBranch: (branch) =>
    set((state) => ({
      storyBranches: [...state.storyBranches, branch],
    })),
  
  setSelectedBranch: (branch) =>
    set({ selectedBranch: branch }),
  
  // Unlockable Content Actions
  setUnlockableContent: (content) =>
    set({ unlockableContent: content }),
  
  unlockContent: (contentId) =>
    set((state) => ({
      unlockableContent: state.unlockableContent.map((c) =>
        c.id === contentId ? { ...c, unlocked: true } : c
      ),
    })),
  
  // Seasonal Content Actions
  setSeasonalEvents: (events) =>
    set({ seasonalEvents: events }),
  
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
