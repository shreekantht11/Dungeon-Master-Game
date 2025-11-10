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
import { Swords, Wand2, Zap, ArrowRight, Info, Sparkles, Dice6, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Kannada' | 'Telugu'>('English');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  
  const { createCharacter, setScreen, authUser, updateSettings } = useGameStore();
  const { i18n } = useTranslation();

  // Language mapping: display names to i18n codes
  const languageMap: Record<string, string> = {
    'English': 'en',
    'Kannada': 'kn',
    'Telugu': 'te',
  };

  // Auto-fill name from Google sign-in if available
  useEffect(() => {
    if (authUser?.name && !name) {
      setName(authUser.name);
    } else if (!authUser?.name && !name) {
      // Fallback: check localStorage if authUser is not yet loaded
      try {
        const storedAuth = localStorage.getItem('gilded-scrolls-auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.name) {
            setName(parsed.name);
          }
        }
      } catch (e) {
        // Silently fail if localStorage read fails
      }
    }
  }, [authUser?.name, name]);

  const generateRandomName = () => {
    const randomName = fantasyNames[Math.floor(Math.random() * fantasyNames.length)];
    setName(randomName);
  };

  const currentClass = classes.find(c => c.name === selectedClass);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    // Set language in gameStore and i18n
    updateSettings({ language: selectedLanguage });
    const langCode = languageMap[selectedLanguage];
    if (langCode) {
      i18n.changeLanguage(langCode);
    }
    
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
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${desertBg})` }}
      >
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="relative z-10 h-full flex flex-col px-4 py-3">
        <Button
          variant="ghost"
          onClick={() => setScreen('intro')}
          className="mb-2 hover:bg-primary/10 self-start"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center"
        >
          <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-6 w-full max-w-6xl">
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Character Portrait - Left Column */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-12 md:col-span-4 flex flex-col gap-3"
              >
                <h2 className="text-2xl font-fantasy gold-shimmer text-glow mb-2">
                  Create Your Hero
                </h2>
                
                <motion.div
                  key={selectedClass}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg flex-1 min-h-[200px]"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-lg font-fantasy text-primary">
                      {name || 'Hero'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-elegant">
                      {selectedClass} · Level 1
                    </p>
                    {currentClass && (
                      <div className="mt-1.5 flex gap-1.5 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          STR: {currentClass.detailedStats.strength}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          INT: {currentClass.detailedStats.intelligence}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          AGI: {currentClass.detailedStats.agility}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Character Form - Right Column */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="col-span-12 md:col-span-8 flex flex-col gap-3"
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="text-sm font-elegant">
                      Hero Name
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateRandomName}
                      className="gap-1 text-xs h-7"
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
                    className="h-10 bg-input border-primary/30 focus:border-primary text-sm"
                  />
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-elegant">Choose Your Class</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <TooltipProvider>
                      {classes.map((cls) => {
                        const Icon = cls.icon;
                        const isSelected = selectedClass === cls.name;
                        return (
                          <Tooltip key={cls.name} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => setSelectedClass(cls.name as any)}
                                onMouseEnter={() => setHoveredClass(cls.name)}
                                onMouseLeave={() => setHoveredClass(null)}
                                className={`p-3 rounded-lg border-2 transition-all duration-300 text-center relative cursor-pointer ${
                                  isSelected
                                    ? `${cls.borderColor} ${cls.bgColor} shadow-md`
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isSelected ? cls.color : 'text-muted-foreground'}`} />
                                <h4 className={`text-sm font-semibold mb-0.5 ${isSelected ? cls.color : ''}`}>
                                  {cls.name}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {cls.description}
                                </p>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-1 right-1 h-5 w-5 p-0 opacity-60 hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedClass(expandedClass === cls.name ? null : cls.name);
                                      }}
                                    >
                                      <Info className="w-3 h-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-72" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-2">
                                      <h4 className="font-semibold">{cls.name}</h4>
                                      <p className="text-xs text-muted-foreground">{cls.lore}</p>
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
                                              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
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
                            </TooltipTrigger>
                            <TooltipContent side="top" className="w-56">
                              <div className="space-y-1.5">
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
                                <p className="text-xs text-primary/70">{cls.stats}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-elegant">Gender</Label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <Button
                        key={g}
                        variant={gender === g ? 'default' : 'outline'}
                        onClick={() => setGender(g)}
                        className="flex-1 h-9 text-sm"
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-elegant">Story Language</Label>
                  <div className="flex gap-2">
                    {(['English', 'Kannada', 'Telugu'] as const).map((lang) => (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? 'default' : 'outline'}
                        onClick={() => setSelectedLanguage(lang)}
                        className="flex-1 h-9 text-sm"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full h-11 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group mt-auto"
                >
                  Begin Adventure
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
