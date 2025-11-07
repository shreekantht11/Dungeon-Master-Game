import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/store/gameStore';
import { api, ArcadePuzzleStartResponse } from '@/services/api';
import { toast } from 'sonner';
import { Clock, Lightbulb, Award, Sparkles, ChevronRight, RefreshCw, Share2, XCircle } from 'lucide-react';

const gradientMap: Record<string, string> = {
  amber: 'from-amber-500/20 via-amber-500/10 to-transparent',
  violet: 'from-violet-500/20 via-violet-500/10 to-transparent',
  cyan: 'from-cyan-400/20 via-cyan-500/10 to-transparent',
  indigo: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
  gold: 'from-yellow-500/20 via-yellow-400/10 to-transparent',
  primary: 'from-primary/20 via-primary/10 to-transparent',
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const usePlayerIdentifier = () => {
  const player = useGameStore((state) => state.player);
  const authUser = useGameStore((state) => state.authUser);
  return player?.name || authUser?.name || 'Guest';
};

const ArcadePuzzleModal = () => {
  const miniGames = useGameStore((state) => state.miniGames);
  const setMiniGameLoading = useGameStore((state) => state.setMiniGameLoading);
  const startMiniGame = useGameStore((state) => state.startMiniGame);
  const completeMiniGame = useGameStore((state) => state.completeMiniGame);
  const closeMiniGame = useGameStore((state) => state.closeMiniGame);

  const playerId = usePlayerIdentifier();
  const activePuzzle = miniGames.activePuzzle;
  const result = miniGames.lastResult && activePuzzle && miniGames.lastResult.puzzleId === activePuzzle.id
    ? miniGames.lastResult
    : null;

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [revealedHints, setRevealedHints] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activePuzzle) {
      setSelectedAnswer('');
      setRevealedHints(0);
      setTimeElapsed(0);
      return;
    }

    setSelectedAnswer('');
    setRevealedHints(0);
    setTimeElapsed(0);
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activePuzzle?.id]);

  const timeLimit = activePuzzle?.timeLimit ?? 0;
  const timeRemaining = Math.max(timeLimit - timeElapsed, 0);
  const timeProgress = timeLimit > 0 ? Math.min((timeElapsed / timeLimit) * 100, 100) : 0;
  const hints = activePuzzle?.hints ?? [];

  const showHints = () => {
    if (!hints.length) return null;
    const visibleHints = hints.slice(0, revealedHints);
    return (
      <AnimatePresence>
        {visibleHints.map((hint, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>{hint}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  const handleRevealHint = () => {
    if (!activePuzzle || revealedHints >= hints.length) return;
    setRevealedHints((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!activePuzzle) return;
    if (!selectedAnswer) {
      toast.error('Select an answer before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        playerId,
        puzzleId: activePuzzle.id,
        answer: selectedAnswer,
        timeTaken: timeElapsed,
        hintsUsed: revealedHints,
      };
      const response = await api.submitPuzzleResult(payload);
      completeMiniGame({
        puzzleId: activePuzzle.id,
        correct: response.correct,
        score: response.score,
        xpAward: response.xpAward,
        triggeredBadges: response.triggeredBadges || [],
        unlockedBadges: (response.unlockedBadges || []).map((badge) => ({
          id: badge.id,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
          earnedAt: badge.earnedAt,
        })),
        progress: response.progress,
        leaderboard: response.leaderboard || [],
      });
      toast.success(response.correct ? 'Puzzle cleared!' : 'Attempt recorded');
    } catch (error) {
      console.error('Arcade submission failed:', error);
      toast.error('Could not submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplay = async () => {
    if (!activePuzzle) return;
    try {
      setMiniGameLoading(true);
      const data: ArcadePuzzleStartResponse = await api.startPuzzleSession({
        playerId,
        puzzleId: activePuzzle.id,
      });
      startMiniGame(data.puzzle, data.progress || undefined);
      toast('New attempt started');
    } catch (error) {
      console.error('Failed to restart puzzle:', error);
      toast.error('Unable to restart puzzle right now.');
    } finally {
      setMiniGameLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `I scored ${result.score} points in the ${activePuzzle?.title} puzzle!`; 
    navigator?.clipboard?.writeText(text).then(
      () => toast.success('Result copied! Share it with your friends.'),
      () => toast.error('Unable to copy result.')
    );
  };

  const gradient = activePuzzle ? gradientMap[activePuzzle.theme] || gradientMap.primary : gradientMap.primary;

  const leaderboard = useMemo(() => result?.leaderboard || [], [result?.leaderboard]);

  return (
    <Dialog open={!!activePuzzle} onOpenChange={(open) => !open && closeMiniGame()}>
      <DialogContent className="max-w-3xl border-primary/40 bg-card/95 backdrop-blur">
        {activePuzzle && (
          <div className="relative">
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} pointer-events-none`} />
            <div className="relative rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-lg">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-fantasy text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Mini-Game Challenge
                </DialogTitle>
                <p className="text-sm text-muted-foreground">{activePuzzle.description}</p>
              </DialogHeader>

              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="border-primary/40 bg-primary/10">
                    Difficulty: {activePuzzle.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10">
                    Reward: {activePuzzle.rewardXp} XP
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(timeRemaining)} left
                    </span>
                  </div>
                  {result && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/40">
                      {result.correct ? 'Success' : 'Recorded attempt'}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">{activePuzzle.question}</h4>
                  <div className="space-y-2">
                    {activePuzzle.options.map((option) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = result?.correct && result?.progress?.lastResult?.score && result.puzzleId === activePuzzle.id && option === selectedAnswer;
                      return (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          disabled={!!result}
                          onClick={() => setSelectedAnswer(option)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-card/80 hover:border-primary/50'
                          } ${result && !isSelected ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                              {option}
                            </span>
                            {isCorrect && <Award className="w-4 h-4 text-green-500" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Timer</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {formatTime(timeElapsed)} / {formatTime(timeLimit)}
                    </span>
                  </div>
                  <Progress value={timeProgress} className="h-2" />
                </div>

                {hints.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Lightbulb className="w-4 h-4" />
                        Hints
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRevealHint} disabled={revealedHints >= hints.length || !!result}>
                        Reveal hint ({revealedHints}/{hints.length})
                      </Button>
                    </div>
                    <div className="space-y-2">{showHints()}</div>
                  </div>
                )}

                {!result && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                      Submit Answer
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={closeMiniGame} className="gap-2">
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-primary/40 bg-primary/5 p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={result.correct ? 'default' : 'secondary'}>
                          {result.correct ? 'Victory!' : 'Attempt Saved'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: <span className="font-semibold text-primary">{result.score}</span> · XP Award: <span className="font-semibold text-primary">{result.xpAward}</span>
                        </span>
                      </div>

                      {result.triggeredBadges.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Badges unlocked:</span>
                          {result.triggeredBadges.map((badge) => (
                            <Badge key={badge} variant="outline" className="border-primary/40 bg-primary/10">
                              {badge.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="rounded-lg border border-primary/30 bg-background/80 p-3">
                        <h5 className="font-semibold text-sm text-primary mb-2">Leaderboard Highlights</h5>
                        {leaderboard.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Be the first to claim a top spot!</p>
                        ) : (
                          <ScrollArea className="max-h-40">
                            <ul className="space-y-1 text-sm">
                              {leaderboard.map((entry, index) => (
                                <li key={`${entry.playerId}-${index}`} className="flex items-center justify-between border-b border-border/60 py-1 last:border-none">
                                  <span className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                    <span className="font-semibold text-foreground truncate max-w-[150px]">{entry.playerId}</span>
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Score: <span className="font-semibold text-primary">{entry.highestScore}</span>
                                    {entry.bestTime ? ` · ${formatTime(Math.round(entry.bestTime))}` : ''}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </ScrollArea>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Plays: {result.progress.plays} · Wins: {result.progress.wins} · Streak: {result.progress.streak ?? 0}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                            <Share2 className="w-4 h-4" /> Share
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleReplay} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Play again
                          </Button>
                          <Button size="sm" onClick={closeMiniGame} className="gap-2">
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArcadePuzzleModal;

