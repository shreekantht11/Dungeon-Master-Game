import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const PuzzlePanel = () => {
  const { currentPuzzle, setPuzzle, updateGameState, updatePlayer, resetGame, setScreen, player } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);

  // Log correct answer to terminal for testing
  useEffect(() => {
    if (currentPuzzle?.correctAnswer) {
      console.log('🧩 PUZZLE TESTING INFO:');
      console.log('Correct Answer:', currentPuzzle.correctAnswer);
      console.log('All Options:', currentPuzzle.options || []);
      console.log('Question:', currentPuzzle.question);
    }
  }, [currentPuzzle]);

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
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Hint:</span>
                </div>
                <p className="text-sm text-muted-foreground">{currentPuzzle.hints[0]}</p>
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
              onClick={() => setShowHint(!showHint)}
              className="flex-1"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!selectedAnswer.trim()}
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

