import { forwardRef, HTMLAttributes } from 'react';
import type { Player, StoryEvent, Badge } from '@/store/gameStore';
import { Trophy, Compass, Puzzle, Gem, Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdventureScrollRendererProps = {
  player: Player;
  entries: StoryEvent[];
  badges: Badge[];
  questTitle?: string;
  questProgress?: number;
} & HTMLAttributes<HTMLDivElement>;

const BADGE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trailblazer: Compass,
  puzzle_master: Puzzle,
  treasure_seeker: Gem,
  finale_champion: Trophy,
};

const formatTimestamp = (value: Date) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  } catch (error) {
    return value.toString();
  }
};

const normalizeDate = (value: any) => {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  // If invalid date, fallback to now
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const AdventureScrollRenderer = forwardRef<HTMLDivElement, AdventureScrollRendererProps>(
  ({ player, entries, badges, questTitle, questProgress, className, ...props }, ref) => {
    const effectiveBadges = badges.slice(0, 6);

    return (
      <div
        ref={ref}
        className={cn(
          'w-[640px] rounded-3xl border-[6px] border-yellow-700/40 bg-[#f8f0d8] p-10 text-stone-900 shadow-[0_18px_45px_rgba(120,80,20,0.35)]',
          'relative overflow-hidden font-serif',
          className,
        )}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.45), transparent 60%), linear-gradient(135deg, rgba(255,240,200,0.9), rgba(245,226,180,0.92))',
        }}
        {...props}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-white/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-amber-900/10 via-transparent to-transparent" />
        </div>

        <header className="relative mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-800/70">Chronicles of</p>
            <h1 className="text-3xl font-bold tracking-wide text-amber-900">{player.name}</h1>
            <p className="text-sm text-amber-800/70">
              Level {player.level} {player.class} • {player.health}/{player.maxHealth} HP
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            {questTitle && (
              <div className="rounded-full border border-amber-900/40 bg-amber-50/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                {questTitle}
              </div>
            )}
            {questProgress !== undefined && (
              <div className="text-xs text-amber-700">
                Quest Progress: <span className="font-semibold">{Math.round(questProgress)}%</span>
              </div>
            )}
          </div>
        </header>

        {effectiveBadges.length > 0 && (
          <section className="relative mb-8 rounded-2xl border border-amber-600/50 bg-amber-100/60 px-4 py-3">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Honors & Laurels
            </h2>
            <div className="flex flex-wrap gap-3">
              {effectiveBadges.map((badge) => {
                const Icon = BADGE_ICON_MAP[badge.id] ?? Feather;
                return (
                  <div
                    key={badge.id}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-white/80 px-3 py-1 text-xs text-amber-800 shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold">{badge.title}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="relative rounded-3xl border border-amber-700/30 bg-white/85 p-6 shadow-inner">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Recent Deeds
          </h3>
          <ol className="space-y-4">
            {entries.map((entry) => {
              const timestamp = formatTimestamp(normalizeDate(entry.timestamp));
              const isCombat = entry.type === 'combat';
              const isStory = entry.type === 'story';
              const highlightClass = isCombat
                ? 'border-red-200/70 bg-red-50/60'
                : isStory
                ? 'border-amber-200/70 bg-amber-50/60'
                : 'border-emerald-200/70 bg-emerald-50/60';
              return (
                <li
                  key={entry.id}
                  className={cn(
                    'rounded-2xl border px-4 py-3 text-sm leading-relaxed text-amber-900 shadow-sm',
                    highlightClass,
                  )}
                >
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-amber-600">
                    <span>{timestamp}</span>
                    <span>{entry.type.replace('-', ' ')}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm font-medium">{entry.text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <footer className="relative mt-8 text-center text-xs uppercase tracking-[0.4em] text-amber-600">
          Chronicle rendered by Gilded Scrolls AI
        </footer>
      </div>
    );
  },
);

AdventureScrollRenderer.displayName = 'AdventureScrollRenderer';

export default AdventureScrollRenderer;

