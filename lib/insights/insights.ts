import { subMonths, format, parse } from "date-fns"

import {
  getBudgetUsages,
  getMonthComparison,
} from "@/lib/analytics/summary"
import { selectExpensesForMonth, selectTotalForMonth } from "@/lib/store/selectors"
import type { Budget, Category, Expense, Insight } from "@/lib/types/finance"
import { formatIDR } from "@/lib/utils/format-idr"

export function getGeneratedInsights({
  budgets,
  categories,
  dismissedInsightIds,
  expenses,
  monthId,
}: {
  budgets: Budget[]
  categories: Category[]
  dismissedInsightIds: Set<string>
  expenses: Expense[]
  monthId: string
}): Insight[] {
  const generated = [
    getLargestCategoryIncreaseInsight({ categories, expenses, monthId }),
    getBudgetWarningInsight({ budgets, categories, expenses, monthId }),
    getCoffeeInsight({ expenses, monthId }),
    getUnusualTransactionInsight({ categories, expenses, monthId }),
    getSavingsInsight({ expenses, monthId }),
  ].filter((insight): insight is Insight => Boolean(insight))

  return generated.filter((insight) => !dismissedInsightIds.has(insight.id))
}

function getLargestCategoryIncreaseInsight({
  categories,
  expenses,
  monthId,
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
}): Insight | null {
  const previousMonthId = format(
    subMonths(parse(`${monthId}-01`, "yyyy-MM-dd", new Date()), 1),
    "yyyy-MM",
  )
  const comparison = getMonthComparison({
    categories,
    expenses,
    monthId,
    previousMonthId,
  })
  const increased = comparison.categories.find(
    (category) =>
      category.currentAmount >= 100_000 &&
      category.deltaAmount > 0 &&
      (category.deltaPercent ?? 100) >= 30,
  )

  if (!increased) {
    return null
  }

  return createInsight({
    id: `category-increase:${monthId}:${increased.categoryId}`,
    severity: "warning",
    title: `${increased.categoryName} naik ${increased.deltaPercent === null ? "tajam" : `${increased.deltaPercent.toFixed(0)}%`}`,
    description: `Pengeluaran kategori ini bertambah ${formatIDR(increased.deltaAmount)} dibanding bulan lalu.`,
    type: "category-increase",
  })
}

function getBudgetWarningInsight({
  budgets,
  categories,
  expenses,
  monthId,
}: {
  budgets: Budget[]
  categories: Category[]
  expenses: Expense[]
  monthId: string
}): Insight | null {
  const usage = getBudgetUsages({ budgets, categories, expenses, monthId }).find(
    (item) => item.percentage >= 75,
  )

  if (!usage) {
    return null
  }

  return createInsight({
    id: `budget-warning:${monthId}:${usage.budget.id}`,
    severity: usage.percentage >= 90 ? "warning" : "info",
    title: `${usage.categoryName} ${Math.round(usage.percentage)}% terpakai`,
    description: `${usage.alert}. Sisa anggaran: ${formatIDR(Math.max(0, usage.remaining))}.`,
    type: "budget-warning",
  })
}

function getCoffeeInsight({
  expenses,
  monthId,
}: {
  expenses: Expense[]
  monthId: string
}): Insight | null {
  const coffeeExpenses = selectExpensesForMonth(expenses, monthId).filter((expense) =>
    [expense.note, ...expense.tags].join(" ").toLowerCase().includes("kopi"),
  )

  if (coffeeExpenses.length < 3) {
    return null
  }

  const total = coffeeExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const average = total / coffeeExpenses.length

  return createInsight({
    id: `coffee:${monthId}`,
    severity: "info",
    title: `Rata-rata kopi ${formatIDR(average)}`,
    description: `Kalau ritmenya sama sepanjang tahun, kopi bisa menjadi sekitar ${formatIDR(average * 365)}.`,
    type: "coffee",
  })
}

function getUnusualTransactionInsight({
  categories,
  expenses,
  monthId,
}: {
  categories: Category[]
  expenses: Expense[]
  monthId: string
}): Insight | null {
  const monthExpenses = selectExpensesForMonth(expenses, monthId)
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  for (const expense of monthExpenses) {
    const peers = expenses.filter(
      (item) => item.categoryId === expense.categoryId && item.id !== expense.id,
    )
    const average =
      peers.reduce((sum, item) => sum + item.amount, 0) / Math.max(1, peers.length)

    if (peers.length >= 3 && average > 0 && expense.amount >= average * 4) {
      const categoryName =
        categoryMap.get(expense.categoryId)?.name ?? "kategori ini"

      return createInsight({
        id: `unusual:${monthId}:${expense.id}`,
        severity: "warning",
        title: "Transaksi tidak biasa",
        description: `${formatIDR(expense.amount)} di ${categoryName}, sekitar ${Math.round(expense.amount / average)}x rata-rata kategori.`,
        type: "unusual-transaction",
      })
    }
  }

  return null
}

function getSavingsInsight({
  expenses,
  monthId,
}: {
  expenses: Expense[]
  monthId: string
}): Insight | null {
  const current = selectTotalForMonth(expenses, monthId)
  const monthStart = parse(`${monthId}-01`, "yyyy-MM-dd", new Date())
  const previousTotals = [1, 2, 3].map((offset) =>
    selectTotalForMonth(expenses, format(subMonths(monthStart, offset), "yyyy-MM")),
  )
  const nonZeroPreviousTotals = previousTotals.filter((total) => total > 0)

  if (!current || nonZeroPreviousTotals.length < 2) {
    return null
  }

  const average =
    nonZeroPreviousTotals.reduce((sum, total) => sum + total, 0) /
    nonZeroPreviousTotals.length

  if (current >= average * 0.9) {
    return null
  }

  return createInsight({
    id: `savings:${monthId}`,
    severity: "celebration",
    title: `Lebih hemat ${formatIDR(average - current)}`,
    description: "Bulan ini lebih rendah dibanding rata-rata beberapa bulan terakhir.",
    type: "savings",
  })
}

function createInsight({
  description,
  id,
  severity,
  title,
  type,
}: Pick<Insight, "description" | "id" | "severity" | "title" | "type">): Insight {
  return {
    id,
    type,
    title,
    description,
    severity,
    createdAt: new Date().toISOString(),
  }
}
