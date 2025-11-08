import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import MilestonesPage from '@/components/MilestonesPage';
import EventsPage from '@/components/EventsPage';
import ProgressionPage from '@/components/ProgressionPage';
import {
  ArrowLeft,
  User,
  Trophy,
  Coins,
  Package,
  MapPin,
  Target,
  Award,
  Calendar,
  TrendingUp,
  Sword,
  Shield,
  Heart,
  Zap,
  Star,
  Crown,
  Medal,
  Gift,
  BookOpen,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const {
    player,
    authUser,
    badges,
    unlockedEndings,
    milestones,
    dailyRewardsClaimed,
    loginStreak,
    progressionStats,
    collectionSets,
    codex,
    locationStats,
    setScreen,
  } = useGameStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'rewards' | 'milestones' | 'events' | 'progression'>('overview');

  // If no auth user, redirect to intro
  if (!authUser) {
    setScreen('intro');
    return null;
  }

  // Use player data if available, otherwise show empty stats for new users
  const playerName = player?.name || authUser.name || 'Adventurer';
  const playerLevel = player?.level || 1;
  const playerClass = player?.class || 'Unknown';
  const playerHealth = player?.health || 0;
  const playerMaxHealth = player?.maxHealth || 100;
  const playerXp = player?.xp || 0;
  const playerMaxXp = player?.maxXp || 100;
  const playerCoins = player?.coins || 0;
  const playerMana = player?.mana || 0;
  const playerMaxMana = player?.maxMana || 50;
  const playerDungeonLevel = player?.dungeonLevel || 1;
  const playerStats = player?.stats || {
    strength: 0,
    intelligence: 0,
    agility: 0,
    attack: 0,
    defense: 0,
  };

  const completedMilestones = milestones.filter((m) => m.completedAt).length;
  const completedCollections = collectionSets.filter((c) => c.completed).length;
  const totalEnemies = Object.keys(codex.enemies || {}).length;
  const totalLocations = Object.keys(locationStats).length;
  const totalItems = Object.keys(codex.items || {}).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setScreen('intro')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-4xl font-fantasy gold-shimmer text-glow flex items-center gap-3">
                  <User className="w-8 h-8" />
                  Player Profile
                </h1>
                <p className="text-muted-foreground mt-2">View your character details and progress</p>
              </div>
            </div>
          </div>

          {/* Character Overview Card */}
          <Card className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-fantasy text-primary">{playerName}</h2>
                    <Badge variant="secondary" className="mt-2">
                      Level {playerLevel} {playerClass}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Coins</p>
                      <p className="font-semibold">{playerCoins.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Badges</p>
                      <p className="font-semibold">{badges.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Endings</p>
                      <p className="font-semibold">{unlockedEndings.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Login Streak</p>
                      <p className="font-semibold">{loginStreak} days</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="text-sm font-semibold">
                      {playerXp} / {playerMaxXp}
                    </span>
                  </div>
                  <Progress value={playerMaxXp > 0 ? (playerXp / playerMaxXp) * 100 : 0} className="h-3" />
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="stats">
                <TrendingUp className="w-4 h-4 mr-2" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Trophy className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="milestones">
                <Target className="w-4 h-4 mr-2" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="progression">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progression
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sword className="w-5 h-5 text-primary" />
                    Combat Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Attack</span>
                      <span className="font-semibold">{playerStats.attack || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Defense</span>
                      <span className="font-semibold">{playerStats.defense || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Health</span>
                      <span className="font-semibold">{playerHealth} / {playerMaxHealth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mana</span>
                      <span className="font-semibold">{playerMana} / {playerMaxMana}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Attributes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      <span className="font-semibold">{playerStats.strength || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Intelligence</span>
                      <span className="font-semibold">{playerStats.intelligence || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Agility</span>
                      <span className="font-semibold">{playerStats.agility || 0}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Exploration
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Locations Discovered</span>
                      <span className="font-semibold">{totalLocations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dungeon Level</span>
                      <span className="font-semibold">Floor {playerDungeonLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Enemies Discovered</span>
                      <span className="font-semibold">{totalEnemies}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Collection
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items Collected</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Collections Completed</span>
                      <span className="font-semibold">{completedCollections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Milestones</span>
                      <span className="font-semibold">{completedMilestones} / {milestones.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressionStats && (
                  <>
                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-4">Combat Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Enemies Defeated</span>
                          <span className="font-semibold">{progressionStats.enemiesDefeated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Stories Completed</span>
                          <span className="font-semibold">{progressionStats.storiesCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Highest Level</span>
                          <span className="font-semibold">{progressionStats.highestLevel}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-4">Economy</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Coins Earned</span>
                          <span className="font-semibold">{progressionStats.coinsEarned.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Coins Spent</span>
                          <span className="font-semibold">{progressionStats.coinsSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Net Coins</span>
                          <span className="font-semibold">
                            {(progressionStats.coinsEarned - progressionStats.coinsSpent).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.length === 0 ? (
                    <div className="col-span-2 text-center py-16 text-muted-foreground">
                      <Trophy className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No achievements yet</p>
                      <p className="text-sm mt-2">Complete challenges to earn achievements!</p>
                    </div>
                  ) : (
                    badges.map((badge) => (
                      <Card key={badge.id} className="p-5 border-2 border-primary/30">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Award className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{badge.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                            {badge.unlockedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rewards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Daily Rewards
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Login Streak</span>
                      <span className="font-semibold">{loginStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rewards Claimed</span>
                      <span className="font-semibold">Day {dailyRewardsClaimed} / 7</span>
                    </div>
                    <Progress value={(dailyRewardsClaimed / 7) * 100} className="h-2 mt-2" />
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-primary" />
                    Milestone Rewards
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold">{completedMilestones} / {milestones.length}</span>
                    </div>
                    <Progress value={(completedMilestones / Math.max(milestones.length, 1)) * 100} className="h-2 mt-2" />
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Story Endings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Unlocked</span>
                      <span className="font-semibold">{unlockedEndings.length}</span>
                    </div>
                    {unlockedEndings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {unlockedEndings.slice(0, 3).map((ending) => (
                          <div key={ending.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <span className="text-lg">{ending.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{ending.title}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {ending.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <div className="h-[calc(100vh-400px)] overflow-auto">
                <MilestonesPage embedded={true} />
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="h-[calc(100vh-400px)] overflow-auto">
                <EventsPage embedded={true} />
              </div>
            </TabsContent>

            <TabsContent value="progression" className="mt-6">
              <div className="h-[calc(100vh-400px)] overflow-auto">
                <ProgressionPage embedded={true} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

