import { format, parse, subMonths } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import type { AchievementStats } from "@/lib/analytics/achievements"
import { getMonthComparison, getSummaryMetrics } from "@/lib/analytics/summary"
import { selectExpensesForMonth, selectTotalForMonth } from "@/lib/store/selectors"
import type { Category, Expense } from "@/lib/types/finance"

export interface MonthlyWrapData {
  monthLabel: string
  total: number
  previousTotal: number
  deltaAmount: number
  transactionCount: number
  topCategory: {
    name: string
    amount: number
    emoji?: string
  } | null
  biggestChange: {
    name: string
    amount: number
    emoji?: string
  } | null
  largestExpense: {
    note: string
    amount: number
  } | null
  bestStreak: number
  unlockedCount: number
  headline: string
}

export function getMonthlyWrapData({
  achievementStats,
  categories,
  expenses,
  monthId,
}: {
  achievementStats: AchievementStats
  categories: Category[]
  expenses: Expense[]
  monthId: string
}): MonthlyWrapData {
  const monthDate = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const previousMonthId = format(subMonths(monthDate, 1), "yyyy-MM")
  const currentExpenses = selectExpensesForMonth(expenses, monthId)
  const summary = getSummaryMetrics({ categories, expenses, monthId })
  const comparison = getMonthComparison({
    categories,
    expenses,
    monthId,
    previousMonthId,
  })
  const largestExpense = [...currentExpenses].sort(
    (first, second) => second.amount - first.amount,
  )[0]
  const unlockedCount = achievementStats.achievements.filter(
    (achievement) => achievement.unlocked,
  ).length

  return {
    monthLabel: format(monthDate, "MMMM yyyy", { locale: idLocale }),
    total: summary.total,
    previousTotal: selectTotalForMonth(expenses, previousMonthId),
    deltaAmount: comparison.deltaAmount,
    transactionCount: summary.transactionCount,
    topCategory: summary.largestCategory
      ? {
          name: summary.largestCategory.categoryName,
          amount: summary.largestCategory.amount,
          emoji: summary.largestCategory.emoji,
        }
      : null,
    biggestChange: comparison.categories[0]
      ? {
          name: comparison.categories[0].categoryName,
          amount: comparison.categories[0].deltaAmount,
          emoji: comparison.categories[0].emoji,
        }
      : null,
    largestExpense: largestExpense
      ? {
          note: largestExpense.note ?? "Pengeluaran",
          amount: largestExpense.amount,
        }
      : null,
    bestStreak: achievementStats.streaks.longestLoggingStreak,
    unlockedCount,
    headline: getWrapHeadline({
      deltaAmount: comparison.deltaAmount,
      total: summary.total,
      unlockedCount,
    }),
  }
}

function getWrapHeadline({
  deltaAmount,
  total,
  unlockedCount,
}: {
  deltaAmount: number
  total: number
  unlockedCount: number
}): string {
  if (!total) {
    return "Bulan ini masih menunggu cerita pertama."
  }

  if (deltaAmount < 0) {
    return "Bulan ini lebih ramping dari bulan lalu."
  }

  if (unlockedCount >= 3) {
    return "Ritme catatan bulan ini mulai solid."
  }

  return "Bulan ini sudah punya pola yang bisa dibaca."
}
