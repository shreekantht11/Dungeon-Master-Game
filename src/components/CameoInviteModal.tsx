import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGameStore } from '@/store/gameStore';
import { api } from '@/services/api';
import { Copy, Hourglass, Share2, Sparkles } from 'lucide-react';

interface CameoInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPIRY_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '2 hours', value: 120 },
  { label: '6 hours', value: 360 },
  { label: '1 day', value: 1440 },
];

const CameoInviteModal = ({ open, onOpenChange }: CameoInviteModalProps) => {
  const player = useGameStore((state) => state.player);
  const { toast } = useToast();
  const [expiresIn, setExpiresIn] = useState<number>(120);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!player) {
      toast({ title: 'Create a character first', description: 'Start your adventure before inviting friends.' });
      return;
    }

    setIsGenerating(true);
    try {
      const payload = await api.createCameoInvite({
        playerId: player.name,
        cameoPlayer: player,
        personalMessage: message || undefined,
        expiresInMinutes: expiresIn,
      });
      setInviteCode(payload.code);
      setExpiresAt(payload.expiresAt);
      toast({ title: 'Cameo invite ready!', description: 'Share the code with your friend to bring them into the tale.' });
    } catch (error: any) {
      const detail = error?.message || 'Unable to create invite';
      toast({ title: 'Invite failed', description: detail, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
  };

  const resetState = () => {
    setMessage('');
    setInviteCode(null);
    setExpiresAt(null);
    setExpiresIn(120);
    setIsGenerating(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetState();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl border-primary/40 bg-background/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-fantasy">
            <Share2 className="h-5 w-5 text-primary" /> Invite a Friend
          </DialogTitle>
          <DialogDescription>
            Craft a cameo scroll so another hero can join your story for a limited time.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
        >
          <section className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Message</h3>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Optional note for your guest adventurer..."
                className="min-h-[120px]"
                aria-label="Personal message for invite"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Hourglass className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Invite expires in</span>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={expiresIn === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExpiresIn(option.value)}
                    className="rounded-full"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
              {isGenerating ? 'Summoning...' : 'Generate Invite Code'}
            </Button>
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-primary">
                <Sparkles className="h-5 w-5" /> Invite Scroll
              </h3>
              {inviteCode ? (
                <div className="space-y-3" aria-live="polite">
                  <div className="rounded-2xl border border-primary/40 bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-primary">
                    {inviteCode}
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
                    <Copy className="h-4 w-4" /> Copy Code
                  </Button>
                  {expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires at {new Date(expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-primary/30 bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
                  Generate a code to share. When your friend enters it, their hero will appear as a cameo in your saga.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p>• The cameo hero will accompany you for the current chapter.</p>
              <p>• Codes are one-time use. Send a new invite for future sessions.</p>
              <p>• Keep the code secret—only share with trusted allies.</p>
            </div>
          </section>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CameoInviteModal;


