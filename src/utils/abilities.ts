import { Ability } from '@/store/gameStore';

export const ABILITY_DEFINITIONS: Record<string, Omit<Ability, 'level'>> = {
  // Warrior Abilities
  'warrior_power_strike': {
    id: 'warrior_power_strike',
    name: 'Power Strike',
    description: 'Deal 150% damage with a powerful attack',
    maxLevel: 5,
    unlockedAt: 1,
    cooldown: 2,
    effect: 'Deal 150% damage',
    class: 'Warrior',
  },
  'warrior_shield_bash': {
    id: 'warrior_shield_bash',
    name: 'Shield Bash',
    description: 'Stun the enemy for 1 turn',
    maxLevel: 3,
    unlockedAt: 3,
    cooldown: 3,
    effect: 'Stun enemy for 1 turn',
    class: 'Warrior',
  },
  'warrior_berserker_rage': {
    id: 'warrior_berserker_rage',
    name: 'Berserker Rage',
    description: 'Increase damage by 50% for 3 turns',
    maxLevel: 3,
    unlockedAt: 5,
    cooldown: 5,
    effect: '+50% damage for 3 turns',
    class: 'Warrior',
  },
  
  // Mage Abilities
  'mage_fireball': {
    id: 'mage_fireball',
    name: 'Fireball',
    description: 'Deal area damage to all enemies',
    maxLevel: 5,
    unlockedAt: 1,
    cooldown: 2,
    manaCost: 20,
    effect: 'Area damage to all enemies',
    class: 'Mage',
  },
  'mage_arcane_shield': {
    id: 'mage_arcane_shield',
    name: 'Arcane Shield',
    description: 'Absorb incoming damage for 2 turns',
    maxLevel: 3,
    unlockedAt: 3,
    cooldown: 4,
    manaCost: 30,
    effect: 'Absorb incoming damage',
    class: 'Mage',
  },
  'mage_meteor_strike': {
    id: 'mage_meteor_strike',
    name: 'Meteor Strike',
    description: 'Deal massive damage to a single target',
    maxLevel: 3,
    unlockedAt: 5,
    cooldown: 6,
    manaCost: 50,
    effect: 'Massive single target damage',
    class: 'Mage',
  },
  
  // Rogue Abilities
  'rogue_backstab': {
    id: 'rogue_backstab',
    name: 'Backstab',
    description: 'Critical strike from behind dealing 200% damage',
    maxLevel: 5,
    unlockedAt: 1,
    cooldown: 2,
    effect: 'Critical strike (200% damage)',
    class: 'Rogue',
  },
  'rogue_shadow_step': {
    id: 'rogue_shadow_step',
    name: 'Shadow Step',
    description: 'Dodge the next enemy attack',
    maxLevel: 3,
    unlockedAt: 3,
    cooldown: 3,
    effect: 'Dodge next attack',
    class: 'Rogue',
  },
  'rogue_assassinate': {
    id: 'rogue_assassinate',
    name: 'Assassinate',
    description: 'Instant kill on enemies below 30% health',
    maxLevel: 3,
    unlockedAt: 5,
    cooldown: 5,
    effect: 'Instant kill on low health enemies',
    class: 'Rogue',
  },
};

export function getAbilitiesForClass(playerClass: 'Warrior' | 'Mage' | 'Rogue'): Omit<Ability, 'level'>[] {
  return Object.values(ABILITY_DEFINITIONS).filter(ability => ability.class === playerClass);
}

export function getAbilityDefinition(abilityId: string): Omit<Ability, 'level'> | undefined {
  return ABILITY_DEFINITIONS[abilityId];
}

export function canUnlockAbility(abilityId: string, playerLevel: number): boolean {
  const ability = ABILITY_DEFINITIONS[abilityId];
  if (!ability) return false;
  return playerLevel >= ability.unlockedAt;
}

export function initializeAbilitiesForClass(
  playerClass: 'Warrior' | 'Mage' | 'Rogue',
  playerLevel: number
): Record<string, Ability> {
  const abilities: Record<string, Ability> = {};
  const classAbilities = getAbilitiesForClass(playerClass);
  
  for (const abilityDef of classAbilities) {
    if (playerLevel >= abilityDef.unlockedAt) {
      abilities[abilityDef.id] = {
        ...abilityDef,
        level: 1,
      };
    }
  }
  
  return abilities;
}

export function calculateAbilityDamage(
  abilityId: string,
  abilityLevel: number,
  baseDamage: number,
  playerStats: { strength: number; intelligence: number; agility: number },
  playerClass: 'Warrior' | 'Mage' | 'Rogue'
): number {
  const ability = ABILITY_DEFINITIONS[abilityId];
  if (!ability) return baseDamage;
  
  let multiplier = 1;
  let statBonus = 0;
  
  switch (abilityId) {
    case 'warrior_power_strike':
      multiplier = 1.5 + (abilityLevel - 1) * 0.1; // 150% base, +10% per level
      statBonus = playerStats.strength * 0.5;
      break;
    case 'warrior_berserker_rage':
      multiplier = 1.5 + (abilityLevel - 1) * 0.15; // 150% base, +15% per level
      statBonus = playerStats.strength * 0.3;
      break;
    case 'mage_fireball':
      multiplier = 1.2 + (abilityLevel - 1) * 0.1; // 120% base, +10% per level
      statBonus = playerStats.intelligence * 0.8;
      break;
    case 'mage_meteor_strike':
      multiplier = 2.0 + (abilityLevel - 1) * 0.2; // 200% base, +20% per level
      statBonus = playerStats.intelligence * 1.2;
      break;
    case 'rogue_backstab':
      multiplier = 2.0 + (abilityLevel - 1) * 0.15; // 200% base, +15% per level
      statBonus = playerStats.agility * 0.6;
      break;
    case 'rogue_assassinate':
      multiplier = 3.0 + (abilityLevel - 1) * 0.3; // 300% base, +30% per level (only works on low health)
      statBonus = playerStats.agility * 0.8;
      break;
    default:
      multiplier = 1;
  }
  
  return Math.floor(baseDamage * multiplier + statBonus);
}

