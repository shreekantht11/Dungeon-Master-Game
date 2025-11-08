import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Search, Sword, MapPin, Package, Users, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodexModalProps {
  open: boolean;
  onClose: () => void;
}

const CodexModal = ({ open, onClose }: CodexModalProps) => {
  const { codex } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'enemies' | 'locations' | 'items' | 'npcs' | 'lore'>('enemies');

  const getEntries = (type: keyof typeof codex) => {
    const entries = Object.entries(codex[type] || {});
    if (!searchQuery) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(([id, data]: [string, any]) =>
      (data.name || id).toLowerCase().includes(query) ||
      (data.description || '').toLowerCase().includes(query)
    );
  };

  const getProgress = (type: keyof typeof codex) => {
    const entries = Object.keys(codex[type] || {});
    // This would ideally come from a total count, but for now we'll use a placeholder
    const total = 50; // Placeholder
    return { current: entries.length, total, percentage: (entries.length / total) * 100 };
  };

  const renderEntryCard = (id: string, data: any, type: string) => {
    return (
      <Card key={id} className="p-4 border-2 border-border hover:border-primary/50 transition-all">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{data.name || id}</h4>
              {data.level && (
                <Badge variant="outline" className="mt-1">
                  Level {data.level}
                </Badge>
              )}
            </div>
            {data.rarity && (
              <Badge variant="secondary">{data.rarity}</Badge>
            )}
          </div>

          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}

          {data.stats && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.stats).map(([stat, value]: [string, any]) => (
                <Badge key={stat} variant="outline" className="text-xs">
                  {stat}: {value}
                </Badge>
              ))}
            </div>
          )}

          {data.timesEncountered !== undefined && (
            <div className="text-xs text-muted-foreground">
              Encountered: {data.timesEncountered} times
            </div>
          )}

          {data.discoveredAt && (
            <div className="text-xs text-muted-foreground">
              Discovered: {new Date(data.discoveredAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const tabIcons = {
    enemies: Sword,
    locations: MapPin,
    items: Package,
    npcs: Users,
    lore: BookOpen,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Codex
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search codex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(tabIcons).map(([key, Icon]) => {
                const progress = getProgress(key as keyof typeof codex);
                return (
                  <TabsTrigger key={key} value={key} className="capitalize">
                    <Icon className="w-4 h-4 mr-2" />
                    {key}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {progress.current}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.keys(tabIcons).map((type) => {
              const entries = getEntries(type as keyof typeof codex);
              const progress = getProgress(type as keyof typeof codex);

              return (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {progress.current} / {progress.total} discovered
                      </p>
                      <Progress value={progress.percentage} className="w-32 h-2" />
                    </div>

                    <ScrollArea className="h-[400px]">
                      {entries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'No results found' : 'No entries discovered yet'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {entries.map(([id, data]: [string, any]) =>
                            renderEntryCard(id, data, type)
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodexModal;

