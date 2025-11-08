import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Sword } from 'lucide-react';

interface CombatOverlayProps {
  isActive: boolean;
  enemy: any;
  showWeaponSelection: boolean;
}

const CombatOverlay = ({ isActive, enemy, showWeaponSelection }: CombatOverlayProps) => {
  if (!isActive || !enemy) return null;

  const enemyHealthPercentage = enemy.health && enemy.maxHealth 
    ? (enemy.health / enemy.maxHealth) * 100 
    : 100;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <Card className="bg-destructive/10 border-2 border-destructive/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-destructive">{enemy.name || 'Enemy'}</h3>
                    {enemy.health !== undefined && enemy.maxHealth !== undefined && (
                      <span className="text-sm text-destructive font-semibold">
                        {enemy.health}/{enemy.maxHealth} HP
                      </span>
                    )}
                  </div>
                  {enemy.health !== undefined && enemy.maxHealth !== undefined && (
                    <Progress 
                      value={enemyHealthPercentage} 
                      className="h-2 bg-destructive/20"
                    />
                  )}
                </div>
              </div>
              {showWeaponSelection && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2 text-destructive font-semibold"
                >
                  <Sword className="w-5 h-5" />
                  <span>Choose Weapon!</span>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CombatOverlay;

