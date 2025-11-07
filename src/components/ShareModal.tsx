import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Copy, Download, Twitter, Facebook, ScrollText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from 'react-i18next';
import AdventureScrollRenderer from '@/components/AdventureScrollRenderer';
import { toPng } from 'html-to-image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const player = useGameStore((state) => state.player);
  const storyLog = useGameStore((state) => state.storyLog);
  const badges = useGameStore((state) => state.badges);
  const activeQuest = useGameStore((state) => state.activeQuests[0]);

  const adventureRef = useRef<HTMLDivElement>(null);
  const [exportWindow, setExportWindow] = useState<'recent5' | 'recent10' | 'full'>('recent5');
  const [exporting, setExporting] = useState(false);

  if (!isOpen || !player) return null;

  const shareText = useMemo(() => {
    const recentStory = storyLog.slice(-3).map((e) => e.text).join('\n\n');
    return `🎮 Playing AI Dungeon Master as ${player.name}, Level ${player.level} ${player.class}!\n\n${recentStory}\n\n#AIDungeonMaster #TextAdventure`;
  }, [storyLog, player]);

  const exportEntries = useMemo(() => {
    if (!storyLog.length) return [] as typeof storyLog;
    const limit = exportWindow === 'recent5' ? 5 : exportWindow === 'recent10' ? 10 : storyLog.length;
    const sliced = storyLog.slice(-limit);
    return sliced.length > 0 ? sliced : storyLog.slice(-1);
  }, [storyLog, exportWindow]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    toast({ title: 'Copied!', description: 'Adventure text copied to clipboard' });
  };

  const handleDownloadLog = () => {
    const fullLog = storyLog
      .map((e) => `[${new Date(e.timestamp).toLocaleString()}] ${e.text}`)
      .join('\n\n');
    const blob = new Blob([fullLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-log-${player.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Adventure log saved as text' });
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleExportScroll = async () => {
    if (!adventureRef.current) {
      toast({ title: 'Nothing to export', description: 'Play a little longer to generate your saga.', variant: 'destructive' });
      return;
    }
    if (!exportEntries.length) {
      toast({ title: 'No events yet', description: 'Make a choice and try again!', variant: 'destructive' });
      return;
    }

    setExporting(true);
    try {
      const dataUrl = await toPng(adventureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `gilded-scroll-${player.name}.png`;
      link.click();
      toast({ title: 'Scroll exported!', description: 'Your illustrated parchment has been saved as an image.' });
    } catch (error) {
      console.error('Failed to export scroll', error);
      toast({ title: 'Export failed', description: 'Unable to render the scroll. Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-5xl gap-8 rounded-3xl border-2 border-primary/40 bg-card/95 p-8 shadow-2xl md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <section className="space-y-6">
          <header className="flex items-center gap-3">
            <Share2 className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Share Your Adventure</h2>
              <p className="text-sm text-muted-foreground">
                Craft the perfect caption or export your entire log for fellow adventurers.
              </p>
            </div>
          </header>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              {t('game.sharePreview') || 'Share Preview'}
            </label>
            <Textarea value={shareText} readOnly className="min-h-[160px] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCopyToClipboard} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" /> Copy Text
            </Button>
            <Button onClick={handleDownloadLog} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download Log
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleShareTwitter} className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Twitter className="h-4 w-4" /> Share on Twitter
            </Button>
            <Button onClick={handleShareFacebook} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Facebook className="h-4 w-4" /> Share on Facebook
            </Button>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-3xl text-white">
                {player.class === 'Warrior' ? '⚔️' : player.class === 'Mage' ? '🧙' : '🗡️'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{player.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Level {player.level} {player.class} • {player.health}/{player.maxHealth} HP
                </p>
                <p className="text-xs text-primary font-semibold">
                  🏆 XP: {player.xp}/{player.maxXp}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Illustrated Scroll Export</h3>
            </div>
            <div className="flex gap-2">
              {([
                { value: 'recent5', label: 'Last 5' },
                { value: 'recent10', label: 'Last 10' },
                { value: 'full', label: 'Full Log' },
              ] as const).map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={exportWindow === option.value ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setExportWindow(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Capture your recent deeds on parchment with a single click. Perfect for social posts or keepsakes.
          </p>

          <div className="overflow-hidden rounded-3xl border border-amber-700/50 bg-amber-100/40 p-3">
            {exportEntries.length > 0 ? (
              <div className="flex justify-center">
                <AdventureScrollRenderer
                  ref={adventureRef}
                  player={player}
                  entries={exportEntries}
                  badges={badges}
                  questTitle={activeQuest?.title}
                  questProgress={activeQuest?.progress}
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Make a few choices to unlock your first chronicle scroll.
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExportScroll} className="gap-2" disabled={exporting || exportEntries.length === 0}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Rendering...' : 'Download Scroll'}
            </Button>
            <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" /> Copy Caption
            </Button>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
