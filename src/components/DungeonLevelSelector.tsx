import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, TrendingUp, Award, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DungeonLevelSelectorProps {
  locationId: string;
  locationName: string;
  maxLevel: number;
  recommendedLevel: number;
  highestLevelReached: number;
  open: boolean;
  onClose: () => void;
  onSelect: (level: number) => void;
}

const DungeonLevelSelector = ({
  locationId,
  locationName,
  maxLevel,
  recommendedLevel,
  highestLevelReached,
  open,
  onClose,
  onSelect,
}: DungeonLevelSelectorProps) => {
  const { t } = useTranslation();
  const player = useGameStore((state) => state.player);
  const [selectedLevel, setSelectedLevel] = useState(1);

  if (!player) return null;

  const getDifficulty = (level: number): 'easy' | 'medium' | 'hard' | 'extreme' => {
    const levelDiff = level - player.level;
    if (levelDiff <= -2) return 'easy';
    if (levelDiff <= 0) return 'medium';
    if (levelDiff <= 2) return 'hard';
    return 'extreme';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-orange-500';
      case 'extreme':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      case 'extreme':
        return 'Extreme';
      default:
        return 'Unknown';
    }
  };

  const calculateRewards = (level: number) => {
    const baseXp = 50;
    const baseGold = 25;
    return {
      xp: Math.floor(baseXp * (1 + level * 0.3)),
      gold: Math.floor(baseGold * (1 + level * 0.3)),
    };
  };

  const availableLevels = Array.from({ length: maxLevel }, (_, i) => i + 1);
  const selectedDifficulty = getDifficulty(selectedLevel);
  const rewards = calculateRewards(selectedLevel);
  const isLevelLocked = selectedLevel > highestLevelReached + 1;
  const isLevelTooHigh = selectedLevel > player.level + 2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Floor - {locationName}</DialogTitle>
          <DialogDescription>
            Choose which floor to explore. Higher floors offer greater rewards but increased difficulty.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Level Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Floor</label>
            <div className="grid grid-cols-5 gap-2">
              {availableLevels.map((level) => {
                const isUnlocked = level <= highestLevelReached + 1;
                const isRecommended = level === recommendedLevel;
                const difficulty = getDifficulty(level);

                return (
                  <motion.button
                    key={level}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                    onClick={() => isUnlocked && setSelectedLevel(level)}
                    disabled={!isUnlocked}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      selectedLevel === level
                        ? 'border-primary bg-primary/20'
                        : isUnlocked
                        ? 'border-border hover:border-primary/50'
                        : 'border-muted bg-muted/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {!isUnlocked && (
                      <Lock className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold">{level}</div>
                      <div className="text-xs text-muted-foreground">Floor</div>
                    </div>
                    {isRecommended && (
                      <Badge className="absolute -top-2 -right-2 text-xs">Rec</Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Level Info */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Floor {selectedLevel}</h3>
              <Badge
                variant={selectedDifficulty === 'extreme' ? 'destructive' : 'secondary'}
                className={getDifficultyColor(selectedDifficulty)}
              >
                {getDifficultyLabel(selectedDifficulty)}
              </Badge>
            </div>

            {isLevelTooHigh && (
              <div className="flex items-center gap-2 text-sm text-orange-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning: This floor may be too difficult for your level</span>
              </div>
            )}

            {isLevelLocked && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Complete Floor {selectedLevel - 1} first to unlock</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Recommended Level</div>
                  <div className="font-semibold">Level {recommendedLevel + selectedLevel - 1}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Estimated Rewards</div>
                  <div className="font-semibold">
                    {rewards.xp} XP, {rewards.gold} Gold
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSelect(selectedLevel);
                onClose();
              }}
              disabled={isLevelLocked}
            >
              Enter Floor {selectedLevel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DungeonLevelSelector;

