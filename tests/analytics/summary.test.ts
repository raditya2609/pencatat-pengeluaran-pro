import { describe, expect, it } from "vitest"

import {
  getBudgetUsages,
  getSummaryMetrics,
} from "@/lib/analytics/summary"
import { defaultCategories } from "@/lib/constants/default-categories"
import type { Budget, Expense } from "@/lib/types/finance"

const baseExpense = {
  time: undefined,
  paymentMethod: "ewallet" as const,
  tags: [],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
}

const expenses: Expense[] = [
  {
    ...baseExpense,
    id: "expense-1",
    amount: 200000,
    categoryId: "cat-food",
    note: "Makan keluarga",
    date: "2026-05-01",
  },
  {
    ...baseExpense,
    id: "expense-2",
    amount: 100000,
    categoryId: "cat-transport",
    note: "Transport",
    date: "2026-05-05",
  },
  {
    ...baseExpense,
    id: "expense-previous",
    amount: 100000,
    categoryId: "cat-food",
    note: "Bulan lalu",
    date: "2026-04-20",
  },
]

describe("summary analytics", () => {
  it("calculates live summary metrics for a selected month", () => {
    const metrics = getSummaryMetrics({
      categories: defaultCategories,
      expenses,
      monthId: "2026-05",
      today: new Date(2026, 4, 10, 12),
    })

    expect(metrics.total).toBe(300000)
    expect(metrics.previousTotal).toBe(100000)
    expect(metrics.deltaPercent).toBe(200)
    expect(metrics.transactionCount).toBe(2)
    expect(metrics.averageTransactionsPerDay).toBe(0.2)
    expect(metrics.averageTransactionAmount).toBe(150000)
    expect(metrics.averageDailySpend).toBe(30000)
    expect(metrics.projectedEndOfMonth).toBe(930000)
    expect(metrics.daysWithoutSpending).toBe(8)
    expect(metrics.monthComparison).toMatchObject({
      currentTotal: 300000,
      previousTotal: 100000,
      deltaAmount: 200000,
      deltaPercent: 200,
    })
    expect(metrics.monthComparison.categories[0]).toMatchObject({
      categoryId: "cat-food",
      currentAmount: 200000,
      previousAmount: 100000,
      deltaAmount: 100000,
    })
    expect(metrics.largestCategory).toMatchObject({
      categoryId: "cat-food",
      amount: 200000,
    })
  })

  it("handles empty current and previous months safely", () => {
    const metrics = getSummaryMetrics({
      categories: defaultCategories,
      expenses: [],
      monthId: "2026-05",
      today: new Date(2026, 4, 10, 12),
    })

    expect(metrics.total).toBe(0)
    expect(metrics.deltaPercent).toBe(0)
    expect(metrics.largestCategory).toBeNull()
    expect(metrics.projectedEndOfMonth).toBe(0)
  })
})

describe("budget analytics", () => {
  it("calculates budget progress and alert status", () => {
    const budgets: Budget[] = [
      {
        id: "budget-total",
        categoryId: "TOTAL",
        amount: 400000,
        period: "monthly",
        rollover: false,
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
      {
        id: "budget-food",
        categoryId: "cat-food",
        amount: 200000,
        period: "monthly",
        rollover: false,
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ]

    const usages = getBudgetUsages({
      budgets,
      categories: defaultCategories,
      expenses,
      monthId: "2026-05",
    })

    expect(usages[0]).toMatchObject({
      spent: 300000,
      percentage: 75,
      status: "watch",
      alert: "Perlu dipantau",
    })
    expect(usages[1]).toMatchObject({
      spent: 200000,
      percentage: 100,
      status: "danger",
      alert: "Anggaran terlampaui",
    })
  })

  it("uses custom budget warning thresholds", () => {
    const usages = getBudgetUsages({
      budgets: [
        {
          id: "budget-total",
          categoryId: "TOTAL",
          amount: 500000,
          period: "monthly",
          rollover: false,
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      ],
      categories: defaultCategories,
      expenses,
      monthId: "2026-05",
      thresholds: [40, 50, 60, 100],
    })

    expect(usages[0]).toMatchObject({
      percentage: 60,
      status: "danger",
      alert: "Hampir habis",
    })
  })
})
