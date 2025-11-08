import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Hammer, Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'potion' | 'consumable' | 'material';
  materials: { itemId: string; quantity: number; name?: string }[];
  result: { itemId: string; name: string; quantity: number };
  levelRequirement: number;
  coinCost?: number;
  statBonuses?: Record<string, number>;
}

const defaultRecipes: Recipe[] = [
  {
    id: 'recipe_health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    category: 'potion',
    materials: [
      { itemId: 'material_herb', quantity: 2, name: 'Herb' },
      { itemId: 'material_water', quantity: 1, name: 'Water' },
    ],
    result: { itemId: 'potion_health', name: 'Health Potion', quantity: 1 },
    levelRequirement: 1,
    coinCost: 10,
  },
  {
    id: 'recipe_iron_sword',
    name: 'Iron Sword',
    description: 'A sturdy iron blade',
    category: 'weapon',
    materials: [
      { itemId: 'material_iron', quantity: 3, name: 'Iron Ore' },
      { itemId: 'material_coal', quantity: 2, name: 'Coal' },
    ],
    result: { itemId: 'weapon_iron_sword', name: 'Iron Sword', quantity: 1 },
    levelRequirement: 3,
    coinCost: 50,
    statBonuses: { attack: 5 },
  },
  {
    id: 'recipe_leather_armor',
    name: 'Leather Armor',
    description: 'Basic protective gear',
    category: 'armor',
    materials: [
      { itemId: 'material_leather', quantity: 4, name: 'Leather' },
      { itemId: 'material_thread', quantity: 2, name: 'Thread' },
    ],
    result: { itemId: 'armor_leather', name: 'Leather Armor', quantity: 1 },
    levelRequirement: 2,
    coinCost: 30,
    statBonuses: { defense: 3 },
  },
  {
    id: 'recipe_mana_potion',
    name: 'Mana Potion',
    description: 'Restores 30 MP',
    category: 'potion',
    materials: [
      { itemId: 'material_herb', quantity: 1, name: 'Herb' },
      { itemId: 'material_crystal', quantity: 1, name: 'Crystal' },
    ],
    result: { itemId: 'potion_mana', name: 'Mana Potion', quantity: 1 },
    levelRequirement: 2,
    coinCost: 15,
  },
];

const CraftingPage = () => {
  const { player, learnedRecipes, learnRecipe, spendCoins, addItem, setScreen } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [craftingProgress, setCraftingProgress] = useState<Record<string, number>>({});

  if (!player) {
    setScreen('game');
    return null;
  }

  const availableRecipes = defaultRecipes.filter((recipe) =>
    learnedRecipes.includes(recipe.id) || recipe.levelRequirement <= player.level
  );

  const getMaterialCount = (itemId: string) => {
    const item = player.inventory.find((i) => i.id === itemId);
    return item?.quantity || 0;
  };

  const canCraft = (recipe: Recipe) => {
    if (recipe.levelRequirement > player.level) return false;
    if (recipe.coinCost && player.coins < recipe.coinCost) return false;
    return recipe.materials.every((mat) => getMaterialCount(mat.itemId) >= mat.quantity);
  };

  const handleCraft = async (recipe: Recipe) => {
    if (!canCraft(recipe)) {
      toast.error('Cannot craft this item!');
      return;
    }

    // Spend coins if required
    if (recipe.coinCost && !spendCoins(recipe.coinCost)) {
      toast.error('Insufficient coins!');
      return;
    }

    // Start crafting animation
    setCraftingProgress({ [recipe.id]: 0 });
    
    // Simulate crafting time
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setCraftingProgress((prev) => ({ ...prev, [recipe.id]: i }));
    }

    // Remove materials
    let newInventory = [...player.inventory];
    recipe.materials.forEach((mat) => {
      newInventory = newInventory
        .map((item) =>
          item.id === mat.itemId
            ? { ...item, quantity: item.quantity - mat.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
    });

    // Add result
    addItem({
      id: recipe.result.itemId,
      name: recipe.result.name,
      type: recipe.category === 'weapon' ? 'weapon' : recipe.category === 'armor' ? 'armor' : 'potion',
      quantity: recipe.result.quantity,
      statBonuses: recipe.statBonuses,
      slot: recipe.category === 'weapon' ? 'weapon' : recipe.category === 'armor' ? 'armor' : undefined,
    });

    // Learn recipe if not learned
    if (!learnedRecipes.includes(recipe.id)) {
      learnRecipe(recipe.id);
    }

    useGameStore.setState({
      player: {
        ...player,
        inventory: newInventory,
      },
    });

    setCraftingProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[recipe.id];
      return newProgress;
    });

    toast.success(`Crafted ${recipe.result.name}!`);
  };

  const categories = ['all', 'weapon', 'armor', 'potion', 'consumable', 'material'];
  const filteredRecipes =
    selectedCategory === 'all'
      ? availableRecipes
      : availableRecipes.filter((r) => r.category === selectedCategory);

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
                  <Hammer className="w-8 h-8" />
                  Crafting Station
                </h1>
                <p className="text-muted-foreground mt-2">Create powerful items from materials</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-4 py-2 rounded-md bg-yellow-500/20 border border-yellow-500/30">
              <span className="text-yellow-500 font-bold text-lg">🪙</span>
              <span className="font-bold text-xl text-yellow-600 dark:text-yellow-400">
                {player.coins}
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecipes.map((recipe) => {
                    const canCraftRecipe = canCraft(recipe);
                    const progress = craftingProgress[recipe.id] || 0;
                    const isCrafting = progress > 0 && progress < 100;

                    return (
                      <Card key={recipe.id} className="p-5 border-2 border-border">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{recipe.name}</h4>
                              <p className="text-sm text-muted-foreground">{recipe.description}</p>
                            </div>
                            <Badge variant="outline">{recipe.category}</Badge>
                          </div>

                          {isCrafting && (
                            <div className="space-y-2">
                              <Progress value={progress} className="h-3" />
                              <p className="text-xs text-muted-foreground text-center">Crafting...</p>
                            </div>
                          )}

                          <Separator />

                          <div>
                            <p className="text-sm font-semibold mb-2">Materials Required:</p>
                            <div className="space-y-2">
                              {recipe.materials.map((mat) => {
                                const hasEnough = getMaterialCount(mat.itemId) >= mat.quantity;
                                return (
                                  <div
                                    key={mat.itemId}
                                    className={`flex items-center justify-between text-sm p-2 rounded ${
                                      hasEnough ? 'bg-green-500/10' : 'bg-red-500/10'
                                    }`}
                                  >
                                    <span className={hasEnough ? '' : 'text-red-500'}>
                                      {mat.name || mat.itemId} x{mat.quantity}
                                    </span>
                                    <span className={hasEnough ? 'text-green-500' : 'text-red-500'}>
                                      {getMaterialCount(mat.itemId)}/{mat.quantity}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {recipe.coinCost && (
                            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className={player.coins >= recipe.coinCost ? '' : 'text-red-500'}>
                                {recipe.coinCost} coins
                              </span>
                            </div>
                          )}

                          {recipe.statBonuses && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(recipe.statBonuses).map(([stat, value]) => (
                                <Badge key={stat} variant="secondary" className="text-xs">
                                  +{value} {stat}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Button
                            onClick={() => handleCraft(recipe)}
                            disabled={!canCraftRecipe || isCrafting}
                            className="w-full"
                            size="lg"
                          >
                            {isCrafting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Crafting...
                              </>
                            ) : (
                              <>
                                <Hammer className="w-4 h-4 mr-2" />
                                Craft
                              </>
                            )}
                          </Button>

                          {!canCraftRecipe && (
                            <div className="text-xs text-muted-foreground text-center">
                              {recipe.levelRequirement > player.level && (
                                <p>Requires level {recipe.levelRequirement}</p>
                              )}
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

export default CraftingPage;

