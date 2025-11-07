import { useState, useMemo } from 'react';
import { Badge as BadgeRecord } from '@/store/gameStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Compass, Puzzle, Gem, Lock, Award, Sword, Users, Zap, Star, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

type BadgeCategory = 'all' | 'combat' | 'exploration' | 'puzzle' | 'social';

const BADGE_LIBRARY: Record<string, { title: string; description: string; icon: string; category: BadgeCategory }> = {
  trailblazer: {
    title: 'Trailblazer',
    description: 'Discover a new and notable location in the realm.',
    icon: 'compass',
    category: 'exploration',
  },
  puzzle_master: {
    title: 'Puzzle Master',
    description: 'Solve a mind-bending puzzle set by the ancients.',
    icon: 'puzzle',
    category: 'puzzle',
  },
  treasure_seeker: {
    title: 'Treasure Seeker',
    description: 'Unearth a rare or legendary artifact.',
    icon: 'gem',
    category: 'exploration',
  },
  finale_champion: {
    title: 'Finale Champion',
    description: 'Conclude the grand quest and earn eternal glory.',
    icon: 'trophy',
    category: 'puzzle',
  },
  warrior: {
    title: 'Warrior',
    description: 'Defeat your first enemy in combat.',
    icon: 'sword',
    category: 'combat',
  },
  social_butterfly: {
    title: 'Social Butterfly',
    description: 'Invite a friend to join your adventure.',
    icon: 'users',
    category: 'social',
  },
  arcade_initiate: {
    title: 'Arcade Initiate',
    description: 'Win your first arcade puzzle challenge.',
    icon: 'sparkles',
    category: 'puzzle',
  },
  arcade_speed_runner: {
    title: 'Speed Runner',
    description: 'Clear an arcade puzzle with blazing speed.',
    icon: 'zap',
    category: 'puzzle',
  },
  arcade_perfectionist: {
    title: 'Perfectionist',
    description: 'Solve an arcade puzzle without using hints.',
    icon: 'star',
    category: 'puzzle',
  },
  arcade_master: {
    title: 'Arcade Master',
    description: 'Complete every challenge in the arcade.',
    icon: 'laurel',
    category: 'puzzle',
  },
};

const ICON_MAP = {
  trophy: Trophy,
  compass: Compass,
  puzzle: Puzzle,
  gem: Gem,
  sword: Sword,
  users: Users,
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  laurel: Medal,
};

interface TrophyRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badges: BadgeRecord[];
}

const formatEarnedAt = (value?: string) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const TrophyRoom = ({ open, onOpenChange, badges }: TrophyRoomProps) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('all');
  const badgeMap = new Map((badges || []).map((badge) => [badge.id, badge]));
  
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.entries(BADGE_LIBRARY);
    }
    return Object.entries(BADGE_LIBRARY).filter(([_, meta]) => meta.category === selectedCategory);
  }, [selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<BadgeCategory, { unlocked: number; total: number }> = {
      all: { unlocked: 0, total: 0 },
      combat: { unlocked: 0, total: 0 },
      exploration: { unlocked: 0, total: 0 },
      puzzle: { unlocked: 0, total: 0 },
      social: { unlocked: 0, total: 0 },
    };

    Object.entries(BADGE_LIBRARY).forEach(([id, meta]) => {
      stats.all.total++;
      stats[meta.category].total++;
      if (badgeMap.has(id)) {
        stats.all.unlocked++;
        stats[meta.category].unlocked++;
      }
    });

    return stats;
  }, [badgeMap]);

  const unlockedCount = badges?.length ?? 0;
  const totalCount = Object.keys(BADGE_LIBRARY).length;
  const currentCategoryProgress = categoryStats[selectedCategory];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-primary/30 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fantasy">
            <Trophy className="w-6 h-6 text-primary" /> Trophy Gallery
          </DialogTitle>
          <DialogDescription>
            Celebrate your greatest feats and uncover the secrets that remain hidden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mb-4">
          {/* Overall Progress */}
          <div className="rounded-xl border border-primary/20 bg-background/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-lg">{unlockedCount} / {totalCount} Badges Unlocked</span>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Each badge marks a defining moment of your legend.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'combat', 'exploration', 'puzzle', 'social'] as BadgeCategory[]).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All' : category}
                {category !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({categoryStats[category].unlocked}/{categoryStats[category].total})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Category Progress */}
          {selectedCategory !== 'all' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold capitalize">{selectedCategory} Badges</span>
                <span className="text-muted-foreground">
                  {currentCategoryProgress.unlocked} / {currentCategoryProgress.total}
                </span>
              </div>
              <Progress 
                value={(currentCategoryProgress.unlocked / currentCategoryProgress.total) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredBadges.map(([id, meta]) => {
              const isUnlocked = badgeMap.has(id);
              const badge = badgeMap.get(id);
              const Icon = ICON_MAP[meta.icon as keyof typeof ICON_MAP] ?? Award;

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isUnlocked ? 0 : 0.1 }}
                >
                  <Card
                    className={`relative overflow-hidden border-2 transition-all duration-300 ${
                      isUnlocked
                        ? 'border-primary/60 bg-primary/10 shadow-[0_10px_40px_-15px_rgba(255,215,0,0.6)]'
                        : 'border-border/50 bg-muted/20'
                    }`}
                  >
                    {isUnlocked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 animate-pulse" />
                    )}
                    <div className="relative flex gap-4 p-5">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                          isUnlocked ? 'border-primary bg-primary/20 text-primary-foreground' : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className={`text-lg font-semibold ${isUnlocked ? 'text-primary-foreground drop-shadow-sm' : ''}`}>
                            {meta.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
                        </div>
                        {isUnlocked ? (
                          <p className="text-xs text-primary/80 font-medium">
                            Earned {formatEarnedAt(badge?.earnedAt)}
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                            <Lock className="w-3 h-3" /> Locked
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TrophyRoom;

