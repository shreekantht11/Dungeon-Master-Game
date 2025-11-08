import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Zap, Heart, Star, TrendingUp, Lock, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAbilitiesForClass, canUnlockAbility, initializeAbilitiesForClass } from '@/utils/abilities';
import { toast } from 'sonner';

const CharacterSheet = () => {
  const { t } = useTranslation();
  const player = useGameStore((state) => state.player);
  const unlockAbility = useGameStore((state) => state.unlockAbility);
  const upgradeAbility = useGameStore((state) => state.upgradeAbility);
  const updatePlayer = useGameStore((state) => state.updatePlayer);

  if (!player) return null;

  const healthPercent = (player.health / player.maxHealth) * 100;
  const xpPercent = (player.xp / player.maxXp) * 100;

  // Initialize abilities if not already done
  if (Object.keys(player.abilities || {}).length === 0) {
    const initialAbilities = initializeAbilitiesForClass(player.class, player.level);
    updatePlayer({ abilities: initialAbilities });
  }

  const handleUnlockAbility = (abilityId: string) => {
    if (!canUnlockAbility(abilityId, player.level)) {
      toast.error('You need to reach a higher level to unlock this ability');
      return;
    }
    
    const classAbilities = getAbilitiesForClass(player.class);
    const abilityDef = classAbilities.find(a => a.id === abilityId);
    if (!abilityDef) return;
    
    const newAbilities = {
      ...player.abilities,
      [abilityId]: {
        ...abilityDef,
        level: 1,
      },
    };
    
    updatePlayer({ abilities: newAbilities });
    unlockAbility(abilityId);
    toast.success(`Unlocked: ${abilityDef.name}!`);
  };

  const handleUpgradeAbility = (abilityId: string) => {
    const ability = player.abilities[abilityId];
    if (!ability) return;
    
    if (ability.level >= ability.maxLevel) {
      toast.error('This ability is already at maximum level');
      return;
    }
    
    const upgradeCost = ability.level * 100; // XP cost increases per level
    if (player.xp < upgradeCost) {
      toast.error(`Not enough XP! Need ${upgradeCost} XP to upgrade.`);
      return;
    }
    
    upgradeAbility(abilityId);
    updatePlayer({ xp: player.xp - upgradeCost });
    toast.success(`${ability.name} upgraded to level ${ability.level + 1}!`);
  };

  const classAbilities = getAbilitiesForClass(player.class);

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Character Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-4xl">
            {player.class === 'Warrior' ? '⚔️' : player.class === 'Mage' ? '🧙' : '🗡️'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge>{player.class}</Badge>
              <Badge variant="outline">Level {player.level}</Badge>
              <Badge variant="secondary">{player.gender}</Badge>
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* Health & XP */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Heart className="w-4 h-4 text-destructive" />
                Health
              </span>
              <span className="text-sm text-muted-foreground">
                {player.health}/{player.maxHealth}
              </span>
            </div>
            <Progress value={healthPercent} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                Experience
              </span>
              <span className="text-sm text-muted-foreground">
                {player.xp}/{player.maxXp}
              </span>
            </div>
            <Progress value={xpPercent} className="h-3" />
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Character Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Sword className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-foreground">{player.stats.strength}</p>
              <p className="text-xs text-muted-foreground">Strength</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{player.stats.intelligence}</p>
              <p className="text-xs text-muted-foreground">Intelligence</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold text-foreground">{player.stats.agility}</p>
              <p className="text-xs text-muted-foreground">Agility</p>
            </motion.div>
          </div>
        </div>

        <Separator />

        {/* Equipment */}
        <div>
          <h3 className="font-semibold mb-3">Equipment</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Weapon', 'Armor', 'Helmet', 'Boots'].map((slot) => (
              <div
                key={slot}
                className="bg-muted/50 border border-dashed border-border rounded-lg p-4 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">{slot}</p>
                <p className="text-sm">Empty</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Abilities */}
        <div>
          <h3 className="font-semibold mb-3">Class Abilities</h3>
          <div className="space-y-2">
            {classAbilities.map((abilityDef) => {
              const ability = player.abilities[abilityDef.id];
              const isUnlocked = !!ability;
              const canUnlock = canUnlockAbility(abilityDef.id, player.level);
              const isLocked = !isUnlocked && !canUnlock;
              
              return (
                <AbilityCard
                  key={abilityDef.id}
                  name={abilityDef.name}
                  description={abilityDef.description}
                  level={ability?.level || 0}
                  maxLevel={abilityDef.maxLevel}
                  unlockedAt={abilityDef.unlockedAt}
                  cooldown={abilityDef.cooldown}
                  manaCost={abilityDef.manaCost}
                  effect={abilityDef.effect}
                  locked={isLocked}
                  canUnlock={!isUnlocked && canUnlock}
                  onUnlock={() => handleUnlockAbility(abilityDef.id)}
                  onUpgrade={() => handleUpgradeAbility(abilityDef.id)}
                  upgradeCost={ability ? ability.level * 100 : 0}
                  playerXp={player.xp}
                />
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

interface AbilityCardProps {
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlockedAt: number;
  cooldown?: number;
  manaCost?: number;
  effect: string;
  locked: boolean;
  canUnlock: boolean;
  onUnlock: () => void;
  onUpgrade: () => void;
  upgradeCost: number;
  playerXp: number;
}

const AbilityCard = ({
  name,
  description,
  level,
  maxLevel,
  unlockedAt,
  cooldown,
  manaCost,
  effect,
  locked,
  canUnlock,
  onUnlock,
  onUpgrade,
  upgradeCost,
  playerXp,
}: AbilityCardProps) => {
  const isMaxLevel = level >= maxLevel;
  const canAffordUpgrade = playerXp >= upgradeCost;

  return (
    <div className={`bg-card border border-border rounded-lg p-3 ${locked ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm">{name}</p>
            {level > 0 && (
              <Badge variant="secondary" className="text-xs">
                Lv {level}/{maxLevel}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">{description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {cooldown && <span>Cooldown: {cooldown} turns</span>}
            {manaCost && <span>Mana: {manaCost}</span>}
            {effect && <span className="text-primary">Effect: {effect}</span>}
          </div>
          {locked && (
            <p className="text-xs text-muted-foreground mt-1">
              Unlocks at level {unlockedAt}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {locked ? (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          ) : canUnlock ? (
            <Button size="sm" variant="outline" onClick={onUnlock} className="text-xs">
              Unlock
            </Button>
          ) : (
            <>
              {!isMaxLevel && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={onUpgrade}
                  disabled={!canAffordUpgrade}
                  className="text-xs"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  Upgrade ({upgradeCost} XP)
                </Button>
              )}
              {isMaxLevel && (
                <Badge variant="default" className="text-xs">
                  Max Level
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
