import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, BookOpen, Play, GitBranch, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StoryReplayPage = () => {
  const {
    player,
    storyBranches,
    selectedBranch,
    setSelectedBranch,
    unlockedEndings,
    choiceHistory,
    setScreen,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'branches' | 'endings' | 'choices'>('branches');

  if (!player) {
    setScreen('game');
    return null;
  }

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
                  Story Replay
                </h1>
                <p className="text-muted-foreground mt-2">Explore different story paths and endings</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="branches">
                <GitBranch className="w-4 h-4 mr-2" />
                Story Branches
              </TabsTrigger>
              <TabsTrigger value="endings">
                <Trophy className="w-4 h-4 mr-2" />
                Endings ({unlockedEndings.length})
              </TabsTrigger>
              <TabsTrigger value="choices">
                <Play className="w-4 h-4 mr-2" />
                Choice History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="branches" className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {storyBranches.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <GitBranch className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No story branches saved yet</p>
                    <p className="text-sm mt-2">Complete stories to save branches</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storyBranches.map((branch) => (
                      <Card key={branch.id} className="p-5 border-2 border-border">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold">{branch.title}</h3>
                            {branch.ending && (
                              <Badge variant="secondary">{branch.ending}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{Math.floor(branch.playtime / 60)}m {branch.playtime % 60}s</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold">Key Choices:</p>
                            {branch.choices.slice(0, 3).map((choice, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">• {choice}</p>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedBranch(branch)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Replay Branch
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="endings" className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {unlockedEndings.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Trophy className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No endings unlocked yet</p>
                    <p className="text-sm mt-2">Make different choices to unlock endings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedEndings.map((ending) => (
                      <Card key={ending.id} className="p-5 border-2 border-primary/30">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{ending.title}</h3>
                              <Badge variant="outline" className="mt-1">
                                {ending.rarity}
                              </Badge>
                            </div>
                            <span className="text-2xl">{ending.icon}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{ending.description}</p>
                          {ending.unlockedAt && (
                            <p className="text-xs text-muted-foreground">
                              Unlocked: {new Date(ending.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="choices" className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {choiceHistory.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No choice history yet</p>
                    <p className="text-sm mt-2">Your choices will be tracked here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {choiceHistory.map((choice, idx) => (
                      <Card key={idx} className="p-4 border-2 border-border">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Turn {choice.turn}</span>
                            {choice.isMajor && (
                              <Badge variant="secondary" className="text-xs">Major</Badge>
                            )}
                          </div>
                          <p className="text-sm">{choice.choice}</p>
                          <p className="text-xs text-muted-foreground">{choice.consequence}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(choice.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default StoryReplayPage;

