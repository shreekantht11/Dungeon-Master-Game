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
    combatEscapes?: number;
    isAfterCombat?: boolean;
    isFinalPhase?: boolean;
    badges?: BadgePayload[];
    cameos?: CameoPayload[];
  };
  multiplayer?: {
    otherPlayer?: any;
    shouldMergeStories?: boolean;
    bothSurvivedFirstFight?: boolean;
  };
  activeQuest?: any;
  badgeEvents?: string[];
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
  puzzle?: {
    description: string;
    question: string;
    correctAnswer: string;
    options?: string[]; // Array of 5 options, one is correct
    hints?: string[];
  };
  questProgress?: number; // Quest completion percentage (0-100)
  isFallback?: boolean;
  badges?: BadgePayload[];
  unlockedBadges?: BadgePayload[];
  cameos?: CameoPayload[];
}

interface InitializeResponse {
  story: string;
  quest: any;
  items: Item[];
  choices?: string[];
  greeting?: string;
  isFallback?: boolean;
}

interface CombatRequest {
  player: Player;
  enemy: Enemy;
  action: 'attack' | 'defend' | 'use-item' | 'run';
  itemId?: string;
  badgeEvents?: string[];
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
  badges?: BadgePayload[];
  unlockedBadges?: BadgePayload[];
  cameos?: CameoPayload[];
}

interface BadgePayload {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface CameoPayload {
  code: string;
  hostPlayerId?: string;
  guest: any;
  message?: string;
  joinedAt?: string;
  status?: string;
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
      const data = await response.json();
      return { ...data, isFallback: false };
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
        choices: ["Explore the left corridor", "Investigate the center passage", "Take the right pathway"],
        isFallback: true
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
      const data = await response.json();
      return { ...data, isFallback: false };
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
          isFallback: true,
        };
      }

      if (choiceText.toLowerCase().includes('center') || pick === 1) {
        return {
          story: `You chose to ${choiceText.toLowerCase() || 'investigate the center'}. The air smells of old incense. A small chest sits half-buried beneath rubble; inside you find a glittering potion and a weathered note.`,
          choices: ['Drink the potion', 'Read the note', 'Leave it be'],
          items: [{ id: 'potion_minor', name: 'Minor Health Potion', type: 'potion', effect: 'Restores 30 HP', quantity: 1 }],
          isFallback: true,
        };
      }

      // Default/Right path or rest
      return {
        story: `You chose to ${choiceText.toLowerCase() || 'take the right path'}. The corridor opens into a quiet chamber with murals telling an ancient tale. You feel the weight of destiny — could this be a turning point?`,
        choices: ['Study the murals', 'Set up camp and rest', 'Search for secret doors'],
        isFallback: true,
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
        `${API_BASE_URL}/api/load/${saveId}`,
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

  // Load latest save by player name
  async loadGameByName(name: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/load/by-name?name=${encodeURIComponent(name)}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (error) {
      console.error('Load by name failed:', error);
      throw error;
    }
  },

  // Rename a save by id
  async renameSave(saveId: string, saveName: string): Promise<{ success: boolean }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/saves/${saveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saveName }),
      });
      return await response.json();
    } catch (error) {
      console.error('Rename save failed:', error);
      throw error;
    }
  },

  // Delete a save by id (soft delete)
  async deleteSave(saveId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/saves/${saveId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Delete save failed:', error);
      throw error;
    }
  },

  async createCameoInvite(payload: {
    playerId: string;
    cameoPlayer: Player;
    personalMessage?: string;
    expiresInMinutes?: number;
  }): Promise<{ code: string; expiresAt: string; guest: Player; message?: string }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/cameo/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Create cameo invite failed:', error);
      throw error;
    }
  },

  async acceptCameoInvite(payload: {
    playerId: string;
    inviteCode: string;
  }): Promise<{ cameo: CameoPayload }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/cameo/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Accept cameo invite failed:', error);
      throw error;
    }
  },
};
