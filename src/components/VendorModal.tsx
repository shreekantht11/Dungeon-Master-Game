import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Coins, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

const VendorModal = ({ open, onClose, vendor }: VendorModalProps) => {
  const { player, spendCoins, addCoins, addItem, vendorReputation, setVendorReputation } = useGameStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  if (!player || !vendor) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            {vendor.name}
            <Badge variant="outline" className="ml-2">
              {vendor.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coin Balance & Reputation */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30">
                <span className="text-yellow-500 font-bold">🪙</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">
                  {player.coins}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm">Reputation: {reputation}/100</span>
              {reputationDiscount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {Math.floor(reputationDiscount * 100)}% Discount
                </Badge>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-3">
                  {vendor.inventory.map((item) => {
                    const finalPrice = calculatePrice(item.price);
                    const canAfford = player.coins >= finalPrice;
                    const canUse = !item.levelRequirement || player.level >= item.levelRequirement;

                    return (
                      <Card
                        key={item.id}
                        className={`p-4 border-2 transition-all ${
                          canAfford && canUse
                            ? 'border-primary/30 hover:border-primary cursor-pointer'
                            : 'border-muted opacity-60'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                              {item.rarity && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs mt-1 ${getRarityColor(item.rarity)}`}
                                >
                                  {item.rarity}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {item.statBonuses && (
                            <div className="flex flex-wrap gap-1 text-xs">
                              {Object.entries(item.statBonuses).map(([stat, value]) => (
                                <Badge key={stat} variant="secondary" className="text-xs">
                                  +{value} {stat}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className={`font-bold ${canAfford ? 'text-yellow-600' : 'text-red-500'}`}>
                                {finalPrice}
                              </span>
                              {reputationDiscount > 0 && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {item.price}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleBuy(item)}
                              disabled={!canAfford || !canUse}
                              className="text-xs"
                            >
                              Buy
                            </Button>
                          </div>

                          {!canAfford && (
                            <div className="flex items-center gap-1 text-xs text-red-500">
                              <AlertCircle className="w-3 h-3" />
                              Insufficient coins
                            </div>
                          )}
                          {!canUse && item.levelRequirement && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <AlertCircle className="w-3 h-3" />
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
              <ScrollArea className="h-[400px]">
                {playerItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items to sell
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {playerItems.map((item) => {
                      const sellPrice = Math.floor((item.price || 50) * 0.6);

                      return (
                        <Card key={item.id} className="p-4 border-2 border-border hover:border-primary/50 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span className="font-bold text-yellow-600">{sellPrice}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSell(item)}
                                className="text-xs"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorModal;

