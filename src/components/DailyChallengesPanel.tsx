import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle2, Clock, Flame, Trophy, Coins, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const DailyChallengesPanel = () => {
  const {
    player,
    dailyChallenge,
    setDailyChallenge,
    challengeStreak,
    weeklyChallenge,
    setWeeklyChallenge,
    addCoins,
    updatePlayer,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Initialize daily challenge if none exists
    if (!dailyChallenge) {
      const today = new Date().toISOString().split('T')[0];
      const challenges = [
        {
          id: 'daily_combat_1',
          date: today,
          title: 'Combat Master',
          description: 'Defeat 3 enemies in combat',
          objectives: [{ text: 'Defeat 3 enemies', completed: false }],
          rewards: { xp: 200, coins: 50 },
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          category: 'combat' as const,
        },
        {
          id: 'daily_explore_1',
          date: today,
          title: 'Explorer',
          description: 'Discover 2 new locations',
          objectives: [{ text: 'Discover 2 locations', completed: false }],
          rewards: { xp: 150, coins: 30 },
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          category: 'exploration' as const,
        },
        {
          id: 'daily_collect_1',
          date: today,
          title: 'Collector',
          description: 'Collect 5 items',
          objectives: [{ text: 'Collect 5 items', completed: false }],
          rewards: { xp: 100, coins: 25 },
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          category: 'collection' as const,
        },
      ];
      setDailyChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    }

    // Initialize weekly challenge if none exists
    if (!weeklyChallenge) {
      setWeeklyChallenge({
        id: 'weekly_1',
        date: new Date().toISOString().split('T')[0],
        title: 'Weekly Warrior',
        description: 'Complete 10 combat encounters',
        objectives: [{ text: 'Complete 10 combat encounters', completed: false }],
        rewards: { xp: 1000, coins: 200 },
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'combat' as const,
      });
    }
  }, [dailyChallenge, weeklyChallenge, setDailyChallenge, setWeeklyChallenge]);

  const handleCompleteChallenge = (challenge: typeof dailyChallenge) => {
    if (!challenge || challenge.completed || !player) return;

    // Check if objectives are met (simplified - in real implementation, track progress)
    const completed = challenge.objectives.every((obj) => obj.completed);

    if (completed) {
      // Add rewards
      if (challenge.rewards.xp) {
        updatePlayer({ xp: player.xp + challenge.rewards.xp });
      }
      if (challenge.rewards.coins) {
        addCoins(challenge.rewards.coins);
      }

      setDailyChallenge({ ...challenge, completed: true });
      toast.success(`Challenge completed! +${challenge.rewards.xp} XP, +${challenge.rewards.coins} coins`);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'combat':
        return Target;
      case 'exploration':
        return Clock;
      case 'collection':
        return Trophy;
      case 'social':
        return Flame;
      default:
        return Target;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'combat':
        return 'text-red-500 border-red-500';
      case 'exploration':
        return 'text-blue-500 border-blue-500';
      case 'collection':
        return 'text-yellow-500 border-yellow-500';
      case 'social':
        return 'text-purple-500 border-purple-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-fantasy">Daily Challenges</h2>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-semibold">Streak: {challengeStreak} days</span>
        </div>
      </div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <Card className="p-5 border-2 border-primary/30">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = getCategoryIcon(dailyChallenge.category);
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <h3 className="text-lg font-semibold">{dailyChallenge.title}</h3>
                  {dailyChallenge.category && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(dailyChallenge.category)}`}
                    >
                      {dailyChallenge.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{dailyChallenge.description}</p>
              </div>
              {dailyChallenge.completed && (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {dailyChallenge.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-sm ${obj.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {obj.text}
                  </span>
                  {obj.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">+{dailyChallenge.rewards.xp} XP</span>
                </div>
                {dailyChallenge.rewards.coins && (
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">+{dailyChallenge.rewards.coins} coins</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleCompleteChallenge(dailyChallenge)}
                disabled={dailyChallenge.completed}
              >
                {dailyChallenge.completed ? 'Completed' : 'Complete'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <Card className="p-5 border-2 border-yellow-500/30 bg-yellow-500/5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Weekly Challenge</h3>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                    Weekly
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{weeklyChallenge.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires: {new Date(weeklyChallenge.expiresAt).toLocaleDateString()}
                </p>
              </div>
              {weeklyChallenge.completed && (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {weeklyChallenge.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-sm ${obj.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {obj.text}
                  </span>
                  {obj.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">+{weeklyChallenge.rewards.xp} XP</span>
                </div>
                {weeklyChallenge.rewards.coins && (
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">+{weeklyChallenge.rewards.coins} coins</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (weeklyChallenge && !weeklyChallenge.completed) {
                    setWeeklyChallenge({ ...weeklyChallenge, completed: true });
                    if (player) {
                      updatePlayer({ xp: player.xp + weeklyChallenge.rewards.xp });
                      if (weeklyChallenge.rewards.coins) {
                        addCoins(weeklyChallenge.rewards.coins);
                      }
                    }
                    toast.success('Weekly challenge completed!');
                  }
                }}
                disabled={weeklyChallenge.completed}
              >
                {weeklyChallenge.completed ? 'Completed' : 'Complete'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DailyChallengesPanel;

