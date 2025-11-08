import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Package, CheckCircle2, Gift, Coins, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CollectionsPage = () => {
  const {
    player,
    collectionSets,
    setCollectionSets,
    updateCollection,
    codex,
    unlockedEndings,
    setScreen,
    addCoins,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('sets');

  useEffect(() => {
    // Initialize collection sets if empty
    if (collectionSets.length === 0 && player) {
      const sets = [
        {
          id: 'set_warrior',
          name: "Warrior's Set",
          description: 'Complete set of warrior equipment',
          items: ['weapon_iron_sword', 'armor_leather', 'helmet_iron', 'boots_leather', 'ring_warrior'],
          collected: 0,
          reward: {
            coins: 500,
            statBonus: { attack: 10, defense: 10 },
          },
          completed: false,
        },
        {
          id: 'set_mage',
          name: "Mage's Set",
          description: 'Complete set of mage equipment',
          items: ['weapon_staff', 'armor_robe', 'helmet_hood', 'boots_mage', 'ring_mage'],
          collected: 0,
          reward: {
            coins: 500,
            statBonus: { intelligence: 15, health: 20 },
          },
          completed: false,
        },
        {
          id: 'set_rogue',
          name: "Rogue's Set",
          description: 'Complete set of rogue equipment',
          items: ['weapon_dagger', 'armor_leather', 'helmet_mask', 'boots_stealth', 'ring_rogue'],
          collected: 0,
          reward: {
            coins: 500,
            statBonus: { agility: 15, attack: 5 },
          },
          completed: false,
        },
        {
          id: 'collection_common',
          name: 'Common Items',
          description: 'Collect all common rarity items',
          items: Array(20).fill(0).map((_, i) => `item_common_${i + 1}`),
          collected: 0,
          reward: { coins: 200 },
          completed: false,
        },
        {
          id: 'collection_rare',
          name: 'Rare Items',
          description: 'Collect all rare rarity items',
          items: Array(10).fill(0).map((_, i) => `item_rare_${i + 1}`),
          collected: 0,
          reward: { coins: 1000 },
          completed: false,
        },
      ];
      setCollectionSets(sets);
    }
  }, [collectionSets.length, player, setCollectionSets]);

  const handleClaimReward = (setId: string) => {
    const set = collectionSets.find((s) => s.id === setId);
    if (!set || !set.completed) return;

    if (set.reward.coins) {
      addCoins(set.reward.coins);
    }
    toast.success(`Collection reward claimed! +${set.reward.coins} coins`);
  };

  const categories = ['sets', 'rarities', 'locations', 'enemies', 'endings'];
  const filteredSets =
    selectedCategory === 'sets'
      ? collectionSets.filter((s) => s.id.includes('set_'))
      : selectedCategory === 'rarities'
      ? collectionSets.filter((s) => s.id.includes('collection_'))
      : [];

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
                  <Package className="w-8 h-8" />
                  Collections
                </h1>
                <p className="text-muted-foreground mt-2">Complete sets and unlock rewards</p>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSets.map((set) => {
                    const progress = (set.collected / set.items.length) * 100;
                    const isCompleted = set.completed;

                    return (
                      <Card
                        key={set.id}
                        className={`p-5 border-2 transition-all ${
                          isCompleted
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {set.name}
                                {isCompleted && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">{set.description}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {set.collected} / {set.items.length}
                              </span>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>

                          {set.reward.statBonus && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-semibold mb-2">Set Bonus:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(set.reward.statBonus).map(([stat, value]) => (
                                  <Badge key={stat} variant="secondary" className="text-xs">
                                    +{value} {stat}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs font-semibold mb-2">Rewards:</p>
                            <div className="flex items-center gap-2">
                              {set.reward.coins && (
                                <div className="flex items-center gap-1">
                                  <Coins className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm font-semibold">{set.reward.coins} coins</span>
                                </div>
                              )}
                              {set.reward.unlock && (
                                <Badge variant="outline" className="text-xs">
                                  Unlock: {set.reward.unlock}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {isCompleted && (
                            <Button
                              onClick={() => handleClaimReward(set.id)}
                              className="w-full"
                              size="lg"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Claim Reward
                            </Button>
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

export default CollectionsPage;

