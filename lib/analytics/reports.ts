import { addMonths, format, parse, subMonths } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { getCategorySpending } from "@/lib/analytics/summary"
import { selectExpensesForMonth } from "@/lib/store/selectors"
import type { Category, Expense } from "@/lib/types/finance"

export interface MonthlyTrendPoint {
  monthId: string
  label: string
  total: number
  movingAverage: number
}

export interface TopExpensePoint {
  id: string
  note: string
  categoryName: string
  date: string
  amount: number
}

export interface CategoryMovementPoint {
  categoryId: string
  categoryName: string
  emoji?: string
  color: string
  deltaAmount: number
  deltaPercent: number | null
  sparkline: number[]
}

export interface ReportData {
  monthlyTrend: MonthlyTrendPoint[]
  categoryComposition: ReturnType<typeof getCategorySpending>
  topExpenses: TopExpensePoint[]
  categoryMovements: CategoryMovementPoint[]
}

export function getReportData({
  categories,
  expenses,
  monthId,
  trendMonths = 6,
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
  trendMonths?: 6 | 12
}): ReportData {
  const currentMonthExpenses = selectExpensesForMonth(expenses, monthId)

  return {
    monthlyTrend: getMonthlyTrend(expenses, monthId, trendMonths),
    categoryComposition: getCategorySpending(currentMonthExpenses, categories),
    topExpenses: getTopExpenses(currentMonthExpenses, categories),
    categoryMovements: getCategoryMovements({
      categories,
      expenses,
      monthId,
    }),
  }
}

export function getMonthlyTrend(
  expenses: Expense[],
  monthId: string,
  count: 6 | 12,
): MonthlyTrendPoint[] {
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())

  return Array.from({ length: count }, (_, index) => {
    const date = addMonths(monthStart, index - count + 1)
    const currentMonthId = format(date, "yyyy-MM")
    const total = selectExpensesForMonth(expenses, currentMonthId).reduce(
      (sum, expense) => sum + expense.amount,
      0,
    )

    return {
      monthId: currentMonthId,
      label: format(date, "MMM yy", { locale: idLocale }),
      total,
      movingAverage: 0,
    }
  }).map((point, index, points) => {
    const window = points.slice(Math.max(0, index - 2), index + 1)

    return {
      ...point,
      movingAverage:
        window.reduce((sum, item) => sum + item.total, 0) / window.length,
    }
  })
}

export function getTopExpenses(
  expenses: Expense[],
  categories: Category[],
): TopExpensePoint[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  return [...expenses]
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 10)
    .map((expense) => ({
      id: expense.id,
      note: expense.note ?? "Pengeluaran",
      categoryName: categoryMap.get(expense.categoryId)?.name ?? "Tanpa kategori",
      date: expense.date,
      amount: expense.amount,
    }))
}

export function getCategoryMovements({
  categories,
  expenses,
  monthId,
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
}): CategoryMovementPoint[] {
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const months = [2, 1, 0].map((offset) =>
    format(subMonths(monthStart, offset), "yyyy-MM"),
  )
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const categoryIds = new Set(expenses.map((expense) => expense.categoryId))

  return Array.from(categoryIds)
    .map((categoryId) => {
      const sparkline = months.map((sparkMonthId) =>
        selectExpensesForMonth(expenses, sparkMonthId)
          .filter((expense) => expense.categoryId === categoryId)
          .reduce((sum, expense) => sum + expense.amount, 0),
      )
      const category = categoryMap.get(categoryId)
      const current = sparkline[2] ?? 0
      const previous = sparkline[1] ?? 0

      return {
        categoryId,
        categoryName: category?.name ?? "Tanpa kategori",
        emoji: category?.emoji,
        color: category?.color ?? "#6B6B70",
        deltaAmount: current - previous,
        deltaPercent: previous ? ((current - previous) / previous) * 100 : null,
        sparkline,
      }
    })
    .sort(
      (first, second) =>
        Math.abs(second.deltaAmount) - Math.abs(first.deltaAmount),
    )
    .slice(0, 6)
}
