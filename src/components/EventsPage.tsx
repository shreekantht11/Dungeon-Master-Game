import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Calendar, Clock, Gift, Trophy, Zap, Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const EventsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const { player, currentEvents, setCurrentEvents, setScreen } = useGameStore();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    // Initialize events if empty
    if (currentEvents.length === 0) {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const events: typeof currentEvents = [
        {
          id: 'event_double_xp',
          name: 'Double XP Weekend',
          description: 'Earn 2x experience from all activities!',
          type: 'double_xp',
          startDate: now.toISOString(),
          endDate: weekFromNow.toISOString(),
          rewards: { coins: 0 },
          active: true,
        },
        {
          id: 'event_treasure_hunt',
          name: 'Treasure Hunt',
          description: 'Find special treasure items hidden in locations',
          type: 'treasure_hunt',
          startDate: now.toISOString(),
          endDate: weekFromNow.toISOString(),
          rewards: { coins: 200, items: ['treasure_map'], exclusive: true },
          active: true,
        },
      ];
      setCurrentEvents(events);
    }
  }, [currentEvents.length, setCurrentEvents]);

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'double_xp':
        return Zap;
      case 'treasure_hunt':
        return Gift;
      case 'boss_rush':
        return Trophy;
      case 'collection':
        return Sparkles;
      case 'community':
        return Calendar;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'double_xp':
        return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 'treasure_hunt':
        return 'text-blue-500 border-blue-500 bg-blue-500/10';
      case 'boss_rush':
        return 'text-red-500 border-red-500 bg-red-500/10';
      case 'collection':
        return 'text-purple-500 border-purple-500 bg-purple-500/10';
      case 'community':
        return 'text-green-500 border-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 border-gray-500 bg-gray-500/10';
    }
  };

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
          {!embedded && (
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
                    <Calendar className="w-8 h-8" />
                    Weekly Events
                  </h1>
                  <p className="text-muted-foreground mt-2">Limited-time events with exclusive rewards</p>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              const timeRemaining = getTimeRemaining(event.endDate);
              const isActive = event.active && timeRemaining !== 'Ended';

              return (
                <Card
                  key={event.id}
                  className={`p-6 border-2 transition-all ${
                    isActive ? 'border-primary/50 bg-primary/5' : 'border-muted opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{event.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {event.rewards.exclusive && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                          Exclusive
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{event.description}</p>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {isActive ? `Ends in: ${timeRemaining}` : 'Event Ended'}
                      </span>
                    </div>

                    {event.rewards.coins && event.rewards.coins > 0 && (
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold">{event.rewards.coins} coins reward</span>
                      </div>
                    )}

                    {event.rewards.items && (
                      <div className="flex flex-wrap gap-2">
                        {event.rewards.items.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {isActive && (
                      <Button className="w-full" size="lg">
                        Participate
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {currentEvents.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-xl">No active events</p>
              <p className="text-sm mt-2">Check back soon for new events!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventsPage;

