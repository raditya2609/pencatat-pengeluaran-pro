import { describe, expect, it } from "vitest"

import { getGeneratedInsights } from "@/lib/insights/insights"
import { defaultCategories } from "@/lib/constants/default-categories"
import type { Budget, Expense } from "@/lib/types/finance"

const baseExpense = {
  paymentMethod: "ewallet" as const,
  tags: [],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
}

const expenses: Expense[] = [
  {
    ...baseExpense,
    id: "food-current",
    amount: 350000,
    categoryId: "cat-food",
    date: "2026-05-05",
    note: "Makan bulan ini",
  },
  {
    ...baseExpense,
    id: "food-previous",
    amount: 100000,
    categoryId: "cat-food",
    date: "2026-04-05",
    note: "Makan bulan lalu",
  },
  {
    ...baseExpense,
    id: "coffee-1",
    amount: 35000,
    categoryId: "cat-food",
    date: "2026-05-01",
    note: "Kopi",
    tags: ["kopi"],
  },
  {
    ...baseExpense,
    id: "coffee-2",
    amount: 40000,
    categoryId: "cat-food",
    date: "2026-05-02",
    note: "Kopi",
    tags: ["kopi"],
  },
  {
    ...baseExpense,
    id: "coffee-3",
    amount: 30000,
    categoryId: "cat-food",
    date: "2026-05-03",
    note: "Kopi",
    tags: ["kopi"],
  },
]

const budgets: Budget[] = [
  {
    id: "budget-food",
    categoryId: "cat-food",
    amount: 500000,
    period: "monthly",
    rollover: false,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
]

describe("generated insights", () => {
  it("surfaces rule-based insights and respects dismissal", () => {
    const insights = getGeneratedInsights({
      budgets,
      categories: defaultCategories,
      dismissedInsightIds: new Set(),
      expenses,
      monthId: "2026-05",
    })

    expect(insights.map((insight) => insight.type)).toEqual(
      expect.arrayContaining(["category-increase", "budget-warning", "coffee"]),
    )

    const dismissed = getGeneratedInsights({
      budgets,
      categories: defaultCategories,
      dismissedInsightIds: new Set([insights[0]!.id]),
      expenses,
      monthId: "2026-05",
    })

    expect(dismissed.some((insight) => insight.id === insights[0]!.id)).toBe(false)
  })
})
