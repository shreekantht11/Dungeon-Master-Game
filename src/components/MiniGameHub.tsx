import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, ArcadePuzzleSummary } from '@/store/gameStore';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ArcadePuzzleModal from '@/components/ArcadePuzzleModal';
import { toast } from 'sonner';
import { Play, Trophy, Sparkles, Clock, Target, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const themeGradient: Record<string, string> = {
  amber: 'from-amber-500/20 via-amber-500/10 to-background',
  violet: 'from-violet-500/20 via-violet-500/10 to-background',
  cyan: 'from-cyan-400/20 via-cyan-400/10 to-background',
  indigo: 'from-indigo-500/20 via-indigo-500/10 to-background',
  gold: 'from-yellow-500/20 via-yellow-400/10 to-background',
  primary: 'from-primary/20 via-primary/10 to-background',
};

const formatBestTime = (best?: number | null) => {
  if (!best || best <= 0) return '—';
  const mins = Math.floor(best / 60);
  const secs = Math.round(best % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const usePlayerIdentifier = () => {
  const player = useGameStore((state) => state.player);
  const authUser = useGameStore((state) => state.authUser);
  return player?.name || authUser?.name || 'Guest';
};

interface MiniGameHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MiniGameHub = ({ open, onOpenChange }: MiniGameHubProps) => {
  const miniGames = useGameStore((state) => state.miniGames);
  const setMiniGameLoading = useGameStore((state) => state.setMiniGameLoading);
  const setMiniGameCatalog = useGameStore((state) => state.setMiniGameCatalog);
  const startMiniGame = useGameStore((state) => state.startMiniGame);

  const playerId = usePlayerIdentifier();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setMiniGameLoading(true);
        const puzzles = await api.getPuzzleCatalog(playerId);
        setMiniGameCatalog(puzzles as ArcadePuzzleSummary[]);
      } catch (error) {
        console.error('Failed to load mini-game catalog:', error);
        toast.error('Unable to load mini-games.');
      } finally {
        setMiniGameLoading(false);
      }
    };

    if (miniGames.catalog.length === 0 && !miniGames.loading) {
      loadCatalog();
    }
  }, [miniGames.catalog.length, miniGames.loading, playerId, setMiniGameCatalog, setMiniGameLoading]);

  const handlePlay = async (puzzleId: string) => {
    try {
      setMiniGameLoading(true);
      const data = await api.startPuzzleSession({ playerId, puzzleId });
      startMiniGame(data.puzzle, data.progress || undefined);
    } catch (error) {
      console.error('Failed to start mini-game session:', error);
      toast.error('Cannot start this puzzle right now.');
    } finally {
      setMiniGameLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-primary/40 bg-card/95 backdrop-blur">
        <DialogHeader className="mb-4 space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl font-fantasy text-primary">
              <Sparkles className="w-5 h-5" /> Puzzle Mini-Arcade
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Dive into standalone challenges, climb the leaderboard, and earn exclusive arcade badges.
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            {miniGames.loading && miniGames.catalog.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
                }}
              >
                {miniGames.catalog.map((puzzle) => (
                  <motion.div key={puzzle.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <Card className="relative overflow-hidden border-primary/20 bg-card/95 p-4 shadow-lg">
                      <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient[puzzle.theme] || themeGradient.primary}`} />
                      <div className="relative flex h-full flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="border-primary/40 bg-primary/10">
                              {puzzle.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {puzzle.timeLimit}s
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-primary leading-tight">{puzzle.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{puzzle.description}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span>
                              Best Time: <span className="font-semibold text-primary">{formatBestTime(puzzle.bestTime)}</span>
                            </span>
                            <span>
                              Wins: <span className="font-semibold text-primary">{puzzle.wins ?? 0}</span> / {puzzle.plays ?? 0}
                            </span>
                          </div>
                          <Button size="sm" className="gap-2" onClick={() => handlePlay(puzzle.id)} disabled={miniGames.loading}>
                            <Play className="w-4 h-4" /> Play
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Earn special arcade badges for streaks and perfect solves.
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" /> Leaderboards update live after every attempt.
              </span>
            </div>
          </div>
        </ScrollArea>

        <ArcadePuzzleModal />
      </DialogContent>
    </Dialog>
  );
};

export default MiniGameHub;

