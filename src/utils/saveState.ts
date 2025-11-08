import { GameState } from '@/store/gameStore';

/**
 * Serialize complete game state for saving to MongoDB
 */
export const serializeGameState = (state: GameState): any => {
  return {
    // Core game state
    player: state.player,
    genre: state.genre,
    currentStory: state.currentStory,
    playerChoices: state.playerChoices,
    storyLog: state.storyLog,
    inCombat: state.inCombat,
    currentEnemy: state.currentEnemy,
    currentPuzzle: state.currentPuzzle,
    
    // Game state object
    gameState: {
      turnCount: state.gameState.turnCount,
      storyPhase: state.gameState.storyPhase,
      combatEncounters: state.gameState.combatEncounters,
      combatEscapes: state.gameState.combatEscapes,
      isAfterCombat: state.gameState.isAfterCombat,
      isFinalPhase: state.gameState.isFinalPhase,
      isInitialized: state.gameState.isInitialized,
    },
    
    // Quests
    activeQuests: state.activeQuests,
    completedQuests: state.completedQuests,
    
    // Score System
    playerScore: state.playerScore,
    abandonedQuests: state.abandonedQuests,
    
    // Location and dungeon
    currentLocation: state.currentLocation,
    discoveredLocations: state.discoveredLocations,
    currentDungeonLevel: state.currentDungeonLevel,
    locationProgress: state.locationProgress,
    locationStats: state.locationStats,
    
    // Badges and cameos
    badges: state.badges,
    cameos: state.cameos,
    
    // Economy and items
    vendorReputation: state.vendorReputation,
    learnedRecipes: state.learnedRecipes,
    
    // Codex
    codex: state.codex,
    
    // Engagement features
    lastLoginDate: state.lastLoginDate,
    lastRewardClaimTime: state.lastRewardClaimTime,
    loginStreak: state.loginStreak,
    dailyRewardsClaimed: state.dailyRewardsClaimed,
    milestones: state.milestones,
    currentEvents: state.currentEvents,
    collectionSets: state.collectionSets,
    progressionStats: state.progressionStats,
    storyBranches: state.storyBranches,
    selectedBranch: state.selectedBranch,
    unlockableContent: state.unlockableContent,
    seasonalEvents: state.seasonalEvents,
    
    // Story and choices
    choiceHistory: state.choiceHistory,
    unlockedEndings: state.unlockedEndings,
    
    // Challenges
    dailyChallenge: state.dailyChallenge,
    weeklyChallenge: state.weeklyChallenge,
    challengeStreak: state.challengeStreak,
    
    // Social
    friends: state.friends,
    leaderboard: state.leaderboard,
  };
};

/**
 * Deserialize game state from MongoDB save
 */
export const deserializeGameState = (savedState: any): Partial<GameState> => {
  const restored: Partial<GameState> = {};
  
  // Restore core fields
  if (savedState.player) {
    // Ensure player object has proper structure
    const player = savedState.player;
    
    // Ensure stats is an object with numbers, not items
    if (player.stats && typeof player.stats === 'object') {
      const stats = player.stats;
      // Check if stats contains item-like objects (has id, name, type, effect, quantity)
      if (stats.id || stats.name || stats.type || stats.effect || stats.quantity) {
        // Stats was corrupted, reset to defaults
        player.stats = {
          strength: typeof stats.strength === 'number' ? stats.strength : 10,
          intelligence: typeof stats.intelligence === 'number' ? stats.intelligence : 10,
          agility: typeof stats.agility === 'number' ? stats.agility : 10,
        };
      } else {
        // Ensure stats has proper structure
        player.stats = {
          strength: typeof stats.strength === 'number' ? stats.strength : 10,
          intelligence: typeof stats.intelligence === 'number' ? stats.intelligence : 10,
          agility: typeof stats.agility === 'number' ? stats.agility : 10,
        };
      }
    } else if (!player.stats) {
      // Stats missing, add defaults
      player.stats = {
        strength: 10,
        intelligence: 10,
        agility: 10,
      };
    }
    
    // Ensure coins is a number
    if (typeof player.coins !== 'number') {
      player.coins = 0;
    }
    
    // Ensure inventory is an array
    if (!Array.isArray(player.inventory)) {
      player.inventory = [];
    }
    
    // Ensure equippedItems is an object
    if (!player.equippedItems || typeof player.equippedItems !== 'object') {
      player.equippedItems = {
        weapon: null,
        armor: null,
        helmet: null,
        boots: null,
        ring: null,
        amulet: null,
      };
    }
    
    // Ensure abilities is an object
    if (!player.abilities || typeof player.abilities !== 'object') {
      player.abilities = {};
    }
    
    // Ensure level, health, xp are numbers
    if (typeof player.level !== 'number') player.level = 1;
    if (typeof player.health !== 'number') player.health = player.maxHealth || 100;
    if (typeof player.maxHealth !== 'number') player.maxHealth = 100;
    if (typeof player.xp !== 'number') player.xp = 0;
    if (typeof player.maxXp !== 'number') player.maxXp = 100;
    if (typeof player.dungeonLevel !== 'number') player.dungeonLevel = 1;
    
    // Ensure position is an object
    if (!player.position || typeof player.position !== 'object') {
      player.position = { x: 0, y: 0 };
    }
    
    restored.player = player;
  }
  if (savedState.genre) restored.genre = savedState.genre;
  if (savedState.currentStory !== undefined) restored.currentStory = savedState.currentStory;
  if (savedState.playerChoices) restored.playerChoices = savedState.playerChoices;
  if (savedState.storyLog) restored.storyLog = savedState.storyLog;
  if (savedState.inCombat !== undefined) restored.inCombat = savedState.inCombat;
  if (savedState.currentEnemy) restored.currentEnemy = savedState.currentEnemy;
  if (savedState.currentPuzzle) restored.currentPuzzle = savedState.currentPuzzle;
  
  // Restore game state object
  if (savedState.gameState) {
    restored.gameState = {
      ...restored.gameState,
      ...savedState.gameState,
    };
  }
  
  // Restore quests
  if (savedState.activeQuests) restored.activeQuests = savedState.activeQuests;
  if (savedState.completedQuests) restored.completedQuests = savedState.completedQuests;
  
  // Restore score system
  if (typeof savedState.playerScore === 'number') {
    restored.playerScore = savedState.playerScore;
  } else {
    restored.playerScore = 100; // Default score
  }
  if (typeof savedState.abandonedQuests === 'number') {
    restored.abandonedQuests = savedState.abandonedQuests;
  } else {
    restored.abandonedQuests = 0; // Default abandoned quests
  }
  
  // Restore location data
  if (savedState.currentLocation) restored.currentLocation = savedState.currentLocation;
  if (savedState.discoveredLocations) restored.discoveredLocations = savedState.discoveredLocations;
  if (savedState.currentDungeonLevel !== undefined) restored.currentDungeonLevel = savedState.currentDungeonLevel;
  if (savedState.locationProgress) restored.locationProgress = savedState.locationProgress;
  if (savedState.locationStats) restored.locationStats = savedState.locationStats;
  
  // Restore badges and cameos
  if (savedState.badges) restored.badges = savedState.badges;
  if (savedState.cameos) restored.cameos = savedState.cameos;
  
  // Restore economy
  if (savedState.vendorReputation) restored.vendorReputation = savedState.vendorReputation;
  if (savedState.learnedRecipes) {
    // Ensure learnedRecipes is an array
    restored.learnedRecipes = Array.isArray(savedState.learnedRecipes) 
      ? savedState.learnedRecipes 
      : [];
  }
  
  // Restore codex
  if (savedState.codex) {
    // Ensure codex has proper structure
    restored.codex = {
      enemies: savedState.codex.enemies || {},
      locations: savedState.codex.locations || {},
      items: savedState.codex.items || {},
      npcs: savedState.codex.npcs || {},
      lore: savedState.codex.lore || {},
    };
  }
  
  // Restore engagement features
  if (savedState.lastLoginDate) restored.lastLoginDate = savedState.lastLoginDate;
  if (savedState.lastRewardClaimTime) restored.lastRewardClaimTime = savedState.lastRewardClaimTime;
  if (savedState.loginStreak !== undefined) restored.loginStreak = savedState.loginStreak;
  if (savedState.dailyRewardsClaimed !== undefined) restored.dailyRewardsClaimed = savedState.dailyRewardsClaimed;
  if (savedState.milestones) restored.milestones = savedState.milestones;
  if (savedState.currentEvents) restored.currentEvents = savedState.currentEvents;
  if (savedState.collectionSets) restored.collectionSets = savedState.collectionSets;
  if (savedState.progressionStats) restored.progressionStats = savedState.progressionStats;
  if (savedState.storyBranches) restored.storyBranches = savedState.storyBranches;
  if (savedState.selectedBranch) restored.selectedBranch = savedState.selectedBranch;
  if (savedState.unlockableContent) restored.unlockableContent = savedState.unlockableContent;
  if (savedState.seasonalEvents) restored.seasonalEvents = savedState.seasonalEvents;
  
  // Restore story data
  if (savedState.choiceHistory) restored.choiceHistory = savedState.choiceHistory;
  if (savedState.unlockedEndings) restored.unlockedEndings = savedState.unlockedEndings;
  
  // Restore challenges
  if (savedState.dailyChallenge) restored.dailyChallenge = savedState.dailyChallenge;
  if (savedState.weeklyChallenge) restored.weeklyChallenge = savedState.weeklyChallenge;
  if (savedState.challengeStreak !== undefined) restored.challengeStreak = savedState.challengeStreak;
  
  // Restore social
  if (savedState.friends) restored.friends = savedState.friends;
  if (savedState.leaderboard) restored.leaderboard = savedState.leaderboard;
  
  return restored;
};

