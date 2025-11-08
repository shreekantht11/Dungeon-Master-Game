import type { Player, Item } from '@/store/gameStore';

interface CombatResult {
  won: boolean;
  message: string;
}

export function resolveCombat(
  player: Player,
  weapon: Item | null,
  enemy: any
): CombatResult {
  // Base win chance: 75%
  let winChance = 75;

  // Weapon bonus: extract attack stat from weapon effect or statBonuses
  let weaponBonus = 0;
  if (weapon) {
    // Check if weapon has statBonuses with attack
    if (weapon.statBonuses?.attack) {
      weaponBonus = weapon.statBonuses.attack * 2; // Each attack point = 2% bonus
    } else if (weapon.effect) {
      // Try to extract number from effect string like "+5 Attack" or "Attack +3"
      const attackMatch = weapon.effect.match(/\+(\d+)\s*Attack/i) || 
                         weapon.effect.match(/Attack\s*\+(\d+)/i);
      if (attackMatch) {
        weaponBonus = parseInt(attackMatch[1]) * 2;
      }
    }
  }

  // Player bonus: based on strength and level
  const playerBonus = (player.stats.strength * 0.5) + (player.level * 1);

  // Calculate final win chance (capped at 95%, minimum 25%)
  winChance = Math.min(95, Math.max(25, winChance + weaponBonus + playerBonus));

  // Random roll
  const roll = Math.random() * 100;
  const won = roll < winChance;

  // Generate messages
  if (won) {
    const weaponName = weapon ? weapon.name : 'your fists';
    return {
      won: true,
      message: `Victory! You defeated the ${enemy?.name || 'creature'} using ${weaponName}!`
    };
  } else {
    return {
      won: false,
      message: `Oh no! The ${enemy?.name || 'creature'} is stronger than you and killed you.`
    };
  }
}

