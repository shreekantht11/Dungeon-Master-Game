import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import { Sword, Play, Settings, BookOpen, Moon, Sun, User, Clock, Award, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import { useGoogleLogin } from '@react-oauth/google';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import MiniGameHub from '@/components/MiniGameHub';
import { useTheme } from 'next-themes';

const IntroScreen = () => {
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
  const [showContinue, setShowContinue] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickStats, setQuickStats] = useState<{ player?: any; lastPlayed?: string } | null>(null);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const { theme, setTheme } = useTheme();
  const [arcadeOpen, setArcadeOpen] = useState(false);

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
        setAuthUser({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          token: tokenResponse.access_token,
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

  // Load quick stats for returning user
  useEffect(() => {
    const loadQuickStats = async () => {
      if (!authUser?.name) return;
      try {
        const saves = await api.getSaves(authUser.name);
        if (saves && saves.length > 0) {
          const latest = saves[0];
          if (latest.updatedAt) {
            const lastPlayed = new Date(latest.updatedAt);
            const now = new Date();
            const diffMs = now.getTime() - lastPlayed.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));
            
            let timeAgo = '';
            if (diffDays > 0) {
              timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
              timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMins > 0) {
              timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else {
              timeAgo = 'Just now';
            }

            setQuickStats({
              lastPlayed: timeAgo,
            });
          }
        }
      } catch (e) {
        // Silently fail - user might not have saves yet
      }
    };
    loadQuickStats();
  }, [authUser?.name]);

  const handleSignOut = () => {
    clearAuthUser();
    setName('');
    toast('Signed out', { description: 'Come back soon, adventurer!' });
  };

  const handleContinue = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const loaded = await api.loadGameByName(name.trim());
      // Hydrate minimal fields
      if (loaded?.player) useGameStore.setState({ player: loaded.player });
      if (loaded?.genre) setGenre(loaded.genre);
      if (loaded?.story) updateStory(loaded.story);
      if (Array.isArray(loaded?.choices)) setPlayerChoices(loaded.choices);
      if (loaded?.puzzle) setPuzzle(loaded.puzzle);
      if (Array.isArray(loaded?.badges)) {
        setBadges(loaded.badges);
      } else {
        setBadges([]);
      }
      if (Array.isArray(loaded?.cameos)) {
        setCameos(loaded.cameos);
      } else {
        setCameos([]);
      }
      updateGameState({
        turnCount: loaded?.turnCount ?? 0,
        storyPhase: loaded?.storyPhase ?? 'exploration',
        combatEncounters: loaded?.combatEncounters ?? 0,
        combatEscapes: loaded?.combatEscapes ?? 0,
        isAfterCombat: loaded?.isAfterCombat ?? false,
        isFinalPhase: loaded?.isFinalPhase ?? false,
        isInitialized: true,
      });
      setScreen('game');
    } catch (e) {
      console.error('Continue by name failed', e);
      toast.error('Could not load save', {
        description: 'Check the player name and try again.',
      });
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
          <Button
            variant="ghost"
            className="gap-2 rounded-full border border-transparent hover:border-primary/30 hover:bg-primary/10 px-4"
            onClick={handleOpenSettings}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
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

        {/* Quick Stats Preview */}
        {quickStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 w-full max-w-2xl"
          >
            <Card className="bg-card/90 backdrop-blur-sm border-primary/30 p-4">
              <div className="flex items-center gap-4 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  Last played: <span className="font-semibold text-foreground">{quickStats.lastPlayed}</span>
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-2xl"
        >
          <Button
            onClick={() => setScreen('character')}
            className="h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Play className="mr-2 group-hover:translate-x-1 transition-transform" />
            Begin Your Journey
          </Button>

          <div className="space-y-4 rounded-2xl border border-primary/20 bg-background/80 p-4">
          <Button
            variant="secondary"
              className="h-14 w-full text-lg bg-card/80 hover:bg-card border-2 border-primary/30 hover:border-primary/60 transition-all duration-300"
              onClick={() => setShowContinue((v) => !v)}
          >
            <BookOpen className="mr-2" />
            Continue Adventure
          </Button>
            {showContinue && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter player name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleContinue} disabled={loading || !name.trim()}>
                  {loading ? 'Loading...' : 'Load'}
                </Button>
              </div>
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
    </div>
  );
};

export default IntroScreen;
