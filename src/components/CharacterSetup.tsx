import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import desertBg from '@/assets/desert-bg.jpg';
import warriorPortrait from '@/assets/warrior-portrait.jpg';
import { Swords, Wand2, Zap, ArrowRight } from 'lucide-react';

const classes = [
  {
    name: 'Warrior',
    icon: Swords,
    description: 'Master of combat and strength',
    stats: 'High HP, Strong Attack',
  },
  {
    name: 'Mage',
    icon: Wand2,
    description: 'Wielder of arcane powers',
    stats: 'High Magic, Versatile Spells',
  },
  {
    name: 'Rogue',
    icon: Zap,
    description: 'Swift and cunning assassin',
    stats: 'High Speed, Critical Hits',
  },
];

const CharacterSetup = () => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<'Warrior' | 'Mage' | 'Rogue'>('Warrior');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  
  const { createCharacter, setScreen, authUser } = useGameStore();

  // Auto-fill name from Google sign-in if available
  useEffect(() => {
    if (authUser?.name && !name) {
      setName(authUser.name);
    }
  }, [authUser?.name]);

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
                
                <div className="relative aspect-square rounded-xl overflow-hidden border-4 border-primary/50 shadow-xl">
                  <img
                    src={warriorPortrait}
                    alt="Character Portrait"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-fantasy text-primary">
                      {name || 'Hero'}
                    </h3>
                    <p className="text-sm text-muted-foreground font-elegant">
                      {selectedClass} · Level 1
                    </p>
                  </div>
                </div>
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
                  <Label htmlFor="name" className="text-lg font-elegant">
                    Hero Name
                  </Label>
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
                    {classes.map((cls) => {
                      const Icon = cls.icon;
                      return (
                        <button
                          key={cls.name}
                          onClick={() => setSelectedClass(cls.name as any)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                            selectedClass === cls.name
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-6 h-6 ${selectedClass === cls.name ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1">
                              <h4 className={`font-semibold ${selectedClass === cls.name ? 'text-primary' : ''}`}>
                                {cls.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {cls.description}
                              </p>
                              <p className="text-xs text-primary/70 mt-1">
                                {cls.stats}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
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
