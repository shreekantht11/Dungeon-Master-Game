import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Lock, CheckCircle, Layers, AlertTriangle, Info, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import DungeonLevelSelector from '@/components/DungeonLevelSelector';
import LocationInfo from '@/components/LocationInfo';

interface Location {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  recommendedLevel: number;
  icon: string;
  x: number;
  y: number;
}

const WorldMap = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const player = useGameStore((state) => state.player);
  const currentLocation = useGameStore((state) => state.currentLocation || 'village');
  const discoveredLocations = useGameStore((state) => state.discoveredLocations);
  const locationProgress = useGameStore((state) => state.locationProgress);
  const locationStats = useGameStore((state) => state.locationStats);
  const setDungeonLevel = useGameStore((state) => state.setDungeonLevel);
  const setLocationProgress = useGameStore((state) => state.setLocationProgress);
  const updateLocationStats = useGameStore((state) => state.updateLocationStats);
  const setCurrentLocation = useGameStore((state) => state.setCurrentLocation);
  const discoverLocation = useGameStore((state) => state.discoverLocation);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationInfo, setShowLocationInfo] = useState<string | null>(null);

  const locations: Location[] = [
    {
      id: 'village',
      name: 'Starting Village',
      description: 'A peaceful village where your journey began',
      discovered: discoveredLocations.includes('village'),
      unlocked: true,
      level: 1,
      maxLevel: 1,
      recommendedLevel: 1,
      icon: '🏘️',
      x: 10,
      y: 60,
    },
    {
      id: 'forest',
      name: 'Dark Forest',
      description: 'An ancient forest filled with mysteries',
      discovered: discoveredLocations.includes('forest'),
      unlocked: player ? player.level >= 2 : false,
      level: 2,
      maxLevel: 5,
      recommendedLevel: 2,
      icon: '🌲',
      x: 25,
      y: 45,
    },
    {
      id: 'cave',
      name: 'Crystal Caves',
      description: 'Glowing crystals illuminate these dangerous caverns',
      discovered: discoveredLocations.includes('cave'),
      unlocked: player ? player.level >= 3 : false,
      level: 3,
      maxLevel: 7,
      recommendedLevel: 3,
      icon: '⛰️',
      x: 40,
      y: 35,
    },
    {
      id: 'castle',
      name: 'Abandoned Castle',
      description: 'Once majestic, now haunted ruins',
      discovered: discoveredLocations.includes('castle'),
      unlocked: player ? player.level >= 5 : false,
      level: 5,
      maxLevel: 10,
      recommendedLevel: 5,
      icon: '🏰',
      x: 55,
      y: 50,
    },
    {
      id: 'mountain',
      name: 'Dragon Peak',
      description: 'The highest mountain, home to ancient dragons',
      discovered: discoveredLocations.includes('mountain'),
      unlocked: player ? player.level >= 8 : false,
      level: 8,
      maxLevel: 15,
      recommendedLevel: 8,
      icon: '🗻',
      x: 70,
      y: 25,
    },
    {
      id: 'port',
      name: 'Harbor Port',
      description: 'A bustling port town with ships from distant lands',
      discovered: discoveredLocations.includes('port'),
      unlocked: player ? player.level >= 2 : false,
      level: 2,
      maxLevel: 1,
      recommendedLevel: 2,
      icon: '⚓',
      x: 5,
      y: 75,
    },
    {
      id: 'desert',
      name: 'Scorching Desert',
      description: 'Endless sands hide ancient secrets and dangers',
      discovered: discoveredLocations.includes('desert'),
      unlocked: player ? player.level >= 4 : false,
      level: 4,
      maxLevel: 8,
      recommendedLevel: 4,
      icon: '🏜️',
      x: 15,
      y: 20,
    },
    {
      id: 'swamp',
      name: 'Misty Swamp',
      description: 'A murky swamp filled with strange creatures',
      discovered: discoveredLocations.includes('swamp'),
      unlocked: player ? player.level >= 3 : false,
      level: 3,
      maxLevel: 6,
      recommendedLevel: 3,
      icon: '🌿',
      x: 30,
      y: 70,
    },
    {
      id: 'temple',
      name: 'Ancient Temple',
      description: 'A sacred temple with powerful guardians',
      discovered: discoveredLocations.includes('temple'),
      unlocked: player ? player.level >= 6 : false,
      level: 6,
      maxLevel: 12,
      recommendedLevel: 6,
      icon: '🛕',
      x: 65,
      y: 60,
    },
    {
      id: 'tower',
      name: 'Mystic Tower',
      description: 'A towering structure reaching into the clouds',
      discovered: discoveredLocations.includes('tower'),
      unlocked: player ? player.level >= 7 : false,
      level: 7,
      maxLevel: 20,
      recommendedLevel: 7,
      icon: '🗼',
      x: 80,
      y: 50,
    },
    {
      id: 'ruins',
      name: 'Forgotten Ruins',
      description: 'Crumbling ruins of an ancient civilization',
      discovered: discoveredLocations.includes('ruins'),
      unlocked: player ? player.level >= 4 : false,
      level: 4,
      maxLevel: 9,
      recommendedLevel: 4,
      icon: '🏛️',
      x: 45,
      y: 65,
    },
    {
      id: 'volcano',
      name: 'Fire Volcano',
      description: 'An active volcano with molten lava flows',
      discovered: discoveredLocations.includes('volcano'),
      unlocked: player ? player.level >= 9 : false,
      level: 9,
      maxLevel: 18,
      recommendedLevel: 9,
      icon: '🌋',
      x: 85,
      y: 40,
    },
    {
      id: 'town',
      name: 'Merchant Town',
      description: 'A prosperous trading town with many shops',
      discovered: discoveredLocations.includes('town'),
      unlocked: player ? player.level >= 2 : false,
      level: 2,
      maxLevel: 1,
      recommendedLevel: 2,
      icon: '🏙️',
      x: 35,
      y: 55,
    },
    {
      id: 'crypt',
      name: 'Underground Crypt',
      description: 'Dark catacombs filled with undead horrors',
      discovered: discoveredLocations.includes('crypt'),
      unlocked: player ? player.level >= 5 : false,
      level: 5,
      maxLevel: 11,
      recommendedLevel: 5,
      icon: '⚰️',
      x: 50,
      y: 70,
    },
    {
      id: 'island',
      name: 'Mysterious Island',
      description: 'A remote island shrouded in mystery',
      discovered: discoveredLocations.includes('island'),
      unlocked: player ? player.level >= 6 : false,
      level: 6,
      maxLevel: 13,
      recommendedLevel: 6,
      icon: '🏝️',
      x: 20,
      y: 85,
    },
    {
      id: 'glacier',
      name: 'Frozen Glacier',
      description: 'A vast ice field with freezing temperatures',
      discovered: discoveredLocations.includes('glacier'),
      unlocked: player ? player.level >= 7 : false,
      level: 7,
      maxLevel: 14,
      recommendedLevel: 7,
      icon: '🧊',
      x: 90,
      y: 15,
    },
    {
      id: 'jungle',
      name: 'Dense Jungle',
      description: 'A thick jungle teeming with wildlife',
      discovered: discoveredLocations.includes('jungle'),
      unlocked: player ? player.level >= 3 : false,
      level: 3,
      maxLevel: 6,
      recommendedLevel: 3,
      icon: '🌴',
      x: 10,
      y: 30,
    },
    {
      id: 'fortress',
      name: 'Iron Fortress',
      description: 'An impenetrable fortress with strong defenses',
      discovered: discoveredLocations.includes('fortress'),
      unlocked: player ? player.level >= 8 : false,
      level: 8,
      maxLevel: 16,
      recommendedLevel: 8,
      icon: '🏯',
      x: 60,
      y: 15,
    },
    {
      id: 'library',
      name: 'Grand Library',
      description: 'A vast library containing ancient knowledge',
      discovered: discoveredLocations.includes('library'),
      unlocked: player ? player.level >= 4 : false,
      level: 4,
      maxLevel: 1,
      recommendedLevel: 4,
      icon: '📚',
      x: 75,
      y: 70,
    },
    {
      id: 'arena',
      name: 'Champion Arena',
      description: 'A grand arena where warriors prove their worth',
      discovered: discoveredLocations.includes('arena'),
      unlocked: player ? player.level >= 5 : false,
      level: 5,
      maxLevel: 1,
      recommendedLevel: 5,
      icon: '⚔️',
      x: 50,
      y: 25,
    },
  ];

  const handleTravel = (location: Location) => {
    if (!location.unlocked) {
      toast({
        title: 'Location Locked',
        description: `Reach level ${location.level} to unlock this area.`,
        variant: 'destructive',
      });
      return;
    }

    // Discover location if not already discovered
    if (!location.discovered) {
      discoverLocation(location.id);
    }

    // Show level selector for locations with multiple floors
    if (location.maxLevel > 1) {
      setSelectedLocation(location);
      setShowLevelSelector(true);
    } else {
      // Single level location, just travel
      setCurrentLocation(location.id);
      setDungeonLevel(1);
      updateLocationStats(location.id, {
        timesVisited: (locationStats[location.id]?.timesVisited || 0) + 1,
      });
      toast({
        title: 'Traveling...',
        description: `Heading to ${location.name}`,
      });
    }
  };

  const handleLevelSelect = (level: number) => {
    if (!selectedLocation || !player) return;
    
    // Discover location if not already discovered
    if (!selectedLocation.discovered) {
      discoverLocation(selectedLocation.id);
    }
    
    setCurrentLocation(selectedLocation.id);
    setDungeonLevel(level);
    setLocationProgress(selectedLocation.id, level);
    updateLocationStats(selectedLocation.id, {
      timesVisited: (locationStats[selectedLocation.id]?.timesVisited || 0) + 1,
      highestLevel: Math.max(locationStats[selectedLocation.id]?.highestLevel || 0, level),
    });
    
    toast({
      title: 'Traveling...',
      description: `Entering ${selectedLocation.name} - Floor ${level}`,
    });
  };

  const getDifficulty = (location: Location): 'easy' | 'medium' | 'hard' => {
    if (!player) return 'medium';
    const levelDiff = location.recommendedLevel - player.level;
    if (levelDiff <= -2) return 'easy';
    if (levelDiff <= 1) return 'medium';
    return 'hard';
  };

  const getCompletionPercentage = (location: Location): number => {
    const stats = locationStats[location.id];
    if (!stats || location.maxLevel === 0) return 0;
    return Math.min(100, (stats.highestLevel / location.maxLevel) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Map Canvas */}
      <div className="relative w-full h-[500px] bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border-2 border-border overflow-auto">
        <div className="relative min-w-full min-h-full" style={{ width: '100%', height: '100%' }}>
          {/* Path Lines - Connect nearby locations */}
          <svg className="absolute inset-0 w-full h-full">
            {locations.flatMap((loc, i) =>
              locations
                .filter((otherLoc, j) => {
                  if (i >= j) return false;
                  const distance = Math.sqrt(
                    Math.pow(loc.x - otherLoc.x, 2) + Math.pow(loc.y - otherLoc.y, 2)
                  );
                  return distance < 40 && (loc.discovered || otherLoc.discovered);
                })
                .map((otherLoc) => (
                  <motion.line
                    key={`path-${loc.id}-${otherLoc.id}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: loc.discovered && otherLoc.discovered ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    x1={`${loc.x}%`}
                    y1={`${loc.y}%`}
                    x2={`${otherLoc.x}%`}
                    y2={`${otherLoc.y}%`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.3"
                  />
                ))
            )}
          </svg>

          {/* Location Markers */}
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: location.discovered ? 1 : 0, opacity: location.discovered ? 1 : 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() => handleTravel(location)}
            >
            <motion.div
              whileHover={{ scale: 1.2 }}
              className={`relative ${currentLocation === location.id ? 'animate-pulse' : ''}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 ${
                  currentLocation === location.id
                    ? 'border-primary bg-primary/20'
                    : location.unlocked
                    ? 'border-primary/50 bg-background'
                    : 'border-muted bg-muted/50'
                }`}
              >
                {location.unlocked ? location.icon : <Lock className="w-8 h-8 text-muted-foreground" />}
              </div>

              {currentLocation === location.id && (
                <MapPin className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 text-primary animate-bounce" />
              )}
            </motion.div>
          </motion.div>
          ))}
        </div>
      </div>

      {/* Location List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card border rounded-lg p-4 space-y-3 ${
              !location.discovered ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{location.discovered ? location.icon : '❓'}</span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {location.discovered ? location.name : 'Unknown Location'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {location.discovered ? location.description : 'Not yet discovered'}
                  </p>
                </div>
              </div>
              {currentLocation === location.id && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* Difficulty and Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={location.unlocked ? 'default' : 'secondary'}>
                    Level {location.level}
                  </Badge>
                  {location.maxLevel > 1 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {locationProgress[location.id] || 0}/{location.maxLevel} Floors
                    </Badge>
                  )}
                  {location.unlocked && player && (
                    <Badge
                      variant={
                        getDifficulty(location) === 'easy'
                          ? 'default'
                          : getDifficulty(location) === 'medium'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {getDifficulty(location).toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLocationInfo(location.id)}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    disabled={!location.unlocked || currentLocation === location.id}
                    onClick={() => handleTravel(location)}
                  >
                    {currentLocation === location.id ? 'Current' : location.unlocked ? 'Travel' : 'Locked'}
                  </Button>
                </div>
              </div>
              
              {/* Completion Progress */}
              {location.unlocked && location.maxLevel > 1 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">
                      {Math.round(getCompletionPercentage(location))}%
                    </span>
                  </div>
                  <Progress value={getCompletionPercentage(location)} className="h-2" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dungeon Level Selector */}
      {selectedLocation && (
        <DungeonLevelSelector
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
          maxLevel={selectedLocation.maxLevel}
          recommendedLevel={selectedLocation.recommendedLevel}
          highestLevelReached={locationProgress[selectedLocation.id] || 0}
          open={showLevelSelector}
          onClose={() => {
            setShowLevelSelector(false);
            setSelectedLocation(null);
          }}
          onSelect={handleLevelSelect}
        />
      )}

      {/* Location Info */}
      {showLocationInfo && (
        <LocationInfo
          locationId={showLocationInfo}
          locationName={locations.find(l => l.id === showLocationInfo)?.name || 'Unknown'}
          maxLevel={locations.find(l => l.id === showLocationInfo)?.maxLevel || 1}
          recommendedLevel={locations.find(l => l.id === showLocationInfo)?.recommendedLevel || 1}
          open={!!showLocationInfo}
          onClose={() => setShowLocationInfo(null)}
        />
      )}
    </div>
  );
};

export default WorldMap;
