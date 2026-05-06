import { describe, expect, it } from "vitest"

import { getReportData } from "@/lib/analytics/reports"
import { defaultCategories } from "@/lib/constants/default-categories"
import type { Expense } from "@/lib/types/finance"

const baseExpense = {
  paymentMethod: "ewallet" as const,
  tags: [],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
}

const expenses: Expense[] = [
  {
    ...baseExpense,
    id: "expense-current-food",
    amount: 200000,
    categoryId: "cat-food",
    date: "2026-05-05",
    note: "Makan",
    time: "12:00",
  },
  {
    ...baseExpense,
    id: "expense-current-transport",
    amount: 100000,
    categoryId: "cat-transport",
    date: "2026-05-06",
    note: "Transport",
    time: "18:00",
  },
  {
    ...baseExpense,
    id: "expense-previous-food",
    amount: 150000,
    categoryId: "cat-food",
    date: "2026-04-12",
    note: "Bulan lalu",
  },
]

describe("report analytics", () => {
  it("builds focused report datasets", () => {
    const data = getReportData({
      categories: defaultCategories,
      expenses,
      monthId: "2026-05",
      trendMonths: 6,
    })

    expect(data.monthlyTrend).toHaveLength(6)
    expect(data.categoryComposition[0]).toMatchObject({
      categoryId: "cat-food",
      amount: 200000,
    })
    expect(data.topExpenses[0]).toMatchObject({
      id: "expense-current-food",
      amount: 200000,
    })
    expect(data.categoryMovements.length).toBeGreaterThan(0)
  })
})
