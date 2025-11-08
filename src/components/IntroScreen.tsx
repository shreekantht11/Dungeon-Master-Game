import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import { Sword, Play, Settings, BookOpen, Moon, Sun, User, Award, Sparkles, LogOut } from 'lucide-react';
import { api } from '@/services/api';
import { useGoogleLogin } from '@react-oauth/google';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import MiniGameHub from '@/components/MiniGameHub';
import { useTheme } from 'next-themes';
import LoadGameDialog from '@/components/LoadGameDialog';
import NewGameDialog from '@/components/NewGameDialog';
import { getPlayerId } from '@/utils/playerId';

const IntroScreen = () => {
  const player = useGameStore((state) => state.player);
  const setScreen = useGameStore((state) => state.setScreen);
  const updateStory = useGameStore((s) => s.updateStory);
  const setPlayerChoices = useGameStore((s) => s.setPlayerChoices);
  const updateGameState = useGameStore((s) => s.updateGameState);
  const setPuzzle = useGameStore((s) => s.setPuzzle);
  const setGenre = useGameStore((s) => s.setGenre);
  const setBadges = useGameStore((s) => s.setBadges);
  const setCameos = useGameStore((s) => s.setCameos);
  const authUser = useGameStore((s) => s.authUser);
  const setAuthUser = useGameStore((s) => s.setAuthUser);
  const clearAuthUser = useGameStore((s) => s.clearAuthUser);
  const resetGame = useGameStore((s) => s.resetGame);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const { theme, setTheme } = useTheme();
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [savePreview, setSavePreview] = useState<any>(null);
  const [pendingName, setPendingName] = useState<string>('');

  const handleOpenSettings = () => setScreen('settings');

  const initials = useMemo(() => {
    if (!authUser?.name) return 'GG';
    return authUser.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [authUser]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = await res.json();
        if (!profile?.name) {
          throw new Error('Unable to read Google profile');
        }
        // Extract Google ID (sub) from profile
        const googleId = profile.sub || profile.id;
        setAuthUser({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          token: tokenResponse.access_token,
          googleId: googleId,
        });
        setName(profile.name);
        toast.success(`Signed in as ${profile.name}`);
      } catch (error: any) {
        console.error('Google sign-in failed', error);
        toast.error('Google sign-in failed', {
          description: error?.message || 'Unable to complete Google sign-in.',
        });
      }
    },
    onError: () => {
      toast.error('Google sign-in failed');
    },
    scope: 'profile email',
  });

  useEffect(() => {
    if (authUser?.name && !name) {
      setName(authUser.name);
    }
  }, [authUser?.name]);

  // Auto-load disabled - players now choose between Load Saved Game and New Game
  // This gives players control over whether to continue or start fresh


  const handleSignOut = () => {
    clearAuthUser();
    setName('');
    toast('Signed out', { description: 'Come back soon, adventurer!' });
  };


  const handleLoadGame = async () => {
    if (!pendingName.trim()) return;
    setLoading(true);
    try {
      const loaded = await api.loadGameByName(pendingName.trim());
      // Use deserializeGameState to restore complete state
      const { deserializeGameState } = await import('@/utils/saveState');
      const restoredState = deserializeGameState(loaded);
      
      // Verify player data was loaded
      if (!restoredState.player) {
        throw new Error('Player data not found in save');
      }
      
      // Log what was loaded for verification
      console.log('Loading game data:', {
        playerName: restoredState.player.name,
        level: restoredState.player.level,
        coins: restoredState.player.coins,
        inventoryCount: restoredState.player.inventory?.length || 0,
        equippedItems: Object.keys(restoredState.player.equippedItems || {}).length,
      });
      
      // Restore all game state
      useGameStore.setState(restoredState);
      
      // Ensure game is initialized
      updateGameState({
        isInitialized: true,
      });
      
      setScreen('game');
      toast.success('Game loaded successfully!', {
        description: `Welcome back! Level ${restoredState.player.level}, ${restoredState.player.coins} coins`,
      });
    } catch (e) {
      console.error('Load game failed', e);
      toast.error('Could not load save', {
        description: 'Check the player name and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    setScreen('character');
  };

  const handleLoadSavedGame = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const playerId = getPlayerId();
      if (!playerId) {
        toast.error('Unable to identify player');
        setLoading(false);
        return;
      }

      const saves = await api.getSaves(playerId);
      if (saves && saves.length > 0) {
        const latest = saves[0];
        setSavePreview({
          name: authUser.name,
          level: latest.preview?.level || 1,
          class: latest.preview?.class || 'Unknown',
        });
        setShowLoadDialog(true);
      } else {
        toast.info('No saved game found', {
          description: 'Starting a new game...',
        });
        setScreen('character');
      }
    } catch (e) {
      console.error('Load saved game failed', e);
      toast.error('Could not check for saved games');
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = async () => {
    if (!authUser) {
      // For non-logged-in users, just go to character creation
      setScreen('character');
      return;
    }

    setLoading(true);
    try {
      const playerId = getPlayerId();
      if (!playerId) {
        // No player ID, just start new game
        resetGame();
        setScreen('character');
        setLoading(false);
        return;
      }

      // Check for existing saves
      const saves = await api.getSaves(playerId);
      if (saves && saves.length > 0) {
        const latest = saves[0];
        setSavePreview({
          name: authUser.name,
          level: latest.preview?.level || 1,
          class: latest.preview?.class || 'Unknown',
        });
        setShowNewGameDialog(true);
      } else {
        // No saves, just start new game
        resetGame();
        setScreen('character');
      }
    } catch (e) {
      console.error('Check saves failed', e);
      // If check fails, just start new game
      resetGame();
      setScreen('character');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewGame = async () => {
    setLoading(true);
    try {
      const playerId = getPlayerId();
      if (playerId) {
        // Delete all existing saves
        const saves = await api.getSaves(playerId);
        if (saves && saves.length > 0) {
          for (const save of saves) {
            try {
              await api.deleteSave(save.saveId);
            } catch (e) {
              console.error('Failed to delete save:', save.saveId, e);
            }
          }
        }
      }

      // Reset game state
      resetGame();
      
      // Navigate to character creation
      setScreen('character');
      toast.success('Starting new game...');
    } catch (e) {
      console.error('Start new game failed', e);
      toast.error('Failed to start new game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${dungeonBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 w-full px-6 pt-6 flex items-center justify-between">
        <Button
          onClick={() => setArcadeOpen(true)}
          className="gap-2 rounded-full border border-primary/30 bg-primary/10 text-primary shadow-sm transition-all hover:bg-primary/20"
        >
          <Sparkles className="w-4 h-4" /> Mini-Game Arcade
        </Button>
        <div className="flex items-center gap-3">
          {authUser && (
            <Button
              variant="ghost"
              className="gap-2 rounded-full border border-transparent hover:border-primary/30 hover:bg-primary/10 px-4"
              onClick={() => setScreen('profile')}
              title="Profile"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </Button>
          )}
          <Button
            variant="ghost"
            className="gap-2 rounded-full border border-transparent hover:border-primary/30 hover:bg-primary/10 px-4"
            onClick={handleOpenSettings}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
          {authUser && (
            <Button
              variant="ghost"
              className="gap-2 rounded-full border border-transparent hover:border-destructive/30 hover:bg-destructive/10 px-4"
              onClick={() => {
                clearAuthUser();
                toast.success('Logged out successfully');
              }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sword className="w-16 h-16 mx-auto mb-6 text-primary" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-fantasy gold-shimmer text-glow mb-4">
            AI Dungeon Master
          </h1>
          <p className="text-xl md:text-2xl font-elegant text-muted-foreground">
            Where Your Choices Shape Destiny
          </p>
        </motion.div>


        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-2xl"
        >
          {authUser ? (
            // Logged-in user: Show two buttons
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLoadSavedGame}
                disabled={loading}
                className="h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <BookOpen className="mr-2 group-hover:translate-x-1 transition-transform" />
                Load Saved Game
              </Button>
              <Button
                onClick={handleNewGame}
                disabled={loading}
                variant="outline"
                className="h-16 text-lg font-semibold border-2 border-primary/30 hover:border-primary/60 bg-card/80 hover:bg-card transition-all duration-300 group"
              >
                <Play className="mr-2 group-hover:translate-x-1 transition-transform" />
                New Game
              </Button>
            </div>
          ) : (
            // Non-logged-in user: Show original button
            <Button
              onClick={() => setScreen('character')}
              className="h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Play className="mr-2 group-hover:translate-x-1 transition-transform" />
              Begin Your Journey
            </Button>
          )}


            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              {!authUser ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (!googleEnabled) {
                      toast.error('Google sign-in not configured', {
                        description: 'Add VITE_GOOGLE_CLIENT_ID to your environment file.',
                      });
                      return;
                    }
                    login();
                  }}
                  className="w-full gap-2 bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-300 font-medium shadow-sm"
                  variant="outline"
                  disabled={!googleEnabled}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                    className="h-5 w-5"
                  />
                  <span className="text-gray-900">{googleEnabled ? 'Sign in with Google' : 'Google sign-in unavailable'}</span>
                </Button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/50 shadow-md">
                      {authUser.picture ? (
                        <AvatarImage 
                          src={authUser.picture} 
                          alt={authUser.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
                      <p className="font-semibold text-foreground truncate">{authUser.name}</p>
                      {authUser.email && (
                        <p className="text-xs text-muted-foreground truncate" title={authUser.email}>
                          {authUser.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={handleSignOut} className="self-start shrink-0">
                    Sign out
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-12 w-12 hover:bg-primary/10 transition-all duration-300"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 text-center text-sm text-muted-foreground"
        >
          <p className="font-elegant">Powered by Gemini AI · © AI Dungeon Master</p>
        </motion.footer>
      </div>

      <MiniGameHub open={arcadeOpen} onOpenChange={setArcadeOpen} />
      
      {/* Load Game Confirmation Dialog */}
      {savePreview && (
        <LoadGameDialog
          open={showLoadDialog}
          onOpenChange={setShowLoadDialog}
          savePreview={savePreview}
          onLoad={handleLoadGame}
          onStartNew={handleStartNew}
        />
      )}

      {/* New Game Confirmation Dialog */}
      {savePreview && (
        <NewGameDialog
          open={showNewGameDialog}
          onOpenChange={setShowNewGameDialog}
          savePreview={savePreview}
          onConfirm={handleConfirmNewGame}
          onCancel={() => setShowNewGameDialog(false)}
        />
      )}
    </div>
  );
};

export default IntroScreen;
