import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Target, MapPin, Package, Users, BookOpen, CheckCircle2, Gift, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MilestonesPage = ({ embedded = false }: { embedded?: boolean }) => {
  const {
    player,
    milestones,
    setMilestones,
    updateMilestone,
    claimMilestone,
    setScreen,
    gameState,
    locationStats,
    codex,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Initialize milestones if empty
    if (milestones.length === 0 && player) {
      const initialMilestones = [
        {
          id: 'milestone_combat_10',
          title: 'Novice Warrior',
          description: 'Defeat 10 enemies',
          category: 'combat' as const,
          target: 10,
          current: gameState.combatEncounters || 0,
          reward: { coins: 100, items: ['weapon_iron_sword'] },
          completed: false,
        },
        {
          id: 'milestone_combat_50',
          title: 'Seasoned Fighter',
          description: 'Defeat 50 enemies',
          category: 'combat' as const,
          target: 50,
          current: gameState.combatEncounters || 0,
          reward: { coins: 500, items: ['weapon_steel_sword'] },
          completed: false,
        },
        {
          id: 'milestone_combat_100',
          title: 'Master Warrior',
          description: 'Defeat 100 enemies',
          category: 'combat' as const,
          target: 100,
          current: gameState.combatEncounters || 0,
          reward: { coins: 1000, items: ['weapon_legendary'] },
          completed: false,
        },
        {
          id: 'milestone_explore_5',
          title: 'Wanderer',
          description: 'Discover 5 locations',
          category: 'exploration' as const,
          target: 5,
          current: Object.keys(locationStats).length || 1,
          reward: { coins: 150, unlock: 'fast_travel' },
          completed: false,
        },
        {
          id: 'milestone_explore_20',
          title: 'World Explorer',
          description: 'Discover 20 locations',
          category: 'exploration' as const,
          target: 20,
          current: Object.keys(locationStats).length || 1,
          reward: { coins: 500, unlock: 'world_map_enhanced' },
          completed: false,
        },
        {
          id: 'milestone_collect_25',
          title: 'Collector',
          description: 'Collect 25 unique items',
          category: 'collection' as const,
          target: 25,
          current: Object.keys(codex.items || {}).length || 0,
          reward: { coins: 200, items: ['collection_bonus'] },
          completed: false,
        },
        {
          id: 'milestone_collect_50',
          title: 'Master Collector',
          description: 'Collect 50 unique items',
          category: 'collection' as const,
          target: 50,
          current: Object.keys(codex.items || {}).length || 0,
          reward: { coins: 500, items: ['collection_master'] },
          completed: false,
        },
        {
          id: 'milestone_story_3',
          title: 'Story Seeker',
          description: 'Unlock 3 story endings',
          category: 'story' as const,
          target: 3,
          current: 0, // Will be updated from unlockedEndings
          reward: { coins: 300, unlock: 'story_mode' },
          completed: false,
        },
        {
          id: 'milestone_story_5',
          title: 'Story Master',
          description: 'Unlock 5 story endings',
          category: 'story' as const,
          target: 5,
          current: 0,
          reward: { coins: 750, unlock: 'story_master_mode' },
          completed: false,
        },
        {
          id: 'milestone_level_10',
          title: 'Rising Star',
          description: 'Reach level 10',
          category: 'combat' as const,
          target: 10,
          current: player?.level || 1,
          reward: { coins: 500, items: ['level_10_reward'] },
          completed: false,
        },
      ];
      setMilestones(initialMilestones);
    }
  }, [milestones.length, player, gameState, locationStats, codex, setMilestones]);

  const categories = ['all', 'combat', 'exploration', 'collection', 'social', 'story'];
  const filteredMilestones =
    selectedCategory === 'all'
      ? milestones
      : milestones.filter((m) => m.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat':
        return Target;
      case 'exploration':
        return MapPin;
      case 'collection':
        return Package;
      case 'social':
        return Users;
      case 'story':
        return BookOpen;
      default:
        return Target;
    }
  };

  const handleClaim = (milestoneId: string) => {
    claimMilestone(milestoneId);
    toast.success('Milestone reward claimed!');
  };

  if (!player) {
    if (!embedded) {
      setScreen('intro');
    }
    return null;
  }

  return (
    <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
      <div className={embedded ? "px-0 py-0" : "container mx-auto px-4 py-8"}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          {!embedded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setScreen('game')}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-2" />
                  Back to Game
                </Button>
                <div>
                  <h1 className="text-4xl font-fantasy gold-shimmer text-glow flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    Milestones
                  </h1>
                  <p className="text-muted-foreground mt-2">Track your progress and claim rewards</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat);
                return (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    <Icon className="w-4 h-4 mr-2" />
                    {cat}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <ScrollArea className={embedded ? "h-[600px]" : "h-[calc(100vh-300px)]"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMilestones.map((milestone) => {
                    const progress = Math.min((milestone.current / milestone.target) * 100, 100);
                    const isCompleted = milestone.current >= milestone.target;
                    const Icon = getCategoryIcon(milestone.category);

                    return (
                      <Card
                        key={milestone.id}
                        className={`p-5 border-2 transition-all ${
                          isCompleted && milestone.completedAt
                            ? 'border-green-500 bg-green-500/10'
                            : isCompleted
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-5 h-5" />
                                <h3 className="text-lg font-semibold">{milestone.title}</h3>
                                {milestone.completedAt && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            </div>
                            <Badge variant="outline">{milestone.category}</Badge>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {milestone.current} / {milestone.target}
                              </span>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs font-semibold mb-2">Rewards:</p>
                            <div className="flex flex-wrap gap-2">
                              {milestone.reward.coins && (
                                <div className="flex items-center gap-1">
                                  <Coins className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm">{milestone.reward.coins} coins</span>
                                </div>
                              )}
                              {milestone.reward.items && milestone.reward.items.map((item, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                              {milestone.reward.unlock && (
                                <Badge variant="outline" className="text-xs">
                                  Unlock: {milestone.reward.unlock}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {isCompleted && !milestone.completedAt && (
                            <Button
                              onClick={() => handleClaim(milestone.id)}
                              className="w-full"
                              size="lg"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Claim Reward
                            </Button>
                          )}
                          {milestone.completedAt && (
                            <div className="text-center text-sm text-green-500">
                              Claimed on {new Date(milestone.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MilestonesPage;

