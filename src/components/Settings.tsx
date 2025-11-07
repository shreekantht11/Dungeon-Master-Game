import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Volume2, Music, Languages } from 'lucide-react';

const Settings = () => {
  const {
    language,
    textSpeed,
    soundEnabled,
    musicEnabled,
    updateSettings,
    setScreen,
    gameStarted,
  } = useGameStore();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => setScreen(gameStarted ? 'game' : 'intro')}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>

          <h1 className="text-5xl font-fantasy gold-shimmer text-glow mb-8">
            Settings
          </h1>

          <Card className="panel-glow bg-card/95 border-2 border-primary/30 p-8 space-y-8">
            {/* Language */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Languages className="w-6 h-6 text-primary" />
                <Label className="text-xl font-elegant">Language</Label>
              </div>
              <div className="flex gap-3">
                {(['English', 'Kannada', 'Telugu'] as const).map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? 'default' : 'outline'}
                    onClick={() => updateSettings({ language: lang })}
                    className="flex-1"
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Speed */}
            <div className="space-y-4">
              <Label className="text-xl font-elegant">Text Speed</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">Slow</span>
                <Slider
                  value={[textSpeed]}
                  onValueChange={([value]) => updateSettings({ textSpeed: value })}
                  min={10}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">Fast</span>
              </div>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-primary" />
                <Label className="text-xl font-elegant">Sound Effects</Label>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>

            {/* Background Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-6 h-6 text-primary" />
                <Label className="text-xl font-elegant">Background Music</Label>
              </div>
              <Switch
                checked={musicEnabled}
                onCheckedChange={(checked) => updateSettings({ musicEnabled: checked })}
              />
            </div>

            {/* Info */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground font-elegant text-center">
                Settings are automatically saved to your browser
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
