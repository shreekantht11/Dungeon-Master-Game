import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Shield, Heart, Sparkles, Zap, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { Item, Badge } from '@/store/gameStore';
import { toast as sonnerToast } from 'sonner';

const CombatPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [combatLog, setCombatLog] = useState<{ id: number; text: string; timestamp: number }[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; isPlayer: boolean; x: number; y: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);

  const { 
    player, 
    currentEnemy, 
    damageEnemy, 
    damagePlayer, 
    endCombat, 
    addItem, 
    updatePlayer, 
    updateGameState, 
    useItem,
    storyLog,
    genre,
    updateStory,
    setPlayerChoices,
    addStoryEvent,
    setBadges,
    unlockBadges,
    setCameos,
  } = useGameStore();
  
  // Get weapons from inventory
  const weapons = player?.inventory.filter(item => item.type === 'weapon') || [];

  if (!player || !currentEnemy) return null;

  const continueStoryAfterCombat = async () => {
    if (!player || !genre) return;
    
    try {
      const currentState = useGameStore.getState();
      const activeQuest = currentState.activeQuests.length > 0 ? currentState.activeQuests[0] : null;
      const request = {
        player,
        genre: genre || 'Fantasy',
        previousEvents: storyLog || [],
        choice: undefined,
        gameState: {
          turnCount: currentState.gameState.turnCount,
          storyPhase: 'exploration',
          combatEncounters: currentState.gameState.combatEncounters || 0,
          isAfterCombat: true,
          isFinalPhase: currentState.gameState.isFinalPhase,
          badges: currentState.badges,
          cameos: currentState.cameos,
        },
        activeQuest: activeQuest,
      };

      const res = await api.generateStory(request as any);

      if (res.story) {
        updateStory(res.story);
        addStoryEvent({ text: res.story, type: 'story' });
      }

      if (res.choices && Array.isArray(res.choices)) {
        setPlayerChoices(res.choices);
      }

      updateGameState({
        isAfterCombat: false,
        storyPhase: res.storyPhase || 'exploration',
      });

      if (Array.isArray(res.unlockedBadges) && res.unlockedBadges.length > 0) {
        const newlyUnlocked = res.unlockedBadges as Badge[];
        unlockBadges(newlyUnlocked);
        newlyUnlocked.forEach((badge) => {
          sonnerToast.success(`🏅 ${badge.title}`, {
            description: badge.description,
          });
        });
      }

      if (Array.isArray(res.badges)) {
        setBadges(res.badges as Badge[]);
      }

      if (Array.isArray((res as any).cameos)) {
        setCameos((res as any).cameos as any);
      }

      // Auto-save after resuming story from combat
      try {
        const latest = useGameStore.getState();
        await api.saveGame({
          playerId: latest.player?.name,
          saveSlot: 1,
          saveName: 'AutoSave',
          gameState: {
            player: latest.player,
            genre: latest.genre,
            story: latest.currentStory,
            choices: latest.playerChoices,
            storyPhase: latest.gameState.storyPhase,
            turnCount: latest.gameState.turnCount,
            combatEncounters: latest.gameState.combatEncounters,
            combatEscapes: latest.gameState.combatEscapes,
            isAfterCombat: latest.gameState.isAfterCombat,
            isFinalPhase: latest.gameState.isFinalPhase,
            puzzle: latest.currentPuzzle,
            storyLog: latest.storyLog,
            badges: latest.badges,
            cameos: latest.cameos,
          },
          storyLog: latest.storyLog,
          badges: latest.badges,
          cameos: latest.cameos,
          schemaVersion: 1,
        });
      } catch (e) {
        console.warn('Autosave failed after combat', e);
      }
    } catch (error) {
      console.error('Failed to continue story after combat:', error);
      // Fallback story
      updateStory(`After defeating ${currentEnemy?.name}, you continue your journey...`);
      setPlayerChoices(['Continue forward', 'Rest and recover', 'Search the area']);
      updateGameState({ isAfterCombat: false });
    }
  };

  const handleAction = async (action: 'attack' | 'defend' | 'use-item' | 'run', itemId?: string) => {
    // Prevent concurrent actions
    if (isProcessing) return;
    
    // Immediate UI feedback - INSTANT
    setIsProcessing(true);
    
    // Instant visual feedback with animations
    if (action === 'attack' && !itemId) {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 300);
      setCombatLog(prev => [...prev, { id: Date.now(), text: `You attack ${currentEnemy.name}!`, timestamp: Date.now() }].slice(-20));
    } else if (action === 'defend') {
      setCombatLog(prev => [...prev, { id: Date.now(), text: `You raise your guard!`, timestamp: Date.now() }].slice(-20));
    } else if (action === 'attack' && itemId) {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 300);
    }
    
    if (action === 'run') {
      const success = Math.random() > 0.5;
      if (success) {
        toast({ title: 'Escaped!', description: 'You managed to flee from combat.' });
        endCombat();
        updateGameState({ isAfterCombat: true, storyPhase: 'exploration' });
        continueStoryAfterCombat();
      } else {
        toast({ title: 'Failed to escape!', description: 'The enemy blocks your path.' });
        handleEnemyAttack();
      }
      setIsProcessing(false);
      return;
    }

    // Process combat - INSTANT response
    try {
      // Get result from API
      const result = await api.processCombat({
        player,
        enemy: currentEnemy,
        action: itemId ? 'use-item' : action,
        itemId,
      });

      // INSTANT UI updates - apply immediately when result arrives
      if (result.enemyDamage > 0) {
        const randomX = Math.random() * 100 - 50;
        const randomY = Math.random() * 30 - 15;
        setDamageNumbers(prev => [...prev, { 
          id: Date.now(), 
          value: result.enemyDamage, 
          isPlayer: false,
          x: randomX,
          y: randomY
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== Date.now())), 1500);
      }
      if (result.playerDamage > 0) {
        setIsEnemyAttacking(true);
        setTimeout(() => setIsEnemyAttacking(false), 300);
        const randomX = Math.random() * 100 - 50;
        const randomY = Math.random() * 30 - 15;
        setDamageNumbers(prev => [...prev, { 
          id: Date.now() + 1, 
          value: result.playerDamage, 
          isPlayer: true,
          x: randomX,
          y: randomY
        }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== Date.now() + 1)), 1500);
      }

      // Update combat log INSTANTLY with real results
      if (result.combatLog && Array.isArray(result.combatLog)) {
        const newLogs = result.combatLog.map((text: string) => ({
          id: Date.now() + Math.random(),
          text,
          timestamp: Date.now()
        }));
        setCombatLog(prev => [...prev, ...newLogs].slice(-20));
      }
      
      // Update health INSTANTLY (this is the key - instant HP decrease)
      damageEnemy(result.enemyDamage);
      damagePlayer(result.playerDamage);

      if (Array.isArray(result.unlockedBadges) && result.unlockedBadges.length > 0) {
        const newlyUnlocked = result.unlockedBadges as Badge[];
        unlockBadges(newlyUnlocked);
        newlyUnlocked.forEach((badge) => {
          sonnerToast.success(`🏅 ${badge.title}`, {
            description: badge.description,
          });
        });
      }

      if (Array.isArray(result.badges)) {
        setBadges(result.badges as Badge[]);
      }

      // Check victory/defeat
      if (result.victory || result.enemyHealth <= 0) {
        // Show victory message instantly
        sonnerToast.success(`🎉 Victory! You defeated ${currentEnemy.name}!`);
        
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
        
        // End combat and continue story immediately
        endCombat();
        setIsProcessing(false);
        // Continue story right away
        continueStoryAfterCombat();
      } else if (result.defeat || result.playerHealth <= 0) {
        sonnerToast.error('💀 Defeated... You have fallen in battle.');
        setTimeout(() => {
          endCombat();
          setIsProcessing(false);
        }, 1000);
      } else {
        // Continue combat - allow next action INSTANTLY
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Combat action failed:', error);
      setIsProcessing(false);
    }
  };
  
  const handleWeaponAttack = (weapon: Item) => {
    handleAction('attack', weapon.id);
  };

  const handleEnemyAttack = () => {
    setIsEnemyAttacking(true);
    setTimeout(() => setIsEnemyAttacking(false), 300);
    const damage = Math.floor(Math.random() * currentEnemy.attack) + 5;
    damagePlayer(damage);
    const randomX = Math.random() * 100 - 50;
    const randomY = Math.random() * 30 - 15;
    setDamageNumbers(prev => [...prev, { 
      id: Date.now(), 
      value: damage, 
      isPlayer: true,
      x: randomX,
      y: randomY
    }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== Date.now())), 1500);
    setCombatLog(prev => [...prev, { 
      id: Date.now(), 
      text: `${currentEnemy.name} attacks for ${damage} damage!`, 
      timestamp: Date.now() 
    }].slice(-20));
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
              animate={isAttacking ? { 
                x: [0, -30, 0],
                rotate: [0, -15, 0],
                scale: [1, 1.2, 1]
              } : { x: [0, -10, 0] }}
              transition={isAttacking ? { duration: 0.3 } : { duration: 0.5, repeat: Infinity }}
              className="text-6xl relative"
            >
              🧙‍♂️
              {isAttacking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 text-primary"
                >
                  ⚔️
                </motion.div>
              )}
            </motion.div>
            <div>
              <p className="font-bold text-lg">{player.name}</p>
              <Progress 
                value={healthPercent} 
                className={`h-3 mt-2 transition-all duration-300 ${healthPercent < 30 ? 'bg-destructive' : ''}`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {player.health}/{player.maxHealth} HP
              </p>
            </div>
            <AnimatePresence>
              {damageNumbers.filter(d => d.isPlayer).map(dmg => (
                <motion.div
                  key={dmg.id}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    y: -80 + dmg.y, 
                    x: dmg.x,
                    scale: [1, 1.5, 0.8]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 text-2xl font-bold text-destructive pointer-events-none"
                  style={{ transform: `translateX(${dmg.x}px)` }}
                >
                  -{dmg.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Enemy */}
          <div className="text-center space-y-4 relative">
            <motion.div
              animate={isEnemyAttacking ? { 
                x: [0, 30, 0],
                rotate: [0, 15, 0],
                scale: [1, 1.2, 1]
              } : { x: [0, 10, 0] }}
              transition={isEnemyAttacking ? { duration: 0.3 } : { duration: 0.5, repeat: Infinity }}
              className="text-6xl relative"
            >
              👹
              {isEnemyAttacking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 text-destructive"
                >
                  ⚔️
                </motion.div>
              )}
            </motion.div>
            <div>
              <p className="font-bold text-lg">{currentEnemy.name}</p>
              <Progress 
                value={enemyHealthPercent} 
                className={`h-3 mt-2 transition-all duration-300 ${enemyHealthPercent < 30 ? 'bg-destructive' : ''}`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {currentEnemy.health}/{currentEnemy.maxHealth} HP
              </p>
            </div>
            <AnimatePresence>
              {damageNumbers.filter(d => !d.isPlayer).map(dmg => (
                <motion.div
                  key={dmg.id}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    y: -80 + dmg.y, 
                    x: dmg.x,
                    scale: [1, 1.5, 0.8]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 text-2xl font-bold text-primary pointer-events-none"
                  style={{ transform: `translateX(${dmg.x}px)` }}
                >
                  -{dmg.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Combat Log Timeline */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Book className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Combat Log</span>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {combatLog.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Combat log will appear here...</p>
              ) : (
                combatLog.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-foreground">{log.text}</span>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Weapons List - Always visible if weapons available */}
        {weapons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/80 rounded-lg p-4 border-2 border-primary/30"
          >
            <p className="text-sm font-semibold mb-3">⚔️ Your Weapons:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {weapons.map((weapon) => (
                <Button
                  key={weapon.id}
                  onClick={() => handleWeaponAttack(weapon)}
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10 hover:border-primary"
                  disabled={isProcessing}
                >
                  <Sword className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{weapon.name}</span>
                  {weapon.effect && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {weapon.effect}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weapons.length === 0 && (
            <Button 
              onClick={() => handleAction('attack')} 
              className="gap-2"
              disabled={isProcessing}
            >
            <Sword className="w-4 h-4" />
            {t('actions.attack')}
          </Button>
          )}
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
