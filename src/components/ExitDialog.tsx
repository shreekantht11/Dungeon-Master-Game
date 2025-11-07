import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

interface ExitDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitDialog = ({ open, onConfirm, onCancel }: ExitDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="max-w-md border-destructive/40 bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-fantasy text-destructive">
            <LogOut className="w-5 h-5" /> Leave the Adventure?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your journey pauses here. Make sure you have saved before stepping away from the realm.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-destructive">
            <Shield className="w-4 h-4" />
            <span>Progress after your last save will be lost.</span>
          </div>
          <p>Return any time—your legend awaits.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="border-primary/40 hover:bg-primary/10">
            Stay in game
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            Exit to menu
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitDialog;
