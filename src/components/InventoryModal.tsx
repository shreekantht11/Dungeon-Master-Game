import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Package, Sword, Shield, Droplet, Key } from 'lucide-react';
import { toast } from 'sonner';
import { getWeaponSymbol } from '@/utils/weaponSymbols';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const itemIcons = {
  weapon: Sword,
  armor: Shield,
  potion: Droplet,
  key: Key,
  quest: Package,
};

const InventoryModal = ({ isOpen, onClose }: InventoryModalProps) => {
  const { player, useItem, equipItem } = useGameStore();
  const equippedItems = player?.equippedItems || {};

  const handleUseItem = (itemId: string, itemName: string) => {
    useItem(itemId);
    toast.success(`Used ${itemName}!`);
  };

  const handleEquip = (itemId: string, slot: string) => {
    equipItem(itemId, slot);
    toast.success('Item equipped!');
  };

  const isEquipped = (itemId: string) => {
    return Object.values(equippedItems || {}).includes(itemId);
  };

  const inventory = player?.inventory || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-x-[20%] md:inset-y-12 z-50 flex items-center justify-center"
          >
            <Card className="w-full h-full panel-glow bg-card/98 backdrop-blur-md border-2 border-primary/40 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/30">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-3xl font-fantasy gold-shimmer">
                      Inventory
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {inventory.length} items
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {inventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Package className="w-20 h-20 text-muted-foreground/30 mb-4" />
                    <p className="text-xl text-muted-foreground font-elegant">
                      Your inventory is empty
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Collect items during your adventure
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item, index) => {
                      const Icon = itemIcons[item.type] || Package;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 bg-muted/30 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {getWeaponSymbol(item.name, item.type) && (
                                      <span className="text-2xl">{getWeaponSymbol(item.name, item.type)}</span>
                                    )}
                                    {item.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary">
                                  ×{item.quantity}
                                </span>
                              </div>
                            </div>

                            {item.effect && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {item.effect}
                              </p>
                            )}

                            {item.statBonuses && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {Object.entries(item.statBonuses).map(([stat, value]: [string, any]) => (
                                  value ? (
                                    <Badge key={stat} variant="secondary" className="text-xs">
                                      +{value} {stat}
                                    </Badge>
                                  ) : null
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              {item.type === 'potion' && (
                                <Button
                                  onClick={() => handleUseItem(item.id, item.name)}
                                  className="flex-1 bg-primary/20 hover:bg-primary/30 border border-primary/40"
                                  variant="outline"
                                >
                                  Use Item
                                </Button>
                              )}
                              {item.slot && (
                                <Button
                                  onClick={() => handleEquip(item.id, item.slot!)}
                                  className="flex-1"
                                  variant={isEquipped(item.id) ? "default" : "outline"}
                                  disabled={isEquipped(item.id)}
                                >
                                  {isEquipped(item.id) ? 'Equipped' : 'Equip'}
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer Stats */}
              {player && (
                <div className="p-4 border-t border-border flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'weapon').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Weapons</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'armor').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Armor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'potion').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Potions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'key').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Keys</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InventoryModal;
