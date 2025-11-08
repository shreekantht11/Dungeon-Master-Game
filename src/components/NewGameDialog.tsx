import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, User, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savePreview?: {
    name: string;
    level: number;
    class: string;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const NewGameDialog = ({ open, onOpenChange, savePreview, onConfirm, onCancel }: NewGameDialogProps) => {
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
          <DialogTitle className="text-2xl font-fantasy text-destructive flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Start New Game?
          </DialogTitle>
          <DialogDescription>
            Starting a new game will delete your previous save. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {savePreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4 border-2 border-destructive/30 bg-destructive/5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-destructive mb-2">This will be deleted:</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{savePreview.name}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span>Level {savePreview.level}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-muted text-xs">{savePreview.class}</span>
                </div>
                
              </div>
            </Card>
          </motion.div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 sm:flex-initial"
          >
            Start New Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGameDialog;

