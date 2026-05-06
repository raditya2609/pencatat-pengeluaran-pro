import {
  CalendarCheck,
  Flame,
  Medal,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Trophy,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import type {
  AchievementBadge,
  StreakStats,
} from "@/lib/analytics/achievements"
import type { Achievement } from "@/lib/types/finance"
import { cn } from "@/lib/utils/cn"

interface AchievementPanelProps {
  achievements: AchievementBadge[]
  persistedAchievements: Achievement[]
  streaks: StreakStats
  compact?: boolean
}

const icons = {
  CalendarCheck,
  Flame,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} satisfies Record<string, typeof Trophy>

export function AchievementPanel({
  achievements,
  compact = false,
  persistedAchievements,
  streaks,
}: AchievementPanelProps) {
  const persistedMap = new Map(
    persistedAchievements.map((achievement) => [achievement.id, achievement]),
  )
  const mergedAchievements = achievements.map((achievement) => ({
    ...achievement,
    unlocked: achievement.unlocked || Boolean(persistedMap.get(achievement.id)),
    unlockedAt: persistedMap.get(achievement.id)?.unlockedAt,
  }))
  const unlockedCount = mergedAchievements.filter(
    (achievement) => achievement.unlocked,
  ).length
  const visibleAchievements = compact
    ? mergedAchievements.slice(0, 4)
    : mergedAchievements

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Trophy aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-secondary">
            Streak & Achievement
          </p>
          <h3 className="mt-1 text-xl font-bold text-primary">
            {unlockedCount} dari {mergedAchievements.length} badge unlocked
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-80">
          <StreakMetric
            label="Streak"
            value={`${streaks.currentLoggingStreak}h`}
          />
          <StreakMetric
            label="Terbaik"
            value={`${streaks.longestLoggingStreak}h`}
          />
          <StreakMetric label="Hemat" value={`${streaks.noSpendStreak}h`} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleAchievements.map((achievement) => (
          <AchievementBadgeCard
            achievement={achievement}
            key={achievement.id}
          />
        ))}
      </div>
    </Card>
  )
}

function StreakMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <p className="font-mono text-xl font-bold tabular-nums text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-tertiary">{label}</p>
    </div>
  )
}

function AchievementBadgeCard({
  achievement,
}: {
  achievement: AchievementBadge & { unlockedAt?: string }
}) {
  const Icon = icons[achievement.badgeIcon as keyof typeof icons] ?? Medal
  const progress =
    achievement.target > 0
      ? Math.min(100, (achievement.progress / achievement.target) * 100)
      : 0

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        achievement.unlocked
          ? "border-accent/40 bg-accent-soft"
          : "border-border bg-background",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            achievement.unlocked
              ? "bg-accent text-white"
              : "bg-surface text-tertiary",
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-primary">{achievement.name}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                achievement.unlocked
                  ? "bg-accent text-white"
                  : "bg-surface text-tertiary",
              )}
            >
              {achievement.unlocked ? "Unlocked" : "Proses"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-secondary">
            {achievement.description}
          </p>
        </div>
      </div>

      {!achievement.unlocked ? (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-tertiary">
            {Math.floor(achievement.progress)} / {achievement.target}
          </p>
        </>
      ) : null}
    </div>
  )
}
