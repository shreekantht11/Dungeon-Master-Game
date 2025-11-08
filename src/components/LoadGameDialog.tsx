import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Target, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savePreview: {
    name: string;
    level: number;
    class: string;
  };
  onLoad: () => void;
  onStartNew: () => void;
}

const LoadGameDialog = ({ open, onOpenChange, savePreview, onLoad, onStartNew }: LoadGameDialogProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy gold-shimmer">
            Game Found!
          </DialogTitle>
          <DialogDescription>
            We found an existing save for this player. Would you like to continue your adventure or start fresh?
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-4 border-2 border-primary/30 bg-primary/5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold">{savePreview.name}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Level {savePreview.level}</span>
                </div>
                <Badge variant="secondary">{savePreview.class}</Badge>
              </div>
              
            </div>
          </Card>
        </motion.div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onStartNew();
              onOpenChange(false);
            }}
            className="flex-1 sm:flex-initial"
          >
            Start New Game
          </Button>
          <Button
            onClick={() => {
              onLoad();
              onOpenChange(false);
            }}
            className="flex-1 sm:flex-initial"
          >
            Load Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoadGameDialog;

