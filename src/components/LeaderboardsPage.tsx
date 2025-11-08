import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Trophy, Medal, Users, Star, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaderboardsPage = () => {
  const {
    player,
    leaderboard,
    setLeaderboard,
    friends,
    setScreen,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('level');

  useEffect(() => {
    // Initialize mock leaderboard data if empty
    if (leaderboard.length === 0 && player) {
      const mockLeaderboard = [
        {
          rank: 1,
          playerId: 'player_1',
          name: 'Champion',
          score: 10000,
          level: 25,
          badgesCount: 15,
          isFriend: false,
        },
        {
          rank: 2,
          playerId: 'player_2',
          name: 'Hero',
          score: 8500,
          level: 22,
          badgesCount: 12,
          isFriend: false,
        },
        {
          rank: 3,
          playerId: player.name,
          name: player.name,
          score: 5000,
          level: player.level,
          badgesCount: 5,
          isFriend: false,
        },
        {
          rank: 4,
          playerId: 'player_3',
          name: 'Warrior',
          score: 4500,
          level: 18,
          badgesCount: 8,
          isFriend: false,
        },
        {
          rank: 5,
          playerId: 'player_4',
          name: 'Explorer',
          score: 4000,
          level: 15,
          badgesCount: 6,
          isFriend: false,
        },
      ];
      setLeaderboard(mockLeaderboard);
    }
  }, [leaderboard.length, player, setLeaderboard]);

  const categories = [
    { id: 'level', label: 'Highest Level', icon: TrendingUp },
    { id: 'coins', label: 'Most Coins', icon: Star },
    { id: 'enemies', label: 'Enemies Defeated', icon: Trophy },
    { id: 'locations', label: 'Locations', icon: Medal },
    { id: 'streak', label: 'Longest Streak', icon: Crown },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-500" />;
    return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">{rank}</span>;
  };

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
                onClick={() => setScreen('game')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2" />
                Back to Game
              </Button>
              <div>
                <h1 className="text-4xl font-fantasy gold-shimmer text-glow flex items-center gap-3">
                  <Trophy className="w-8 h-8" />
                  Leaderboards
                </h1>
                <p className="text-muted-foreground mt-2">Compete with other players</p>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <Card className="p-6">
                <div className="space-y-3">
                  {leaderboard.map((entry) => {
                    const isCurrentPlayer = entry.playerId === player?.name;
                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isCurrentPlayer
                            ? 'border-primary bg-primary/10'
                            : entry.rank <= 3
                            ? 'border-yellow-500/30 bg-yellow-500/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{entry.name}</span>
                              {isCurrentPlayer && (
                                <Badge variant="secondary" className="text-xs">You</Badge>
                              )}
                              {entry.isFriend && (
                                <Badge variant="outline" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Friend
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>Level {entry.level}</span>
                              <span>•</span>
                              <span>{entry.badgesCount} achievements</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{entry.score.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardsPage;

