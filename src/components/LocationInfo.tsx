import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sword, Package, Layers, Target } from 'lucide-react';

interface LocationInfoProps {
  locationId: string;
  locationName: string;
  maxLevel: number;
  recommendedLevel: number;
  open: boolean;
  onClose: () => void;
}

const LocationInfo = ({
  locationId,
  locationName,
  maxLevel,
  recommendedLevel,
  open,
  onClose,
}: LocationInfoProps) => {
  const player = useGameStore((state) => state.player);
  const locationStats = useGameStore((state) => state.locationStats);
  const locationProgress = useGameStore((state) => state.locationProgress);

  if (!player) return null;

  const stats = locationStats[locationId] || {
    timesVisited: 0,
    enemiesDefeated: 0,
    itemsFound: 0,
    highestLevel: 0,
    completed: false,
  };

  const completionPercentage = maxLevel > 0 ? (stats.highestLevel / maxLevel) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{locationName}</DialogTitle>
          <DialogDescription>
            Detailed information about this location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Location Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Recommended Level</span>
              </div>
              <p className="text-2xl font-bold">Level {recommendedLevel}</p>
            </div>
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Max Floors</span>
              </div>
              <p className="text-2xl font-bold">{maxLevel}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion</span>
              <Badge variant="secondary">
                {Math.round(completionPercentage)}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Floor {stats.highestLevel || 0} of {maxLevel} reached
            </p>
          </div>

          {/* Statistics */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Statistics</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-muted-foreground">Visits</p>
                <p className="text-lg font-bold">{stats.timesVisited}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Sword className="w-4 h-4 mx-auto mb-1 text-destructive" />
                <p className="text-xs text-muted-foreground">Enemies</p>
                <p className="text-lg font-bold">{stats.enemiesDefeated}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Package className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-lg font-bold">{stats.itemsFound}</p>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          {stats.completed && (
            <div className="bg-primary/10 border border-primary rounded-lg p-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">Location Completed!</p>
                <p className="text-xs text-muted-foreground">
                  You have fully explored this location
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationInfo;

