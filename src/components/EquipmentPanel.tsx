import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sword, Shield, HardHat, Footprints, Gem, Sparkles, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const slotIcons = {
  weapon: Sword,
  armor: Shield,
  helmet: HardHat,
  boots: Footprints,
  ring: Gem,
  amulet: Sparkles,
};

const slotLabels = {
  weapon: 'Weapon',
  armor: 'Armor',
  helmet: 'Helmet',
  boots: 'Boots',
  ring: 'Ring',
  amulet: 'Amulet',
};

const EquipmentPanel = () => {
  const { player, equipItem, unequipItem, getEffectiveStats } = useGameStore();

  if (!player) return null;

  const effectiveStats = getEffectiveStats();
  const baseStats = {
    attack: player.stats.strength * 2 + player.stats.agility,
    defense: player.stats.strength + player.stats.agility,
    health: player.maxHealth,
  };

  const handleEquip = (itemId: string, slot: string) => {
    equipItem(itemId, slot);
  };

  const handleUnequip = (slot: string) => {
    unequipItem(slot);
  };

  const getEquippedItem = (slot: string) => {
    const itemId = player.equippedItems[slot];
    if (!itemId) return null;
    return player.inventory.find((i) => i.id === itemId) || null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3 text-lg">Equipment</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(slotIcons).map((slot) => {
            const Icon = slotIcons[slot as keyof typeof slotIcons];
            const equippedItem = getEquippedItem(slot);
            
            return (
              <Card
                key={slot}
                className={`p-3 border-2 transition-all ${
                  equippedItem
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/50 bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-2 rounded-lg ${
                    equippedItem ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      equippedItem ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {slotLabels[slot as keyof typeof slotLabels]}
                      </span>
                      {equippedItem && (
                        <Badge variant="secondary" className="text-xs">
                          Equipped
                        </Badge>
                      )}
                    </div>
                    {equippedItem ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold truncate">
                          {equippedItem.name}
                        </p>
                        {equippedItem.statBonuses && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(equippedItem.statBonuses as Record<string, number>).map(([stat, value]) => (
                              value ? (
                                <span key={stat} className="text-xs text-primary flex items-center gap-0.5">
                                  <ArrowUp className="w-3 h-3" />
                                  {stat}: +{value}
                                </span>
                              ) : null
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs h-7"
                          onClick={() => handleUnequip(slot)}
                        >
                          Unequip
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3 text-lg">Stats Comparison</h3>
        <div className="space-y-2">
          {effectiveStats && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Attack</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{baseStats.attack}</span>
                  <ArrowUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {effectiveStats.attack}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Defense</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{baseStats.defense}</span>
                  <ArrowUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {effectiveStats.defense}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Health</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{baseStats.health}</span>
                  {effectiveStats.health > baseStats.health && (
                    <>
                      <ArrowUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {effectiveStats.health}
                      </span>
                    </>
                  )}
                  {effectiveStats.health === baseStats.health && (
                    <span className="text-sm">{effectiveStats.health}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel;

