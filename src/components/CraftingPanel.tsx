import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Hammer, Coins, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
];

const CraftingPanel = () => {
  const { player, learnedRecipes, learnRecipe, spendCoins, addItem } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [craftingProgress, setCraftingProgress] = useState<Record<string, number>>({});

  if (!player) return null;

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Crafting</h3>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30">
          <span className="text-yellow-500 font-bold text-sm">🪙</span>
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
            {player.coins}
          </span>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredRecipes.map((recipe) => {
                const canCraftRecipe = canCraft(recipe);
                const progress = craftingProgress[recipe.id] || 0;
                const isCrafting = progress > 0 && progress < 100;

                return (
                  <Card key={recipe.id} className="p-4 border-2 border-border">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{recipe.name}</h4>
                          <p className="text-sm text-muted-foreground">{recipe.description}</p>
                        </div>
                        <Badge variant="outline">{recipe.category}</Badge>
                      </div>

                      {isCrafting && (
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">Crafting...</p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <p className="text-xs font-semibold mb-2">Materials Required:</p>
                        <div className="space-y-1">
                          {recipe.materials.map((mat) => {
                            const hasEnough = getMaterialCount(mat.itemId) >= mat.quantity;
                            return (
                              <div
                                key={mat.itemId}
                                className={`flex items-center justify-between text-sm ${
                                  hasEnough ? 'text-foreground' : 'text-red-500'
                                }`}
                              >
                                <span>
                                  {mat.name || mat.itemId} x{mat.quantity}
                                </span>
                                <span>
                                  {getMaterialCount(mat.itemId)}/{mat.quantity}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {recipe.coinCost && (
                        <div className="flex items-center gap-1 text-sm">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className={player.coins >= recipe.coinCost ? '' : 'text-red-500'}>
                            {recipe.coinCost} coins
                          </span>
                        </div>
                      )}

                      <Button
                        onClick={() => handleCraft(recipe)}
                        disabled={!canCraftRecipe || isCrafting}
                        className="w-full"
                        size="sm"
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
                        <div className="text-xs text-muted-foreground">
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
    </div>
  );
};

export default CraftingPanel;

