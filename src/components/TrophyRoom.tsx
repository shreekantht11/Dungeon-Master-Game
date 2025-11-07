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
import { Sparkles, Trophy, Compass, Puzzle, Gem, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_LIBRARY: Record<string, { title: string; description: string; icon: string }> = {
  trailblazer: {
    title: 'Trailblazer',
    description: 'Discover a new and notable location in the realm.',
    icon: 'compass',
  },
  puzzle_master: {
    title: 'Puzzle Master',
    description: 'Solve a mind-bending puzzle set by the ancients.',
    icon: 'puzzle',
  },
  treasure_seeker: {
    title: 'Treasure Seeker',
    description: 'Unearth a rare or legendary artifact.',
    icon: 'gem',
  },
  finale_champion: {
    title: 'Finale Champion',
    description: 'Conclude the grand quest and earn eternal glory.',
    icon: 'trophy',
  },
};

const ICON_MAP = {
  trophy: Trophy,
  compass: Compass,
  puzzle: Puzzle,
  gem: Gem,
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
  const badgeMap = new Map((badges || []).map((badge) => [badge.id, badge]));
  const unlockedCount = badges?.length ?? 0;
  const totalCount = Object.keys(BADGE_LIBRARY).length;

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

        <div className="rounded-xl border border-primary/20 bg-background/80 px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-semibold text-lg">{unlockedCount} / {totalCount} Badges Unlocked</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Each badge marks a defining moment of your legend.
          </p>
        </div>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(BADGE_LIBRARY).map(([id, meta]) => {
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

