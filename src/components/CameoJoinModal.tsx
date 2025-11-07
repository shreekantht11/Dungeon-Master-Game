import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useGameStore, CameoEntry } from '@/store/gameStore';
import { BadgeCheck, UserPlus, ShieldCheck } from 'lucide-react';

interface CameoJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CameoJoinModal = ({ open, onOpenChange }: CameoJoinModalProps) => {
  const { toast } = useToast();
  const player = useGameStore((state) => state.player);
  const addCameo = useGameStore((state) => state.addCameo);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestCameo, setLatestCameo] = useState<CameoEntry | null>(null);

  const handleJoin = async () => {
    if (!player) {
      toast({ title: 'Create a hero first', description: 'Start your own journey before accepting cameos.' });
      return;
    }

    if (!inviteCode.trim()) {
      toast({ title: 'Enter a code', description: 'Paste the cameo code you received from a friend.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = await api.acceptCameoInvite({
        playerId: player.name,
        inviteCode: inviteCode.trim(),
      });

      if (payload?.cameo) {
        addCameo(payload.cameo);
        setLatestCameo(payload.cameo);
        toast({ title: 'Cameo joined!', description: `${payload.cameo.guest?.name ?? 'An ally'} is ready to assist you.` });
      }
      setInviteCode('');
    } catch (error: any) {
      const detail = error?.message || 'Failed to redeem code';
      toast({ title: 'Could not join', description: detail, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setInviteCode('');
      setLatestCameo(null);
      setLoading(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-primary/30 bg-background/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-fantasy">
            <UserPlus className="h-5 w-5 text-primary" /> Enter Cameo Code
          </DialogTitle>
          <DialogDescription>
            Redeem a friend’s invite to weave their hero into your quest line.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Cameo invite code</label>
            <Input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="E.g. X7P4Q9"
              maxLength={12}
              className="tracking-[0.4em] text-center text-lg"
              aria-label="Cameo invite code"
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? 'Summoning...' : 'Bring the cameo hero'}
          </Button>

          {latestCameo && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm" aria-live="polite">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <BadgeCheck className="h-4 w-4" /> Cameo added
              </div>
              <p className="text-base font-semibold text-foreground">{latestCameo.guest?.name ?? 'Unknown Hero'}</p>
              <p className="text-muted-foreground">
                From {latestCameo.hostPlayerId ?? 'a distant realm'} • status: {latestCameo.status ?? 'active'}
              </p>
              {latestCameo.message && (
                <p className="mt-2 italic text-sm text-muted-foreground">“{latestCameo.message}”</p>
              )}
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                <ShieldCheck className="h-3 w-3" /> Loyal companion secured
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Cameos fight beside you for this session. They respect the host’s choices but may chime in with flavorful dialogue.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CameoJoinModal;


