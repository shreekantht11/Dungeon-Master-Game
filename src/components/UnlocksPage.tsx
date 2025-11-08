import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Lock, Unlock, MapPin, ShoppingCart, Hammer, Sparkles, Gamepad2, Coins, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const UnlocksPage = () => {
  const {
    player,
    unlockableContent,
    setUnlockableContent,
    unlockContent,
    milestones,
    setScreen,
    spendCoins,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Initialize unlockable content if empty
    if (unlockableContent.length === 0 && player) {
      const content = [
        {
          id: 'location_dungeon',
          name: 'Ancient Dungeon',
          description: 'A dangerous dungeon filled with treasures',
          type: 'location' as const,
          unlocked: false,
          unlockRequirements: { level: 5 },
          preview: 'Unlock at level 5',
        },
        {
          id: 'location_castle',
          name: 'Royal Castle',
          description: 'The seat of power in the kingdom',
          type: 'location' as const,
          unlocked: false,
          unlockRequirements: { level: 10 },
          preview: 'Unlock at level 10',
        },
        {
          id: 'vendor_blacksmith',
          name: 'Blacksmith Shop',
          description: 'Specialized weapon and armor vendor',
          type: 'vendor' as const,
          unlocked: false,
          unlockRequirements: { coins: 500 },
          preview: 'Unlock with 500 coins',
        },
        {
          id: 'recipe_legendary',
          name: 'Legendary Crafting',
          description: 'Craft legendary items',
          type: 'recipe' as const,
          unlocked: false,
          unlockRequirements: { level: 15, milestone: 'milestone_collect_50' },
          preview: 'Unlock at level 15 + Complete collection milestone',
        },
        {
          id: 'ability_ultimate',
          name: 'Ultimate Ability',
          description: 'Unlock your class ultimate ability',
          type: 'ability' as const,
          unlocked: false,
          unlockRequirements: { level: 20 },
          preview: 'Unlock at level 20',
        },
        {
          id: 'cosmetic_legendary',
          name: 'Legendary Outfit',
          description: 'Exclusive cosmetic appearance',
          type: 'cosmetic' as const,
          unlocked: false,
          unlockRequirements: { achievement: 'master_warrior' },
          preview: 'Unlock by completing Master Warrior achievement',
        },
        {
          id: 'mode_hard',
          name: 'Hard Mode',
          description: 'Increased difficulty with better rewards',
          type: 'mode' as const,
          unlocked: false,
          unlockRequirements: { level: 10 },
          preview: 'Unlock at level 10',
        },
      ];
      setUnlockableContent(content);
    }
  }, [unlockableContent.length, player, setUnlockableContent]);

  const categories = ['all', 'location', 'vendor', 'recipe', 'ability', 'cosmetic', 'mode'];
  const filteredContent =
    selectedCategory === 'all'
      ? unlockableContent
      : unlockableContent.filter((c) => c.type === selectedCategory);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location':
        return MapPin;
      case 'vendor':
        return ShoppingCart;
      case 'recipe':
        return Hammer;
      case 'ability':
        return Sparkles;
      case 'cosmetic':
        return Sparkles;
      case 'mode':
        return Gamepad2;
      default:
        return Lock;
    }
  };

  const canUnlock = (content: typeof unlockableContent[0]) => {
    if (content.unlocked) return false;
    if (!player) return false;

    const req = content.unlockRequirements;
    if (req.level && player.level < req.level) return false;
    if (req.coins && player.coins < req.coins) return false;
    if (req.milestone) {
      const milestone = milestones.find((m) => m.id === req.milestone);
      if (!milestone || !milestone.completedAt) return false;
    }
    if (req.achievement) {
      // Check if achievement exists (simplified)
      return true; // Would check actual achievement
    }
    return true;
  };

  const handleUnlock = (contentId: string) => {
    const content = unlockableContent.find((c) => c.id === contentId);
    if (!content || !canUnlock(content)) {
      toast.error('Requirements not met!');
      return;
    }

    // Spend coins if required
    if (content.unlockRequirements.coins && player) {
      if (!spendCoins(content.unlockRequirements.coins)) {
        toast.error('Insufficient coins!');
        return;
      }
    }

    unlockContent(contentId);
    toast.success(`${content.name} unlocked!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
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
                  <Unlock className="w-8 h-8" />
                  Unlockable Content
                </h1>
                <p className="text-muted-foreground mt-2">Discover what you can unlock</p>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent.map((content) => {
                    const Icon = getTypeIcon(content.type);
                    const canUnlockContent = canUnlock(content);

                    return (
                      <Card
                        key={content.id}
                        className={`p-5 border-2 transition-all ${
                          content.unlocked
                            ? 'border-green-500 bg-green-500/10'
                            : canUnlockContent
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-muted opacity-60'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {content.unlocked ? (
                                <Unlock className="w-6 h-6 text-green-500" />
                              ) : (
                                <Lock className="w-6 h-6 text-muted-foreground" />
                              )}
                              <div>
                                <h3 className="text-lg font-semibold">{content.name}</h3>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {content.type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">{content.description}</p>

                          {!content.unlocked && (
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <p className="text-xs font-semibold">Requirements:</p>
                              <div className="space-y-1">
                                {content.unlockRequirements.level && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Target className="w-3 h-3" />
                                    <span>
                                      Level {content.unlockRequirements.level}
                                      {player && (
                                        <span className={player.level >= content.unlockRequirements.level ? 'text-green-500' : 'text-red-500'}>
                                          {' '}({player.level}/{content.unlockRequirements.level})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {content.unlockRequirements.coins && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Coins className="w-3 h-3" />
                                    <span>
                                      {content.unlockRequirements.coins} coins
                                      {player && (
                                        <span className={player.coins >= content.unlockRequirements.coins ? 'text-green-500' : 'text-red-500'}>
                                          {' '}({player.coins}/{content.unlockRequirements.coins})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {content.unlockRequirements.milestone && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Trophy className="w-3 h-3" />
                                    <span>Complete milestone</span>
                                  </div>
                                )}
                                {content.unlockRequirements.achievement && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Trophy className="w-3 h-3" />
                                    <span>Complete achievement</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {content.unlocked ? (
                            <Badge variant="secondary" className="w-full justify-center">
                              <Unlock className="w-3 h-3 mr-2" />
                              Unlocked
                            </Badge>
                          ) : canUnlockContent ? (
                            <Button
                              onClick={() => handleUnlock(content.id)}
                              className="w-full"
                              size="sm"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Unlock
                            </Button>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground">
                              Requirements not met
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

export default UnlocksPage;

