import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Volume2, Music, Languages, Accessibility, Save, Trash2, Download, Upload, Type, Eye, Move } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

const Settings = () => {
  const {
    language,
    textSpeed,
    soundEnabled,
    musicEnabled,
    updateSettings,
    setScreen,
    player,
    gameState,
    authUser,
  } = useGameStore();
  
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saves, setSaves] = useState<any[]>([]);
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [editingSaveName, setEditingSaveName] = useState('');

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) setFontSize(Number(savedFontSize));
    const savedHighContrast = localStorage.getItem('highContrast');
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [fontSize, highContrast, reducedMotion]);

  useEffect(() => {
    loadSaves();
  }, [authUser?.name]);

  const loadSaves = async () => {
    if (!authUser?.name) return;
    try {
      const playerSaves = await api.getSaves(authUser.name);
      setSaves(playerSaves || []);
    } catch (e) {
      console.error('Failed to load saves', e);
    }
  };

  const handleRenameSave = async (saveId: string) => {
    if (!editingSaveName.trim()) return;
    try {
      await api.renameSave(saveId, editingSaveName.trim());
      toast.success('Save renamed');
      setEditingSaveId(null);
      setEditingSaveName('');
      loadSaves();
    } catch (e) {
      toast.error('Failed to rename save');
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    if (!confirm('Are you sure you want to delete this save?')) return;
    try {
      await api.deleteSave(saveId);
      toast.success('Save deleted');
      loadSaves();
    } catch (e) {
      toast.error('Failed to delete save');
    }
  };

  const handleExportSave = async (save: any) => {
    try {
      const loaded = await api.loadGame(save._id);
      const dataStr = JSON.stringify(loaded, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${save.name || 'save'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Save exported');
    } catch (e) {
      toast.error('Failed to export save');
    }
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Import logic would go here - you'd need to create a save from the imported data
        toast.success('Save imported (feature in development)');
      } catch (e) {
        toast.error('Failed to import save');
      }
    };
    input.click();
  };

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
            onClick={() => {
              // Only go back to game if there's an active game session
              // Check if player exists and game is initialized
              if (player && gameState.isInitialized) {
                setScreen('game');
              } else {
                setScreen('intro');
              }
            }}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>

          <h1 className="text-5xl font-fantasy gold-shimmer text-glow mb-8">
            Settings
          </h1>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="saves">Save Management</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
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
            </TabsContent>

            <TabsContent value="accessibility">
              <Card className="panel-glow bg-card/95 border-2 border-primary/30 p-8 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Accessibility className="w-6 h-6 text-primary" />
                  <Label className="text-xl font-elegant">Accessibility Options</Label>
                </div>

                {/* Font Size */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-elegant">Font Size</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">Small</span>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([value]) => {
                        setFontSize(value);
                        localStorage.setItem('fontSize', String(value));
                        document.documentElement.style.fontSize = `${value}px`;
                      }}
                      min={12}
                      max={24}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-16">Large</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Current: {fontSize}px</p>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-elegant">High Contrast Mode</Label>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={(checked) => {
                      setHighContrast(checked);
                      localStorage.setItem('highContrast', String(checked));
                      if (checked) {
                        document.documentElement.classList.add('high-contrast');
                      } else {
                        document.documentElement.classList.remove('high-contrast');
                      }
                    }}
                  />
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Move className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-elegant">Reduce Motion</Label>
                  </div>
                  <Switch
                    checked={reducedMotion}
                    onCheckedChange={(checked) => {
                      setReducedMotion(checked);
                      localStorage.setItem('reducedMotion', String(checked));
                      if (checked) {
                        document.documentElement.classList.add('reduce-motion');
                      } else {
                        document.documentElement.classList.remove('reduce-motion');
                      }
                    }}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="saves">
              <Card className="panel-glow bg-card/95 border-2 border-primary/30 p-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Save className="w-6 h-6 text-primary" />
                    <Label className="text-xl font-elegant">Save Management</Label>
                  </div>
                  <Button variant="outline" onClick={handleImportSave} size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>

                {!authUser?.name ? (
                  <p className="text-muted-foreground text-center py-8">
                    Sign in to manage your saves
                  </p>
                ) : saves.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No saves found
                  </p>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {saves.map((save) => (
                        <div
                          key={save._id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            {editingSaveId === save._id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingSaveName}
                                  onChange={(e) => setEditingSaveName(e.target.value)}
                                  className="flex-1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameSave(save._id);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleRenameSave(save._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingSaveId(null);
                                    setEditingSaveName('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="font-semibold">{save.name || 'Unnamed Save'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {save.updatedAt
                                    ? new Date(save.updatedAt).toLocaleString()
                                    : 'Unknown date'}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {editingSaveId !== save._id && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingSaveId(save._id);
                                    setEditingSaveName(save.name || '');
                                  }}
                                >
                                  Rename
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleExportSave(save)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSave(save._id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
