import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Coins, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface VendorItem {
  id: string;
  name: string;
  type: string;
  price: number;
  statBonuses?: Record<string, number>;
  rarity?: string;
  levelRequirement?: number;
  stock?: number;
}

interface Vendor {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'general' | 'special';
  inventory: VendorItem[];
  reputation?: number;
}

const ShopPage = () => {
  const { player, spendCoins, addCoins, addItem, vendorReputation, setVendorReputation, setScreen } = useGameStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  if (!player) {
    setScreen('game');
    return null;
  }

  // Default vendor data
  const vendor: Vendor = {
    id: 'vendor_1',
    name: 'General Store',
    type: 'general',
    inventory: [
      {
        id: 'weapon_iron_sword',
        name: 'Iron Sword',
        type: 'weapon',
        price: 100,
        statBonuses: { attack: 5 },
        rarity: 'common',
        levelRequirement: 2,
        slot: 'weapon',
      },
      {
        id: 'armor_leather',
        name: 'Leather Armor',
        type: 'armor',
        price: 80,
        statBonuses: { defense: 3 },
        rarity: 'common',
        slot: 'armor',
      },
      {
        id: 'helmet_iron',
        name: 'Iron Helmet',
        type: 'armor',
        price: 60,
        statBonuses: { defense: 2, health: 10 },
        rarity: 'common',
        slot: 'helmet',
      },
      {
        id: 'boots_leather',
        name: 'Leather Boots',
        type: 'armor',
        price: 50,
        statBonuses: { agility: 2 },
        rarity: 'common',
        slot: 'boots',
      },
      {
        id: 'potion_health',
        name: 'Health Potion',
        type: 'potion',
        price: 20,
      },
      {
        id: 'potion_mana',
        name: 'Mana Potion',
        type: 'potion',
        price: 25,
      },
    ],
  };

  const reputation = vendorReputation[vendor.id] || 0;
  const reputationDiscount = Math.min(reputation / 100, 0.2); // Max 20% discount
  const playerItems = player.inventory.filter((item) => item.type === 'weapon' || item.type === 'armor' || item.type === 'potion');

  const calculatePrice = (basePrice: number) => {
    return Math.floor(basePrice * (1 - reputationDiscount));
  };

  const handleBuy = (item: VendorItem) => {
    const finalPrice = calculatePrice(item.price);
    if (player.coins < finalPrice) {
      toast.error('Insufficient coins!');
      return;
    }

    if (spendCoins(finalPrice)) {
      addItem({
        id: item.id,
        name: item.name,
        type: item.type as any,
        quantity: 1,
        statBonuses: item.statBonuses,
        rarity: item.rarity as any,
        levelRequirement: item.levelRequirement,
        price: item.price,
        slot: (item as any).slot,
      });

      // Increase reputation
      const newReputation = Math.min(reputation + 1, 100);
      setVendorReputation(vendor.id, newReputation);

      toast.success(`Purchased ${item.name} for ${finalPrice} coins!`);
    }
  };

  const handleSell = (item: any) => {
    const sellPrice = Math.floor((item.price || 50) * 0.6); // 60% of base price
    addCoins(sellPrice);
    
    // Remove item from inventory
    const newInventory = player.inventory
      .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    
    useGameStore.setState({
      player: {
        ...player,
        inventory: newInventory,
      },
    });

    // Small reputation increase for selling
    const newReputation = Math.min(reputation + 0.5, 100);
    setVendorReputation(vendor.id, newReputation);

    toast.success(`Sold ${item.name} for ${sellPrice} coins!`);
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'rare': return 'text-blue-500 border-blue-500';
      case 'uncommon': return 'text-green-500 border-green-500';
      default: return 'text-gray-500 border-gray-500';
    }
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
                  <ShoppingCart className="w-8 h-8" />
                  {vendor.name}
                </h1>
                <Badge variant="outline" className="mt-2">
                  {vendor.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Coin Balance & Reputation */}
          <Card className="p-4 bg-muted/50 border-2 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-4 py-2 rounded-md bg-yellow-500/20 border border-yellow-500/30">
                  <span className="text-yellow-500 font-bold text-lg">🪙</span>
                  <span className="font-bold text-xl text-yellow-600 dark:text-yellow-400">
                    {player.coins}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">Reputation: {reputation}/100</span>
                {reputationDiscount > 0 && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {Math.floor(reputationDiscount * 100)}% Discount
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Buy/Sell Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="buy" className="text-lg">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="text-lg">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="mt-4">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendor.inventory.map((item) => {
                    const finalPrice = calculatePrice(item.price);
                    const canAfford = player.coins >= finalPrice;
                    const canUse = !item.levelRequirement || player.level >= item.levelRequirement;

                    return (
                      <Card
                        key={item.id}
                        className={`p-5 border-2 transition-all ${
                          canAfford && canUse
                            ? 'border-primary/30 hover:border-primary cursor-pointer'
                            : 'border-muted opacity-60'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              {item.rarity && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs mt-2 ${getRarityColor(item.rarity)}`}
                                >
                                  {item.rarity}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {item.statBonuses && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.statBonuses).map(([stat, value]) => (
                                <Badge key={stat} variant="secondary" className="text-xs">
                                  +{value} {stat}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="w-5 h-5 text-yellow-500" />
                              <span className={`font-bold text-lg ${canAfford ? 'text-yellow-600' : 'text-red-500'}`}>
                                {finalPrice}
                              </span>
                              {reputationDiscount > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {item.price}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleBuy(item)}
                              disabled={!canAfford || !canUse}
                              className="text-sm"
                            >
                              Buy
                            </Button>
                          </div>

                          {!canAfford && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                              <AlertCircle className="w-4 h-4" />
                              Insufficient coins
                            </div>
                          )}
                          {!canUse && item.levelRequirement && (
                            <div className="flex items-center gap-1 text-sm text-orange-500">
                              <AlertCircle className="w-4 h-4" />
                              Requires level {item.levelRequirement}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sell" className="mt-4">
              <ScrollArea className="h-[calc(100vh-400px)]">
                {playerItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No items to sell</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playerItems.map((item) => {
                      const sellPrice = Math.floor((item.price || 50) * 0.6);

                      return (
                        <Card key={item.id} className="p-5 border-2 border-border hover:border-primary/50 transition-all">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>

                            {item.statBonuses && (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(item.statBonuses).map(([stat, value]: [string, any]) => (
                                  <Badge key={stat} variant="secondary" className="text-xs">
                                    +{value} {stat}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-lg text-yellow-600">{sellPrice}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSell(item)}
                                className="text-sm"
                              >
                                Sell
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopPage;

