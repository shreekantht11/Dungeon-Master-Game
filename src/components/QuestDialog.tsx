import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Star, ArrowRight } from 'lucide-react';
interface QuestDialogProps {
  open: boolean;
  quest: any | null;
  genre: string;
  onStart: () => void;
}

const QuestDialog = ({ open, quest, genre, onStart }: QuestDialogProps) => {
  if (!quest) return null;

  const getGenreColor = () => {
    switch (genre) {
      case 'Fantasy':
        return 'from-amber-500 to-yellow-600';
      case 'Sci-Fi':
        return 'from-cyan-500 to-blue-600';
      case 'Mystery':
        return 'from-purple-500 to-indigo-600';
      case 'Mythical':
        return 'from-rose-500 to-pink-600';
      default:
        return 'from-primary to-primary/80';
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-sm border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy text-primary flex items-center gap-2">
            <Target className="w-6 h-6" />
            Your Quest Awaits
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mt-4"
        >
          {/* Quest Title */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">{quest.title}</h3>
              <Badge variant={quest.type === 'main' ? 'default' : 'secondary'} className="mb-2">
                {quest.type === 'main' ? 'Main Quest' : 'Side Quest'}
              </Badge>
            </div>
          </div>

          {/* Quest Description */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-foreground font-elegant leading-relaxed">{quest.description}</p>
          </div>

          {/* Objectives */}
          {quest.objectives && quest.objectives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Objectives
              </h4>
              <div className="space-y-2">
                {quest.objectives.map((obj: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{obj.text || obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards Preview */}
          {quest.rewards && (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
              <h4 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                Rewards
              </h4>
              <div className="flex flex-wrap gap-2">
                {quest.rewards.xp && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="w-3 h-3" /> {quest.rewards.xp} XP
                  </Badge>
                )}
                {quest.rewards.gold && (
                  <Badge variant="outline">💰 {quest.rewards.gold} Gold</Badge>
                )}
                {quest.rewards.items?.map((item: any, i: number) => {
                  const itemName = typeof item === 'string' ? item : (item?.name || item?.id || 'Item');
                  return (
                    <Badge key={i} variant="outline">{itemName}</Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={onStart}
              className={`bg-gradient-to-r ${getGenreColor()} hover:opacity-90 transition-opacity gap-2`}
              size="lg"
            >
              <span className="font-fantasy">Begin Adventure</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestDialog;

