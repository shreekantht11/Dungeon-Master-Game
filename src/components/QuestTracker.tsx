import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const QuestTracker = () => {
  const { t } = useTranslation();
  const activeQuests = useGameStore(state => state.activeQuests || []);
  const completedQuests = useGameStore(state => state.completedQuests || []);

  if (activeQuests.length === 0 && completedQuests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No active quests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Active Quests
          </h3>
          <div className="space-y-4">
              {activeQuests.map((quest: any, index: number) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-3 min-h-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{quest.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                    </div>
                    <Badge variant={quest.type === 'main' ? 'default' : 'secondary'}>
                      {quest.type === 'main' ? 'Main' : 'Side'}
                    </Badge>
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2">
                    {quest.objectives?.map((obj: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        {obj.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${obj.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {obj.text}
                        </span>
                        {obj.progress !== undefined && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {obj.current}/{obj.required}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {quest.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{quest.progress}%</span>
                      </div>
                      <Progress value={quest.progress} className="h-2" />
                    </div>
                  )}

                  {/* Rewards */}
                  {quest.rewards && (
                    <div className="flex gap-2 flex-wrap text-xs">
                      {quest.rewards.xp && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="w-3 h-3" /> {quest.rewards.xp} XP
                        </Badge>
                      )}
                      {quest.rewards.gold && (
                        <Badge variant="outline">💰 {quest.rewards.gold} Gold</Badge>
                      )}
                      {quest.rewards.items?.map((item: any, i: number) => {
                        // Handle both string and object formats
                        const itemName = typeof item === 'string' ? item : (item?.name || item?.id || 'Item');
                        return (
                          <Badge key={i} variant="outline">{itemName}</Badge>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5" />
            Completed ({completedQuests.length})
          </h3>
          <div className="space-y-2">
              {completedQuests.map((quest: any) => (
                <div
                  key={quest.id}
                  className="bg-muted/50 border border-border rounded-lg p-3 opacity-75"
                >
                  <p className="font-medium text-sm line-through">{quest.title}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestTracker;
