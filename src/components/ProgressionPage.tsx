import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, TrendingUp, Clock, Sword, Package, MapPin, Trophy, Coins, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressionPage = ({ embedded = false }: { embedded?: boolean }) => {
  const {
    player,
    progressionStats,
    setProgressionStats,
    updateProgressionStats,
    gameState,
    locationStats,
    codex,
    badges,
    unlockedEndings,
    setScreen,
  } = useGameStore();

  useEffect(() => {
    // Initialize or update progression stats
    if (player) {
      const stats = {
        totalPlaytime: progressionStats?.totalPlaytime || 0,
        storiesCompleted: progressionStats?.storiesCompleted || gameState.turnCount || 0,
        enemiesDefeated: progressionStats?.enemiesDefeated || gameState.combatEncounters || 0,
        itemsCollected: progressionStats?.itemsCollected || Object.keys(codex.items || {}).length || 0,
        locationsDiscovered: progressionStats?.locationsDiscovered || Object.keys(locationStats).length || 1,
        achievementsUnlocked: progressionStats?.achievementsUnlocked || badges.length || 0,
        coinsEarned: progressionStats?.coinsEarned || 0,
        coinsSpent: progressionStats?.coinsSpent || 0,
        highestLevel: progressionStats?.highestLevel || player.level || 1,
        lastUpdated: new Date().toISOString(),
      };
      setProgressionStats(stats);
    }
  }, [player, gameState, locationStats, codex, badges, progressionStats, setProgressionStats]);

  if (!player || !progressionStats) {
    return null;
  }

  const stats = [
    {
      icon: Clock,
      label: 'Total Playtime',
      value: `${Math.floor(progressionStats.totalPlaytime / 60)}h ${progressionStats.totalPlaytime % 60}m`,
      color: 'text-blue-500',
    },
    {
      icon: BookOpen,
      label: 'Stories Completed',
      value: progressionStats.storiesCompleted.toString(),
      color: 'text-purple-500',
    },
    {
      icon: Sword,
      label: 'Enemies Defeated',
      value: progressionStats.enemiesDefeated.toString(),
      color: 'text-red-500',
    },
    {
      icon: Package,
      label: 'Items Collected',
      value: progressionStats.itemsCollected.toString(),
      color: 'text-yellow-500',
    },
    {
      icon: MapPin,
      label: 'Locations Discovered',
      value: progressionStats.locationsDiscovered.toString(),
      color: 'text-green-500',
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: progressionStats.achievementsUnlocked.toString(),
      color: 'text-orange-500',
    },
    {
      icon: Coins,
      label: 'Coins Earned',
      value: progressionStats.coinsEarned.toLocaleString(),
      color: 'text-yellow-600',
    },
    {
      icon: Target,
      label: 'Highest Level',
      value: progressionStats.highestLevel.toString(),
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          {!embedded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setScreen('game')}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-2" />
                  Back to Game
                </Button>
                <div>
                  <h1 className="text-4xl font-fantasy gold-shimmer text-glow flex items-center gap-3">
                    <TrendingUp className="w-8 h-8" />
                    Progression Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2">Track your adventure progress</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4 border-2 border-border">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detailed Sections */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="exploration">Exploration</TabsTrigger>
              <TabsTrigger value="collection">Collection</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Level Progress</span>
                      <span>Level {player.level}</span>
                    </div>
                    <Progress value={(player.xp / player.maxXp) * 100} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Story Completion</span>
                      <span>{unlockedEndings.length} endings unlocked</span>
                    </div>
                    <Progress value={(unlockedEndings.length / 10) * 100} className="h-3" />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="combat" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Combat Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Enemies Defeated</span>
                    <span className="font-semibold">{progressionStats.enemiesDefeated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Combat Encounters</span>
                    <span className="font-semibold">{gameState.combatEncounters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Combat Escapes</span>
                    <span className="font-semibold">{gameState.combatEscapes}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="exploration" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Exploration Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Locations Discovered</span>
                    <span className="font-semibold">{progressionStats.locationsDiscovered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dungeon Floors Cleared</span>
                    <span className="font-semibold">{player.dungeonLevel}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="collection" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Collection Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items Collected</span>
                    <span className="font-semibold">{progressionStats.itemsCollected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enemies Discovered</span>
                    <span className="font-semibold">{Object.keys(codex.enemies || {}).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievements</span>
                    <span className="font-semibold">{progressionStats.achievementsUnlocked}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressionPage;

