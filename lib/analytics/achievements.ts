import {
  differenceInCalendarDays,
  format,
  parse,
  parseISO,
  subDays,
  subMonths,
} from "date-fns"

import { selectExpensesForMonth, selectTotalForMonth } from "@/lib/store/selectors"
import type { Achievement, Budget, Expense } from "@/lib/types/finance"

export interface AchievementBadge extends Achievement {
  unlocked: boolean
  progress: number
  target: number
}

export interface StreakStats {
  currentLoggingStreak: number
  longestLoggingStreak: number
  noSpendStreak: number
  activeDaysThisMonth: number
}

export interface AchievementStats {
  streaks: StreakStats
  achievements: AchievementBadge[]
}

interface AchievementInput {
  budgets: Budget[]
  expenses: Expense[]
  monthId: string
  today?: Date
}

export function getAchievementStats({
  budgets,
  expenses,
  monthId,
  today = new Date(),
}: AchievementInput): AchievementStats {
  const normalizedToday = parseISO(format(today, "yyyy-MM-dd"))
  const uniqueDates = getUniqueExpenseDates(expenses)
  const monthExpenses = selectExpensesForMonth(expenses, monthId)
  const previousMonthId = format(
    subMonths(parse(`${monthId}-01`, "yyyy-MM-dd", new Date()), 1),
    "yyyy-MM",
  )
  const currentTotal = selectTotalForMonth(expenses, monthId)
  const previousTotal = selectTotalForMonth(expenses, previousMonthId)
  const uniqueCategoriesThisMonth = new Set(
    monthExpenses.map((expense) => expense.categoryId),
  ).size
  const totalBudget = budgets.find(
    (budget) => budget.categoryId === "TOTAL" && budget.period === "monthly",
  )
  const totalBudgetUsage = totalBudget
    ? (currentTotal / totalBudget.amount) * 100
    : Number.POSITIVE_INFINITY
  const streaks = {
    currentLoggingStreak: getCurrentLoggingStreak(uniqueDates, normalizedToday),
    longestLoggingStreak: getLongestLoggingStreak(uniqueDates),
    noSpendStreak: getNoSpendStreak(uniqueDates, normalizedToday),
    activeDaysThisMonth: new Set(
      monthExpenses.map((expense) => expense.date),
    ).size,
  }

  return {
    streaks,
    achievements: [
      createBadge({
        id: "first-expense",
        name: "Transaksi Pertama",
        description: "Pengeluaran pertama sudah tercatat.",
        badgeIcon: "ReceiptText",
        progress: expenses.length,
        target: 1,
      }),
      createBadge({
        id: "three-day-streak",
        name: "Rutin 3 Hari",
        description: "Catat pengeluaran selama 3 hari beruntun.",
        badgeIcon: "Flame",
        progress: streaks.longestLoggingStreak,
        target: 3,
      }),
      createBadge({
        id: "seven-day-streak",
        name: "Konsisten 7 Hari",
        description: "Jaga streak pencatatan selama 7 hari.",
        badgeIcon: "CalendarCheck",
        progress: streaks.longestLoggingStreak,
        target: 7,
      }),
      createBadge({
        id: "budget-safe",
        name: "Budget Aman",
        description: "Bulan ini masih di bawah 80% anggaran total.",
        badgeIcon: "ShieldCheck",
        progress: totalBudget && monthExpenses.length && totalBudgetUsage <= 80 ? 1 : 0,
        target: totalBudget && monthExpenses.length ? 1 : 0,
      }),
      createBadge({
        id: "leaner-month",
        name: "Bulan Lebih Hemat",
        description: "Total bulan ini lebih rendah dari bulan lalu.",
        badgeIcon: "TrendingDown",
        progress:
          previousTotal > 0 && currentTotal > 0 && currentTotal < previousTotal
            ? 1
            : 0,
        target: 1,
      }),
      createBadge({
        id: "category-explorer",
        name: "Eksplorer Kategori",
        description: "Gunakan minimal 5 kategori dalam satu bulan.",
        badgeIcon: "Sparkles",
        progress: uniqueCategoriesThisMonth,
        target: 5,
      }),
    ],
  }
}

export function toUnlockedAchievements(
  achievements: AchievementBadge[],
): Achievement[] {
  return achievements
    .filter((achievement) => achievement.unlocked)
    .map(({ id, name, description, badgeIcon, unlockedAt }) => ({
      id,
      name,
      description,
      badgeIcon,
      unlockedAt,
    }))
}

function createBadge({
  badgeIcon,
  description,
  id,
  name,
  progress,
  target,
}: Omit<AchievementBadge, "unlocked">): AchievementBadge {
  const unlocked = target > 0 && progress >= target

  return {
    id,
    name,
    description,
    badgeIcon,
    progress,
    target,
    unlocked,
  }
}

function getUniqueExpenseDates(expenses: Expense[]): string[] {
  return Array.from(new Set(expenses.map((expense) => expense.date))).sort()
}

function getCurrentLoggingStreak(dates: string[], today: Date): number {
  const dateSet = new Set(dates)
  let cursor = dateSet.has(format(today, "yyyy-MM-dd")) ? today : subDays(today, 1)
  let streak = 0

  while (dateSet.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }

  return streak
}

function getNoSpendStreak(dates: string[], today: Date): number {
  if (!dates.length) {
    return 0
  }

  const dateSet = new Set(dates)
  let cursor = today
  let streak = 0

  while (!dateSet.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1
    cursor = subDays(cursor, 1)

    if (streak > 365) {
      return streak
    }
  }

  return streak
}

function getLongestLoggingStreak(dates: string[]): number {
  if (!dates.length) {
    return 0
  }

  let longest = 1
  let current = 1

  for (let index = 1; index < dates.length; index += 1) {
    const previous = parseISO(dates[index - 1]!)
    const next = parseISO(dates[index]!)

    if (differenceInCalendarDays(next, previous) === 1) {
      current += 1
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
  }

  return longest
}
