import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDate,
  isAfter,
  isBefore,
  parse,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns"

import type { Budget, Category, Expense } from "@/lib/types/finance"
import { selectExpensesForMonth, selectTotalForMonth } from "@/lib/store/selectors"

export interface CategorySpend {
  categoryId: string
  categoryName: string
  color: string
  emoji?: string
  amount: number
  percentage: number
}

export interface CategoryMonthComparison {
  categoryId: string
  categoryName: string
  color: string
  emoji?: string
  currentAmount: number
  previousAmount: number
  deltaAmount: number
  deltaPercent: number | null
}

export interface MonthComparison {
  currentMonthId: string
  previousMonthId: string
  currentTotal: number
  previousTotal: number
  deltaAmount: number
  deltaPercent: number | null
  categories: CategoryMonthComparison[]
}

export interface SummaryMetrics {
  total: number
  previousTotal: number
  deltaPercent: number | null
  largestCategory: CategorySpend | null
  transactionCount: number
  averageTransactionsPerDay: number
  averageTransactionAmount: number
  averageDailySpend: number
  projectedEndOfMonth: number
  daysWithoutSpending: number
  monthComparison: MonthComparison
}

export interface BudgetUsage {
  budget: Budget
  categoryName: string
  color: string
  emoji?: string
  spent: number
  remaining: number
  percentage: number
  status: "safe" | "watch" | "danger"
  alert: string
}

export function getSummaryMetrics({
  categories,
  expenses,
  monthId,
  today = new Date(),
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
  today?: Date
}): SummaryMetrics {
  const monthExpenses = selectExpensesForMonth(expenses, monthId)
  const total = selectTotalForMonth(expenses, monthId)
  const previousMonthId = format(
    subMonths(parse(`${monthId}-01`, "yyyy-MM-dd", new Date()), 1),
    "yyyy-MM",
  )
  const previousTotal = selectTotalForMonth(expenses, previousMonthId)
  const elapsedDays = getElapsedDaysInMonth(monthId, today)
  const monthComparison = getMonthComparison({
    categories,
    expenses,
    monthId,
    previousMonthId,
  })

  return {
    total,
    previousTotal,
    deltaPercent: getDeltaPercent(total, previousTotal),
    largestCategory: getLargestCategorySpend(monthExpenses, categories, total),
    transactionCount: monthExpenses.length,
    averageTransactionsPerDay: elapsedDays
      ? monthExpenses.length / elapsedDays
      : 0,
    averageTransactionAmount: monthExpenses.length
      ? total / monthExpenses.length
      : 0,
    averageDailySpend: elapsedDays ? total / elapsedDays : 0,
    projectedEndOfMonth: getProjectedEndOfMonth(total, monthId, today),
    daysWithoutSpending: getDaysWithoutSpending(monthExpenses, monthId, today),
    monthComparison,
  }
}

export function getMonthComparison({
  categories,
  expenses,
  monthId,
  previousMonthId,
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
  previousMonthId: string
}): MonthComparison {
  const currentExpenses = selectExpensesForMonth(expenses, monthId)
  const previousExpenses = selectExpensesForMonth(expenses, previousMonthId)
  const currentTotal = currentExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const previousTotal = previousExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const categoryIds = new Set([
    ...currentExpenses.map((expense) => expense.categoryId),
    ...previousExpenses.map((expense) => expense.categoryId),
  ])

  const categoryTotals = Array.from(categoryIds)
    .map((categoryId) => {
      const category = categoryMap.get(categoryId)
      const currentAmount = currentExpenses
        .filter((expense) => expense.categoryId === categoryId)
        .reduce((sum, expense) => sum + expense.amount, 0)
      const previousAmount = previousExpenses
        .filter((expense) => expense.categoryId === categoryId)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        categoryId,
        categoryName: category?.name ?? "Tanpa kategori",
        color: category?.color ?? "#6B6B70",
        emoji: category?.emoji,
        currentAmount,
        previousAmount,
        deltaAmount: currentAmount - previousAmount,
        deltaPercent: getDeltaPercent(currentAmount, previousAmount),
      }
    })
    .sort(
      (first, second) =>
        Math.abs(second.deltaAmount) - Math.abs(first.deltaAmount) ||
        second.currentAmount +
          second.previousAmount -
          (first.currentAmount + first.previousAmount),
    )

  return {
    currentMonthId: monthId,
    previousMonthId,
    currentTotal,
    previousTotal,
    deltaAmount: currentTotal - previousTotal,
    deltaPercent: getDeltaPercent(currentTotal, previousTotal),
    categories: categoryTotals,
  }
}

export function getCategorySpending(
  expenses: Expense[],
  categories: Category[],
): CategorySpend[] {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const totals = new Map<string, number>()

  expenses.forEach((expense) => {
    totals.set(
      expense.categoryId,
      (totals.get(expense.categoryId) ?? 0) + expense.amount,
    )
  })

  return Array.from(totals.entries())
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId)

      return {
        categoryId,
        categoryName: category?.name ?? "Tanpa kategori",
        color: category?.color ?? "#6B6B70",
        emoji: category?.emoji,
        amount,
        percentage: total ? (amount / total) * 100 : 0,
      }
    })
    .sort((first, second) => second.amount - first.amount)
}

export function getBudgetUsages({
  budgets,
  categories,
  expenses,
  monthId,
  thresholds = [50, 75, 90, 100],
}: {
  budgets: Budget[]
  categories: Category[]
  expenses: Expense[]
  monthId: string
  thresholds?: number[]
}): BudgetUsage[] {
  const monthExpenses = selectExpensesForMonth(expenses, monthId)
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return budgets.map((budget) => {
    const category = categoryMap.get(budget.categoryId)
    const spent =
      budget.categoryId === "TOTAL"
        ? totalSpent
        : monthExpenses
            .filter((expense) => expense.categoryId === budget.categoryId)
            .reduce((sum, expense) => sum + expense.amount, 0)
    const percentage = budget.amount ? (spent / budget.amount) * 100 : 0
    const status = getBudgetStatus(percentage, thresholds)

    return {
      budget,
      categoryName:
        budget.categoryId === "TOTAL"
          ? "Total Bulanan"
          : category?.name ?? "Tanpa kategori",
      color:
        status === "danger"
          ? "var(--danger)"
          : status === "watch"
            ? "var(--warning)"
            : "var(--success)",
      emoji: budget.categoryId === "TOTAL" ? "💳" : category?.emoji,
      spent,
      remaining: budget.amount - spent,
      percentage,
      status,
      alert: getBudgetAlert(percentage, budget.amount - spent, thresholds),
    }
  })
}

function getDeltaPercent(current: number, previous: number): number | null {
  if (!previous) {
    return current ? null : 0
  }

  return ((current - previous) / previous) * 100
}

function getLargestCategorySpend(
  expenses: Expense[],
  categories: Category[],
  total: number,
): CategorySpend | null {
  if (!expenses.length || !total) {
    return null
  }

  return getCategorySpending(expenses, categories)[0] ?? null
}

function getProjectedEndOfMonth(
  total: number,
  monthId: string,
  today: Date,
): number {
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const monthEnd = endOfMonth(monthStart)
  const elapsedDays = getElapsedDaysInMonth(monthId, today)
  const daysInMonth = getDate(monthEnd)

  if (!elapsedDays) {
    return 0
  }

  return (total / elapsedDays) * daysInMonth
}

function getElapsedDaysInMonth(monthId: string, today: Date): number {
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const monthEnd = endOfMonth(monthStart)
  const normalizedToday = parseISO(format(today, "yyyy-MM-dd"))

  if (isBefore(normalizedToday, monthStart)) {
    return 0
  }

  if (isAfter(normalizedToday, monthEnd)) {
    return getDate(monthEnd)
  }

  return differenceInCalendarDays(normalizedToday, startOfMonth(monthStart)) + 1
}

function getDaysWithoutSpending(
  expenses: Expense[],
  monthId: string,
  today: Date,
): number {
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const monthEnd = endOfMonth(monthStart)
  const normalizedToday = parseISO(format(today, "yyyy-MM-dd"))
  const endDate = isAfter(normalizedToday, monthEnd) ? monthEnd : normalizedToday

  if (isBefore(endDate, monthStart)) {
    return 0
  }

  const daysWithSpending = new Set(expenses.map((expense) => expense.date))
  const elapsedDays = differenceInCalendarDays(endDate, monthStart) + 1

  return Array.from({ length: elapsedDays }, (_, index) => {
    const date = new Date(monthStart)
    date.setDate(monthStart.getDate() + index)

    return format(date, "yyyy-MM-dd")
  }).filter((date) => !daysWithSpending.has(date)).length
}

function getBudgetStatus(
  percentage: number,
  thresholds: number[],
): BudgetUsage["status"] {
  const warningThreshold = thresholds[1] ?? 75
  const dangerThreshold = thresholds[2] ?? 90

  if (percentage >= dangerThreshold) {
    return "danger"
  }

  if (percentage >= warningThreshold) {
    return "watch"
  }

  return "safe"
}

function getBudgetAlert(
  percentage: number,
  remaining: number,
  thresholds: number[],
): string {
  const warningThreshold = thresholds[1] ?? 75
  const dangerThreshold = thresholds[2] ?? 90
  const limitThreshold = thresholds[3] ?? 100

  if (percentage >= limitThreshold) {
    return "Anggaran terlampaui"
  }

  if (percentage >= dangerThreshold) {
    return "Hampir habis"
  }

  if (percentage >= warningThreshold) {
    return "Perlu dipantau"
  }

  if (remaining > 0) {
    return "Masih aman"
  }

  return "Belum ada pemakaian"
}
