import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Search, Sword, MapPin, Package, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const CodexPage = () => {
  const { codex, setScreen } = useGameStore();
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
      <Card key={id} className="p-5 border-2 border-border hover:border-primary/50 transition-all">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{data.name || id}</h4>
              {data.level && (
                <Badge variant="outline" className="mt-2">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setScreen('game')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2" />
                Back to Game
              </Button>
              <div>
                <h1 className="text-4xl font-fantasy gold-shimmer text-glow flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  Codex
                </h1>
                <p className="text-muted-foreground mt-2">Your encyclopedia of discoveries</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search codex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {Object.entries(tabIcons).map(([key, Icon]) => {
                const progress = getProgress(key as keyof typeof codex);
                return (
                  <TabsTrigger key={key} value={key} className="capitalize flex items-center gap-2">
                    <Icon className="w-4 h-4" />
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-semibold">
                        {progress.current} / {progress.total} discovered
                      </p>
                      <Progress value={progress.percentage} className="w-48 h-3" />
                    </div>

                    <ScrollArea className="h-[calc(100vh-400px)]">
                      {entries.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          {(() => {
                            const Icon = tabIcons[type as keyof typeof tabIcons];
                            return <Icon className="w-20 h-20 mx-auto mb-4 opacity-50" />;
                          })()}
                          <p className="text-xl">{searchQuery ? 'No results found' : 'No entries discovered yet'}</p>
                          <p className="text-sm mt-2">
                            {searchQuery ? 'Try a different search term' : 'Explore the world to discover new entries'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </motion.div>
      </div>
    </div>
  );
};

export default CodexPage;

