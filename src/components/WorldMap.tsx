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
  const locationProgress = useGameStore((state) => state.locationProgress);
  const locationStats = useGameStore((state) => state.locationStats);
  const setDungeonLevel = useGameStore((state) => state.setDungeonLevel);
  const setLocationProgress = useGameStore((state) => state.setLocationProgress);
  const updateLocationStats = useGameStore((state) => state.updateLocationStats);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationInfo, setShowLocationInfo] = useState<string | null>(null);

  const locations: Location[] = [
    {
      id: 'village',
      name: 'Starting Village',
      description: 'A peaceful village where your journey began',
      discovered: true,
      unlocked: true,
      level: 1,
      maxLevel: 3,
      recommendedLevel: 1,
      icon: '🏘️',
      x: 20,
      y: 50,
    },
    {
      id: 'forest',
      name: 'Dark Forest',
      description: 'An ancient forest filled with mysteries',
      discovered: true,
      unlocked: true,
      level: 3,
      maxLevel: 5,
      recommendedLevel: 3,
      icon: '🌲',
      x: 40,
      y: 40,
    },
    {
      id: 'cave',
      name: 'Crystal Caves',
      description: 'Glowing crystals illuminate these dangerous caverns',
      discovered: true,
      unlocked: player ? player.level >= 5 : false,
      level: 5,
      maxLevel: 7,
      recommendedLevel: 5,
      icon: '⛰️',
      x: 60,
      y: 30,
    },
    {
      id: 'castle',
      name: 'Abandoned Castle',
      description: 'Once majestic, now haunted ruins',
      discovered: player ? player.level >= 7 : false,
      unlocked: player ? player.level >= 7 : false,
      level: 7,
      maxLevel: 10,
      recommendedLevel: 7,
      icon: '🏰',
      x: 75,
      y: 45,
    },
    {
      id: 'mountain',
      name: 'Dragon Peak',
      description: 'The highest mountain, home to ancient dragons',
      discovered: player ? player.level >= 10 : false,
      unlocked: player ? player.level >= 10 : false,
      level: 10,
      maxLevel: 15,
      recommendedLevel: 10,
      icon: '🗻',
      x: 85,
      y: 20,
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

    // Show level selector for locations with multiple floors
    if (location.maxLevel > 1) {
      setSelectedLocation(location);
      setShowLevelSelector(true);
    } else {
      // Single level location, just travel
      setDungeonLevel(1);
      toast({
        title: 'Traveling...',
        description: `Heading to ${location.name}`,
      });
    }
  };

  const handleLevelSelect = (level: number) => {
    if (!selectedLocation || !player) return;
    
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
      <div className="relative w-full h-[400px] bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border-2 border-border overflow-hidden">
        {/* Path Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {locations.slice(0, -1).map((loc, i) => {
            const nextLoc = locations[i + 1];
            return (
              <motion.line
                key={`path-${loc.id}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: nextLoc.discovered ? 1 : 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                x1={`${loc.x}%`}
                y1={`${loc.y}%`}
                x2={`${nextLoc.x}%`}
                y2={`${nextLoc.y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            );
          })}
        </svg>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: location.discovered ? 1 : 0, opacity: location.discovered ? 1 : 0 }}
            transition={{ delay: index * 0.2 }}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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
