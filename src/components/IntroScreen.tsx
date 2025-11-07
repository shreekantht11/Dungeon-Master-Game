import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import { Sword, Play, Settings, BookOpen } from 'lucide-react';
import { api } from '@/services/api';
import { useGoogleLogin } from '@react-oauth/google';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

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
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

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

          <Button
            variant="ghost"
            onClick={() => setScreen('settings')}
            className="h-12 text-base hover:bg-primary/10 transition-all duration-300"
          >
            <Settings className="mr-2" />
            Settings
          </Button>
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
    </div>
  );
};

export default IntroScreen;
