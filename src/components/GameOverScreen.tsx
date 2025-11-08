import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skull, Trophy, BarChart3, Target, ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface GameOverScreenProps {
  open: boolean;
  deathMessage: string;
  onReturnToMenu: () => void;
}

const GameOverScreen = ({ open, deathMessage, onReturnToMenu }: GameOverScreenProps) => {
  const { player, playerScore, activeQuests, completedQuests, badges } = useGameStore();

  if (!player) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-sm border-2 border-destructive/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Death Message */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Skull className="w-20 h-20 mx-auto text-destructive mb-4" />
            </motion.div>
            <h2 className="text-3xl font-fantasy text-destructive">Game Over</h2>
            <p className="text-lg text-foreground font-elegant">{deathMessage}</p>
          </div>

          {/* Stats Summary */}
          <Card className="bg-muted/50 border-border p-6 space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Final Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="font-semibold text-foreground">{player.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className={`font-semibold ${
                    playerScore > 80 ? 'text-green-500' : 
                    playerScore >= 50 ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}>
                    {playerScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coins</span>
                  <span className="font-semibold text-foreground">{player.coins || 0}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quests Completed</span>
                  <span className="font-semibold text-foreground">{completedQuests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Quests</span>
                  <span className="font-semibold text-foreground">{activeQuests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Badges Earned</span>
                  <span className="font-semibold text-foreground">{badges.length}</span>
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Character Stats
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">STR:</span>
                  <span className="ml-2 font-semibold text-foreground">{player.stats.strength}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">INT:</span>
                  <span className="ml-2 font-semibold text-foreground">{player.stats.intelligence}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AGI:</span>
                  <span className="ml-2 font-semibold text-foreground">{player.stats.agility}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Return Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onReturnToMenu}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-fantasy">Return to Menu</span>
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverScreen;

