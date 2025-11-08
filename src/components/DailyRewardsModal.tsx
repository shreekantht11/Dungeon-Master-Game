import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Gift, Flame, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DailyRewardsModal = () => {
  const { player, lastLoginDate, lastRewardClaimTime, loginStreak, dailyRewardsClaimed, claimDailyReward, addCoins } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [claimedDay, setClaimedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!player) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if reward was already claimed today using timestamp
    if (lastRewardClaimTime) {
      const lastClaimDate = new Date(lastRewardClaimTime);
      const lastClaimDateStr = lastClaimDate.toISOString().split('T')[0];
      
      // If already claimed today, don't show modal
      if (lastClaimDateStr === today) {
        setIsOpen(false);
        return;
      }
    }
    
    // Check if should show modal (no claim today or no previous claim)
    if (!lastRewardClaimTime || lastRewardClaimTime.split('T')[0] !== today) {
      setIsOpen(true);
    }
  }, [player, lastRewardClaimTime]);

  const rewards = [
    { day: 1, coins: 50, multiplier: 1 },
    { day: 2, coins: 75, items: ['Health Potion'], multiplier: 1 },
    { day: 3, coins: 100, multiplier: 1 },
    { day: 4, coins: 150, items: ['Common Item'], multiplier: 1.5 },
    { day: 5, coins: 200, multiplier: 1.5 },
    { day: 6, coins: 250, items: ['Uncommon Item'], multiplier: 1.5 },
    { day: 7, coins: 500, items: ['Rare Item', 'XP Booster'], multiplier: 2 },
  ];

  const currentDay = dailyRewardsClaimed || 1;
  
  // Check if can claim based on timestamp
  const canClaim = (() => {
    if (!lastRewardClaimTime) return true;
    const today = new Date().toISOString().split('T')[0];
    const lastClaimDate = new Date(lastRewardClaimTime).toISOString().split('T')[0];
    return lastClaimDate !== today;
  })();

  const handleClaim = () => {
    if (!canClaim) {
      toast.info('You have already claimed today\'s reward!');
      return;
    }

    claimDailyReward();
    setClaimedDay(currentDay);
    toast.success(`Day ${currentDay} reward claimed!`);
    
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  const getMultiplier = (day: number) => {
    if (loginStreak >= 7) return 2;
    if (loginStreak >= 4) return 1.5;
    return 1;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-fantasy gold-shimmer text-center flex items-center justify-center gap-2">
            <Gift className="w-8 h-8" />
            Daily Login Rewards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Streak Display */}
          <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Flame className="w-6 h-6 text-orange-500" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Login Streak</p>
              <p className="text-2xl font-bold text-orange-500">{loginStreak} days</p>
            </div>
            {loginStreak >= 7 && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                2x Multiplier Active!
              </Badge>
            )}
            {loginStreak >= 4 && loginStreak < 7 && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">
                1.5x Multiplier Active!
              </Badge>
            )}
          </div>

          {/* Rewards Calendar */}
          <div className="grid grid-cols-7 gap-2">
            {rewards.map((reward, index) => {
              const isClaimed = index < currentDay - 1 || (claimedDay === reward.day);
              const isToday = index === currentDay - 1;
              const isLocked = index >= currentDay;
              const multiplier = getMultiplier(reward.day);

              return (
                <motion.div
                  key={reward.day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-4 text-center border-2 transition-all ${
                      isClaimed
                        ? 'border-green-500 bg-green-500/10'
                        : isToday
                        ? 'border-primary bg-primary/20 ring-2 ring-primary'
                        : isLocked
                        ? 'border-muted bg-muted/30 opacity-60'
                        : 'border-border'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        {isClaimed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs font-semibold">Day {reward.day}</p>
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-bold">
                          {Math.floor(reward.coins * multiplier)}
                        </span>
                      </div>
                      {reward.items && (
                        <p className="text-xs text-muted-foreground">
                          +{reward.items.length} item{reward.items.length > 1 ? 's' : ''}
                        </p>
                      )}
                      {multiplier > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {multiplier}x
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Claim Button */}
          <div className="flex flex-col items-center gap-4">
            {canClaim ? (
              <Button
                onClick={handleClaim}
                size="lg"
                className="w-full max-w-md text-lg h-14"
              >
                <Gift className="w-5 h-5 mr-2" />
                Claim Day {currentDay} Reward
              </Button>
            ) : (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow for Day {currentDay + 1 > 7 ? 1 : currentDay + 1} reward!
                </p>
              </div>
            )}

            {/* Progress to Next Reward */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span>Next Reward</span>
                <span>Day {currentDay + 1 > 7 ? 1 : currentDay + 1}</span>
              </div>
              <Progress value={(currentDay / 7) * 100} className="h-2" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyRewardsModal;

