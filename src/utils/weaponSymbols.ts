// Weapon symbol mapping for inventory display
export function getWeaponSymbol(itemName: string, itemType: string): string {
  if (itemType !== 'weapon') return '';
  
  const name = itemName.toLowerCase();
  
  // Fantasy weapons
  if (name.includes('sword')) return '⚔️';
  if (name.includes('bow') || name.includes('arrow')) return '🏹';
  if (name.includes('staff') || name.includes('wand')) return '🪄';
  if (name.includes('dagger') || name.includes('knife')) return '🗡️';
  if (name.includes('mace') || name.includes('hammer')) return '⚒️';
  if (name.includes('axe')) return '🪓';
  if (name.includes('spear') || name.includes('lance')) return '🔱';
  if (name.includes('shield')) return '🛡️';
  if (name.includes('crossbow')) return '🏹';
  
  // Sci-Fi weapons
  if (name.includes('rifle') || name.includes('assault')) return '🔫';
  if (name.includes('pistol') || name.includes('gun')) return '🔫';
  if (name.includes('sniper')) return '🎯';
  if (name.includes('grenade') || name.includes('bomb')) return '💣';
  if (name.includes('plasma') || name.includes('laser') || name.includes('energy')) return '⚡';
  if (name.includes('smg') || name.includes('submachine')) return '🔫';
  if (name.includes('shotgun')) return '🔫';
  
  // Mythical weapons
  if (name.includes('divine') || name.includes('sacred') || name.includes('holy')) return '✨';
  if (name.includes('celestial') || name.includes('godly')) return '⭐';
  if (name.includes('thunder') || name.includes('lightning')) return '⚡';
  
  // Mystery tools (not weapons but investigation tools)
  if (name.includes('magnifying') || name.includes('glass')) return '🔍';
  if (name.includes('lockpick') || name.includes('key')) return '🔑';
  if (name.includes('camera')) return '📷';
  if (name.includes('flashlight')) return '🔦';
  
  // Default weapon symbol
  return '⚔️';
}

