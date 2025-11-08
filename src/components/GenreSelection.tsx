import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import desertBg from '@/assets/desert-bg.jpg';
import forestBg from '@/assets/forest-bg.jpg';
import { Castle, Rocket, Search, Sparkles, Star, ArrowRight, ArrowLeft } from 'lucide-react';

const genres = [
  {
    name: 'Fantasy',
    icon: Castle,
    description: 'Explore mystical realms filled with magic and ancient secrets',
    preview: 'You stand before an ancient castle, its towers piercing the clouds. A wizard offers you a quest to recover a lost artifact that could save the kingdom.',
    image: dungeonBg,
    color: 'from-amber-500 to-yellow-600',
    bgTheme: 'bg-gradient-to-br from-amber-900/20 via-yellow-800/10 to-amber-700/20',
    popularity: 'Most Popular',
  },
  {
    name: 'Sci-Fi',
    icon: Rocket,
    description: 'Journey through futuristic worlds and advanced civilizations',
    preview: 'Your starship drifts near an unknown planet. The scanner detects signs of an advanced alien civilization. Do you make first contact or observe from afar?',
    image: desertBg,
    color: 'from-cyan-500 to-blue-600',
    bgTheme: 'bg-gradient-to-br from-cyan-900/20 via-blue-800/10 to-cyan-700/20',
    popularity: 'Futuristic',
  },
  {
    name: 'Mystery',
    icon: Search,
    description: 'Unravel enigmatic puzzles and hidden conspiracies',
    preview: 'A cryptic letter arrives at your door. The message speaks of a hidden treasure and warns of danger. Every clue leads deeper into a web of secrets.',
    image: forestBg,
    color: 'from-purple-500 to-indigo-600',
    bgTheme: 'bg-gradient-to-br from-purple-900/20 via-indigo-800/10 to-purple-700/20',
    popularity: 'Thrilling',
  },
  {
    name: 'Mythical',
    icon: Sparkles,
    description: 'Walk among gods and legendary creatures of old',
    preview: 'The gods have chosen you for a divine quest. Ancient powers stir, and mythical beasts roam the land. Your destiny awaits in the realm of legends.',
    image: forestBg,
    color: 'from-rose-500 to-pink-600',
    bgTheme: 'bg-gradient-to-br from-rose-900/20 via-pink-800/10 to-rose-700/20',
    popularity: 'Epic',
  },
] as const;

const GenreSelection = () => {
  const { setGenre, setScreen, gameStarted } = useGameStore();
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [selectedBgTheme, setSelectedBgTheme] = useState<string>('');

  const handleSelectGenre = (genre: typeof genres[number]['name']) => {
    const genreData = genres.find(g => g.name === genre);
    if (genreData) {
      setSelectedBgTheme(genreData.bgTheme);
    }
    setGenre(genre);
    setScreen('game');
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-background transition-all duration-1000 ${selectedBgTheme || ''}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>
      
      {/* Dynamic Background Theme */}
      <AnimatePresence mode="wait">
        {hoveredGenre && (
          <motion.div
            key={hoveredGenre}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${genres.find(g => g.name === hoveredGenre)?.bgTheme || ''} pointer-events-none`}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => setScreen('character')}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-fantasy gold-shimmer text-glow mb-4">
            Choose Your Realm
          </h1>
          <p className="text-xl text-muted-foreground font-elegant mb-4">
            Select the world where your adventure begins
          </p>
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
            >
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-semibold">Try Fantasy for your first adventure</span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {genres.map((genre, index) => {
            const Icon = genre.icon;
            return (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="group relative overflow-hidden cursor-pointer border-2 border-primary/30 hover:border-primary transition-all duration-500 h-64"
                  onClick={() => handleSelectGenre(genre.name)}
                  onMouseEnter={() => setHoveredGenre(genre.name)}
                  onMouseLeave={() => setHoveredGenre(null)}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${genre.image})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-60 group-hover:opacity-75 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative h-full p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                        </motion.div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                          {genre.popularity}
                        </Badge>
                      </div>
                      
                      <h2 className="text-3xl font-fantasy text-white mb-2 drop-shadow-lg">
                        {genre.name}
                      </h2>
                      
                      <p className="text-white/90 font-elegant text-sm drop-shadow-md mb-3">
                        {genre.description}
                      </p>
                    </div>
                    
                    {/* Preview Story */}
                    <AnimatePresence>
                      {hoveredGenre === genre.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                        >
                          <p className="text-white/95 text-xs font-elegant italic leading-relaxed">
                            "{genre.preview}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex items-center gap-2 text-white/90 mt-4">
                      <span className="text-sm font-semibold">Begin Adventure</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary/50 rounded-lg transition-all duration-500"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </div>
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GenreSelection;
