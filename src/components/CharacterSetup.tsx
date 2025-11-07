import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import desertBg from '@/assets/desert-bg.jpg';
import warriorPortrait from '@/assets/warrior-portrait.jpg';
import { Swords, Wand2, Zap, ArrowRight, Info, Sparkles, Dice6 } from 'lucide-react';

const classes = [
  {
    name: 'Warrior',
    icon: Swords,
    description: 'Master of combat and strength',
    stats: 'High HP, Strong Attack',
    detailedStats: { strength: 10, intelligence: 5, agility: 7, hp: 100 },
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    lore: 'Warriors are frontline fighters who excel in melee combat. They start with sturdy armor and powerful weapons.',
    startingItems: ['Rusty Sword', 'Leather Armor', 'Health Potion'],
  },
  {
    name: 'Mage',
    icon: Wand2,
    description: 'Wielder of arcane powers',
    stats: 'High Magic, Versatile Spells',
    detailedStats: { strength: 5, intelligence: 10, agility: 6, hp: 80 },
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    lore: 'Mages harness the power of magic to cast devastating spells. They start with a staff and spellbook.',
    startingItems: ['Apprentice Staff', 'Spellbook', 'Mana Potion'],
  },
  {
    name: 'Rogue',
    icon: Zap,
    description: 'Swift and cunning assassin',
    stats: 'High Speed, Critical Hits',
    detailedStats: { strength: 7, intelligence: 6, agility: 10, hp: 90 },
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    lore: 'Rogues are agile fighters who rely on speed and precision. They start with daggers and lockpicks.',
    startingItems: ['Dual Daggers', 'Lockpicks', 'Poison Vial'],
  },
];

const fantasyNames = [
  'Aelric', 'Brenna', 'Cedric', 'Dara', 'Eamon', 'Fiona', 'Gareth', 'Helena',
  'Ivor', 'Jade', 'Kael', 'Luna', 'Marcus', 'Nora', 'Orin', 'Piper',
  'Quinn', 'Raven', 'Soren', 'Tara', 'Ulric', 'Vera', 'Wren', 'Xara',
  'Yara', 'Zane', 'Aria', 'Bane', 'Cora', 'Dex', 'Eira', 'Finn'
];

const CharacterSetup = () => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<'Warrior' | 'Mage' | 'Rogue'>('Warrior');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  
  const { createCharacter, setScreen, authUser } = useGameStore();

  // Auto-fill name from Google sign-in if available
  useEffect(() => {
    if (authUser?.name && !name) {
      setName(authUser.name);
    }
  }, [authUser?.name]);

  const generateRandomName = () => {
    const randomName = fantasyNames[Math.floor(Math.random() * fantasyNames.length)];
    setName(randomName);
  };

  const currentClass = classes.find(c => c.name === selectedClass);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    createCharacter({
      name: name.trim(),
      class: selectedClass,
      gender,
      health: 100,
      maxHealth: 100,
    });
    
    setScreen('genre');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${desertBg})` }}
      >
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-5xl"
        >
          <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-10">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Character Portrait */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-5"
              >
                <h2 className="text-3xl font-fantasy gold-shimmer text-glow">
                  Create Your Hero
                </h2>
                
                <motion.div
                  key={selectedClass}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-square rounded-xl overflow-hidden border-4 border-primary/50 shadow-xl"
                >
                  <motion.div
                    animate={{
                      filter: selectedClass === 'Warrior' ? 'hue-rotate(0deg)' : 
                               selectedClass === 'Mage' ? 'hue-rotate(200deg)' : 
                               'hue-rotate(120deg)',
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <img
                      src={warriorPortrait}
                      alt="Character Portrait"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-fantasy text-primary">
                      {name || 'Hero'}
                    </h3>
                    <p className="text-sm text-muted-foreground font-elegant">
                      {selectedClass} · Level 1
                    </p>
                    {currentClass && (
                      <div className="mt-2 flex gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                          STR: {currentClass.detailedStats.strength}
                        </span>
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                          INT: {currentClass.detailedStats.intelligence}
                        </span>
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                          AGI: {currentClass.detailedStats.agility}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Character Form */}
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="text-lg font-elegant">
                      Hero Name
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateRandomName}
                      className="gap-1 text-xs"
                    >
                      <Dice6 className="w-3 h-3" />
                      Random
                    </Button>
                  </div>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="h-12 bg-input border-primary/30 focus:border-primary text-lg"
                  />
                </div>

                {/* Class Selection */}
                <div className="space-y-3">
                  <Label className="text-lg font-elegant">Choose Your Class</Label>
                  <div className="space-y-2">
                    <TooltipProvider>
                      {classes.map((cls) => {
                        const Icon = cls.icon;
                        const isSelected = selectedClass === cls.name;
                        return (
                          <Tooltip key={cls.name} delayDuration={300}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedClass(cls.name as any)}
                                onMouseEnter={() => setHoveredClass(cls.name)}
                                onMouseLeave={() => setHoveredClass(null)}
                                className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left relative ${
                                  isSelected
                                    ? `${cls.borderColor} ${cls.bgColor} shadow-lg`
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Icon className={`w-6 h-6 ${isSelected ? cls.color : 'text-muted-foreground'}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className={`font-semibold ${isSelected ? cls.color : ''}`}>
                                        {cls.name}
                                      </h4>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedClass(expandedClass === cls.name ? null : cls.name);
                                            }}
                                          >
                                            <Info className="w-3 h-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                                          <div className="space-y-3">
                                            <h4 className="font-semibold text-lg">{cls.name}</h4>
                                            <p className="text-sm text-muted-foreground">{cls.lore}</p>
                                            <div className="space-y-2">
                                              <p className="text-xs font-semibold uppercase tracking-wide">Starting Stats</p>
                                              <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="p-2 rounded bg-muted">
                                                  <div className="text-muted-foreground">STR</div>
                                                  <div className="font-bold">{cls.detailedStats.strength}</div>
                                                </div>
                                                <div className="p-2 rounded bg-muted">
                                                  <div className="text-muted-foreground">INT</div>
                                                  <div className="font-bold">{cls.detailedStats.intelligence}</div>
                                                </div>
                                                <div className="p-2 rounded bg-muted">
                                                  <div className="text-muted-foreground">AGI</div>
                                                  <div className="font-bold">{cls.detailedStats.agility}</div>
                                                </div>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wide">Starting Items</p>
                                                <div className="flex flex-wrap gap-1">
                                                  {cls.startingItems.map((item, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                                      {item}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {cls.description}
                                    </p>
                                    <p className="text-xs text-primary/70 mt-1">
                                      {cls.stats}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="w-64">
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <div className="text-muted-foreground">STR</div>
                                    <div className="font-bold">{cls.detailedStats.strength}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">INT</div>
                                    <div className="font-bold">{cls.detailedStats.intelligence}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">AGI</div>
                                    <div className="font-bold">{cls.detailedStats.agility}</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">HP: {cls.detailedStats.hp}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-lg font-elegant">Gender</Label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <Button
                        key={g}
                        variant={gender === g ? 'default' : 'outline'}
                        onClick={() => setGender(g)}
                        className="flex-1"
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group"
                >
                  Begin Adventure
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CharacterSetup;
