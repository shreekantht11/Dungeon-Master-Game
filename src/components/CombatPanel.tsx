import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sword, Shield, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';

const CombatPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; isPlayer: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { player, currentEnemy, damageEnemy, damagePlayer, endCombat, addItem, updatePlayer, updateGameState } = useGameStore();

  if (!player || !currentEnemy) return null;

  const handleAction = async (action: 'attack' | 'defend' | 'use-item' | 'run') => {
    // Prevent concurrent actions
    if (isProcessing) return;
    
    // Immediate UI feedback
    setIsProcessing(true);
    
    // Instant visual feedback - update UI immediately
    if (action === 'attack') {
      setCombatLog(prev => [...prev, `You prepare to attack ${currentEnemy.name}!`].slice(-5));
    } else if (action === 'defend') {
      setCombatLog(prev => [...prev, `You raise your guard!`].slice(-5));
    }
    if (action === 'run') {
      const success = Math.random() > 0.5;
      if (success) {
        toast({ title: 'Escaped!', description: 'You managed to flee from combat.' });
        endCombat();
        updateGameState({ isAfterCombat: true, storyPhase: 'exploration' });
      } else {
        toast({ title: 'Failed to escape!', description: 'The enemy blocks your path.' });
        handleEnemyAttack();
      }
      setIsProcessing(false);
      return;
    }

    try {
      const result = await api.processCombat({
        player,
        enemy: currentEnemy,
        action,
      });

      // Instant UI updates - no delays
      if (result.enemyDamage > 0) {
        setDamageNumbers(prev => [...prev, { id: Date.now(), value: result.enemyDamage, isPlayer: false }]);
        setTimeout(() => setDamageNumbers(prev => prev.slice(1)), 1000);
      }
      if (result.playerDamage > 0) {
        setDamageNumbers(prev => [...prev, { id: Date.now() + 1, value: result.playerDamage, isPlayer: true }]);
        setTimeout(() => setDamageNumbers(prev => prev.slice(1)), 1000);
      }

      // Update combat log instantly
      setCombatLog(prev => [...prev, ...result.combatLog].slice(-5));
      
      // Update health instantly
      damageEnemy(result.enemyDamage);
      damagePlayer(result.playerDamage);

      // Check victory/defeat
      if (result.victory || result.enemyHealth <= 0) {
        toast({
          title: 'Victory!',
          description: `You defeated ${currentEnemy.name}!`,
        });
        if (result.rewards) {
          updatePlayer({ xp: player.xp + result.rewards.xp });
          result.rewards.items.forEach(item => addItem(item));
        }
        const currentState = useGameStore.getState();
        updateGameState({ 
          isAfterCombat: true, 
          storyPhase: 'exploration',
          combatEncounters: (currentState.gameState.combatEncounters || 0) + 1
        });
        // End combat after brief delay for victory message
        setTimeout(() => {
          endCombat();
          setIsProcessing(false);
        }, 1000);
      } else if (result.defeat || result.playerHealth <= 0) {
        toast({
          title: 'Defeated...',
          description: 'You have fallen in battle.',
          variant: 'destructive',
        });
        setTimeout(() => {
          endCombat();
          setIsProcessing(false);
        }, 1000);
      } else {
        // Continue combat - allow next action immediately
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Combat action failed:', error);
      setIsProcessing(false);
    }
  };

  const handleEnemyAttack = () => {
    const damage = Math.floor(Math.random() * currentEnemy.attack) + 5;
    damagePlayer(damage);
    setCombatLog(prev => [...prev, `${currentEnemy.name} attacks for ${damage} damage!`].slice(-5));
  };

  const healthPercent = (player.health / player.maxHealth) * 100;
  const enemyHealthPercent = (currentEnemy.health / currentEnemy.maxHealth) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl bg-card border-2 border-primary rounded-xl p-6 space-y-6 relative">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">⚔️ Combat!</h2>
          <p className="text-muted-foreground">Battle against {currentEnemy.name}</p>
        </div>

        {/* Combat Arena */}
        <div className="grid grid-cols-2 gap-8 my-8 relative">
          {/* Player */}
          <div className="text-center space-y-4 relative">
            <motion.div
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-6xl"
            >
              🧙‍♂️
            </motion.div>
            <div>
              <p className="font-bold text-lg">{player.name}</p>
              <Progress value={healthPercent} className="h-3 mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {player.health}/{player.maxHealth} HP
              </p>
            </div>
            <AnimatePresence>
              {damageNumbers.filter(d => d.isPlayer).map(dmg => (
                <motion.div
                  key={dmg.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -50 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-destructive"
                >
                  -{dmg.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Enemy */}
          <div className="text-center space-y-4 relative">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-6xl"
            >
              👹
            </motion.div>
            <div>
              <p className="font-bold text-lg">{currentEnemy.name}</p>
              <Progress value={enemyHealthPercent} className="h-3 mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {currentEnemy.health}/{currentEnemy.maxHealth} HP
              </p>
            </div>
            <AnimatePresence>
              {damageNumbers.filter(d => !d.isPlayer).map(dmg => (
                <motion.div
                  key={dmg.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -50 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-primary"
                >
                  -{dmg.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Combat Log */}
        <div className="bg-muted/50 rounded-lg p-4 h-24 overflow-y-auto">
          {combatLog.map((log, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-muted-foreground"
            >
              {log}
            </motion.p>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            onClick={() => handleAction('attack')} 
            className="gap-2"
            disabled={isProcessing}
          >
            <Sword className="w-4 h-4" />
            {t('actions.attack')}
          </Button>
          <Button 
            onClick={() => handleAction('defend')} 
            variant="secondary" 
            className="gap-2"
            disabled={isProcessing}
          >
            <Shield className="w-4 h-4" />
            {t('actions.defend')}
          </Button>
          <Button 
            onClick={() => handleAction('use-item')} 
            variant="outline" 
            className="gap-2"
            disabled={isProcessing}
          >
            <Heart className="w-4 h-4" />
            {t('actions.useItem')}
          </Button>
          <Button 
            onClick={() => handleAction('run')} 
            variant="destructive" 
            className="gap-2"
            disabled={isProcessing}
          >
            <Sparkles className="w-4 h-4" />
            {t('actions.run')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CombatPanel;
