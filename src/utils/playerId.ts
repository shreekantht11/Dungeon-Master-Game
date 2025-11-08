import { useGameStore } from '@/store/gameStore';

/**
 * Get consistent player identifier for save/load operations
 * Priority: Google ID > Player Name > Auth User Name
 */
export const getPlayerId = (): string | null => {
  const state = useGameStore.getState();
  
  // For Google-authenticated users, use Google ID
  if (state.authUser?.googleId) {
    return state.authUser.googleId;
  }
  
  // If player exists, use player name
  if (state.player?.name) {
    return state.player.name;
  }
  
  // Fallback to auth user name
  if (state.authUser?.name) {
    return state.authUser.name;
  }
  
  return null;
};

/**
 * Get Google ID if user is authenticated with Google
 */
export const getGoogleId = (): string | null => {
  const state = useGameStore.getState();
  return state.authUser?.googleId || null;
};

