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
  position: { x: number; y: number };
  inventory: Item[];
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
  };
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
  
  // World
  currentLocation: string;
  discoveredLocations: string[];
  
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
  updateSettings: (settings: Partial<Pick<GameState, 'language' | 'textSpeed' | 'soundEnabled' | 'musicEnabled'>>) => void;
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
  currentLocation: 'village',
  discoveredLocations: ['village'],
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
        position: { x: 100, y: 300 },
        inventory: [],
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
  
  updateSettings: (settings) => set(settings),
  
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
  
  resetGame: () => set(initialState),
}));
