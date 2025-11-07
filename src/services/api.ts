import { Player, Enemy, StoryEvent, Item } from '@/store/gameStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface StoryRequest {
  player: Player;
  genre: string;
  previousEvents: StoryEvent[];
  choice?: string;
  gameState?: {
    turnCount?: number;
    storyPhase?: string;
    combatEncounters?: number;
    isAfterCombat?: boolean;
    isFinalPhase?: boolean;
  };
  multiplayer?: {
    otherPlayer?: any;
    shouldMergeStories?: boolean;
    bothSurvivedFirstFight?: boolean;
  };
}

interface StoryResponse {
  story: string;
  choices: string[];
  events?: Partial<StoryEvent>[];
  enemy?: Enemy;
  items?: Item[];
  quest?: any;
  storyPhase?: string;
  shouldStartCombat?: boolean;
  isFinalPhase?: boolean;
  dangerDescription?: string;
  bossDescription?: string;
}

interface InitializeResponse {
  story: string;
  quest: any;
  items: Item[];
  choices?: string[];
  greeting?: string;
}

interface CombatRequest {
  player: Player;
  enemy: Enemy;
  action: 'attack' | 'defend' | 'use-item' | 'run';
  itemId?: string;
}

interface CombatResponse {
  playerDamage: number;
  enemyDamage: number;
  playerHealth: number;
  enemyHealth: number;
  combatLog: string[];
  victory?: boolean;
  defeat?: boolean;
  rewards?: {
    xp: number;
    items: Item[];
    gold: number;
  };
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new APIError(response.status, `HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

export const api = {
  // Initialize Game (get initial loot and quest)
  async initializeGame(request: StoryRequest): Promise<InitializeResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Game initialization failed:', error);
      // Fallback
      return {
        greeting: "Welcome, adventurer!",
        story: "You stand at the entrance of an ancient dungeon. The air is thick with mystery, and the flickering torchlight casts dancing shadows on the stone walls.",
        quest: {
          id: "quest_start_1",
          title: "The Beginning",
          description: "Embark on your adventure and discover what lies ahead.",
          type: "main",
          objectives: [{ text: "Explore the world", completed: false }],
          rewards: { xp: 100, gold: 50, items: [] }
        },
        items: [
          { id: 'item_sword_1', name: 'Rusty Sword', type: 'weapon', effect: '+2 Attack', quantity: 1 },
          { id: 'item_potion_1', name: 'Health Potion', type: 'potion', effect: 'Restores 30 HP', quantity: 2 }
        ],
        choices: ["Explore the left corridor", "Investigate the center passage", "Take the right pathway"]
      };
    }
  },

  // Story Generation
  async generateStory(request: StoryRequest): Promise<StoryResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Story generation failed:', error);
      // Return dynamic mock data for offline mode based on the request to make local testing richer
      const choiceText = request?.choice || '';
      const previous = request?.previousEvents?.map((e) => e.text).join(' ') || '';
      const seed = Math.abs(
        (choiceText + previous + Date.now().toString()).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      );
      const pick = seed % 3;

      if (choiceText.toLowerCase().includes('left') || pick === 0) {
        return {
          story: `You chose to ${choiceText.toLowerCase() || 'explore left'}. The corridor narrows and the torches dim—something moves in the gloom. Suddenly, a snarling goblinoid lunges from the shadows! Combat is joined.`,
            choices: ['Attack the creature', 'Try to talk to it', 'Attempt to flee'],
            enemy: { id: 'goblin_1', name: 'Goblin Scout', health: 28, maxHealth: 28, attack: 7, defense: 3, position: { x: 0, y: 0 } },
          items: [],
        };
      }

      if (choiceText.toLowerCase().includes('center') || pick === 1) {
        return {
          story: `You chose to ${choiceText.toLowerCase() || 'investigate the center'}. The air smells of old incense. A small chest sits half-buried beneath rubble; inside you find a glittering potion and a weathered note.`,
          choices: ['Drink the potion', 'Read the note', 'Leave it be'],
          items: [{ id: 'potion_minor', name: 'Minor Health Potion', type: 'potion', effect: 'Restores 30 HP', quantity: 1 }],
        };
      }

      // Default/Right path or rest
      return {
        story: `You chose to ${choiceText.toLowerCase() || 'take the right path'}. The corridor opens into a quiet chamber with murals telling an ancient tale. You feel the weight of destiny — could this be a turning point?`,
        choices: ['Study the murals', 'Set up camp and rest', 'Search for secret doors'],
      };
    }
  },

  // Combat System
  async processCombat(request: CombatRequest): Promise<CombatResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/combat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Combat processing failed:', error);
      // Return mock combat result
      const playerDamage = Math.floor(Math.random() * 20) + 10;
      const enemyDamage = Math.floor(Math.random() * 15) + 5;
      return {
        playerDamage: enemyDamage,
        enemyDamage: playerDamage,
        playerHealth: request.player.health - enemyDamage,
        enemyHealth: request.enemy.health - playerDamage,
        combatLog: [
          `You dealt ${playerDamage} damage!`,
          `Enemy dealt ${enemyDamage} damage!`,
        ],
      };
    }
  },

  // Save Game
  async saveGame(saveData: any): Promise<{ success: boolean; saveId: string }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });
      return await response.json();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  },

  // Load Game
  async loadGame(saveId: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/save/${saveId}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    }
  },

  // Get Player Saves
  async getSaves(playerId: string): Promise<any[]> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/saves/${playerId}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch saves:', error);
      return [];
    }
  },
};
