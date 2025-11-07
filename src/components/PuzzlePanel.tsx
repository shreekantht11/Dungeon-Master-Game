import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Lightbulb, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

const PuzzlePanel = () => {
  const { currentPuzzle, setPuzzle, updateGameState, updatePlayer, resetGame, setScreen, player } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log correct answer to terminal for testing
  useEffect(() => {
    if (currentPuzzle?.correctAnswer) {
      console.log('🧩 PUZZLE TESTING INFO:');
      console.log('Correct Answer:', currentPuzzle.correctAnswer);
      console.log('All Options:', currentPuzzle.options || []);
      console.log('Question:', currentPuzzle.question);
    }
  }, [currentPuzzle]);

  // Timer effect
  useEffect(() => {
    if (timerEnabled && timerActive && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up!
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerEnabled, timerActive, timeRemaining]);

  // Start timer when puzzle appears if enabled
  useEffect(() => {
    if (timerEnabled && currentPuzzle) {
      setTimerActive(true);
    }
  }, [timerEnabled, currentPuzzle]);

  const handleTimeUp = () => {
    setTimerActive(false);
    toast.error('⏰ Time\'s up! Game Over!');
    setTimeout(() => {
      resetGame();
      setScreen('intro');
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShowHint = () => {
    if (!player) return;
    
    const hintCost = 50; // XP cost per hint
    if (player.xp < hintCost) {
      toast.error(`Not enough XP! Need ${hintCost} XP for a hint.`);
      return;
    }

    if (currentPuzzle.hints && hintIndex < currentPuzzle.hints.length) {
      updatePlayer({ xp: player.xp - hintCost });
      setShowHint(true);
      toast.info(`Hint unlocked! (-${hintCost} XP)`);
    } else {
      toast.info('No more hints available!');
    }
  };

  const handleNextHint = () => {
    if (!player) return;
    
    const hintCost = 50;
    if (player.xp < hintCost) {
      toast.error(`Not enough XP! Need ${hintCost} XP for another hint.`);
      return;
    }

    if (currentPuzzle.hints && hintIndex < currentPuzzle.hints.length - 1) {
      updatePlayer({ xp: player.xp - hintCost });
      setHintIndex(hintIndex + 1);
      toast.info(`Next hint unlocked! (-${hintCost} XP)`);
    } else {
      toast.info('No more hints available!');
    }
  };

  if (!currentPuzzle) return null;

  const handleOptionSelect = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer.trim()) {
      toast.error('Please select an answer!');
      return;
    }

    // Check if selected answer matches the correct answer exactly
    const isCorrect = selectedAnswer.trim().toLowerCase() === currentPuzzle.correctAnswer.trim().toLowerCase() ||
                     selectedAnswer.trim().toLowerCase().includes(currentPuzzle.correctAnswer.trim().toLowerCase()) ||
                     currentPuzzle.correctAnswer.trim().toLowerCase().includes(selectedAnswer.trim().toLowerCase());

    // Log result to terminal for testing
    console.log('🧩 PUZZLE RESULT:');
    console.log('Selected:', selectedAnswer);
    console.log('Correct:', currentPuzzle.correctAnswer);
    console.log('Is Correct:', isCorrect);

    if (isCorrect) {
      toast.success('🎉 Puzzle Solved! You Win!');
      updateGameState({ isFinalPhase: false, storyPhase: 'completed' });
      setPuzzle(null);
      if (player) {
        updatePlayer({ xp: player.xp + 500 });
      }
    } else {
      toast.error('❌ Wrong Answer! Game Over!');
      console.log('❌ Player failed the puzzle. Game Over.');
      setTimeout(() => {
        resetGame();
        setScreen('intro');
      }, 3000);
    }
  };

  // Use options if available, otherwise fallback to text input
  const hasOptions = currentPuzzle.options && currentPuzzle.options.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-card border-2 border-primary rounded-xl p-6 space-y-6 relative">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-primary">🧩 Final Puzzle!</h2>
          </div>
          <p className="text-muted-foreground">Solve this to complete your quest!</p>
          
          {/* Timer Display */}
          {timerEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                timeRemaining < 60 
                  ? 'bg-destructive/20 border-destructive text-destructive' 
                  : 'bg-primary/10 border-primary/30 text-primary'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </motion.div>
          )}
        </div>

        {/* Timer Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="timer-toggle" className="text-sm font-medium cursor-pointer">
              Enable Timer (5 minutes)
            </Label>
          </div>
          <Switch
            id="timer-toggle"
            checked={timerEnabled}
            onCheckedChange={(checked) => {
              setTimerEnabled(checked);
              if (checked) {
                setTimeRemaining(300);
                setTimerActive(true);
              } else {
                setTimerActive(false);
              }
            }}
          />
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="space-y-4">
            {currentPuzzle.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description:</h3>
                <p className="text-foreground">{currentPuzzle.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Question:</h3>
              <p className="text-primary font-medium text-lg">{currentPuzzle.question}</p>
            </div>

            {showHint && currentPuzzle.hints && currentPuzzle.hints.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Hint {hintIndex + 1}:</span>
                  </div>
                  {currentPuzzle.hints.length > hintIndex + 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextHint}
                      className="h-6 text-xs"
                      disabled={!player || player.xp < 50}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Next Hint (50 XP)
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{currentPuzzle.hints[hintIndex]}</p>
              </div>
            )}
          </div>
        </Card>

        {/* 5 Options Display */}
        {hasOptions ? (
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Choose your answer:</label>
            <div className="grid grid-cols-1 gap-3">
              {currentPuzzle.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-3 px-4 ${
                    selectedAnswer === option 
                      ? "bg-primary text-primary-foreground border-2 border-primary" 
                      : "hover:bg-primary/10"
                  }`}
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Your Answer:</label>
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:border-primary focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        )}

        <div className="flex gap-3">
          {currentPuzzle.hints && currentPuzzle.hints.length > 0 && (
            <Button
              variant="outline"
              onClick={showHint ? () => setShowHint(false) : handleShowHint}
              className="flex-1"
              disabled={!player || (showHint ? false : player.xp < 50)}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'Hide Hint' : `Show Hint (50 XP)`}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!selectedAnswer.trim() || (timerEnabled && timeRemaining <= 0)}
          >
            Submit Answer
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          ⚠️ This puzzle is COMPULSORY. Solve it to win, or fail and game over!
        </p>
      </div>
    </motion.div>
  );
};

export default PuzzlePanel;

