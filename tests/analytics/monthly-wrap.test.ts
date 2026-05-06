import { describe, expect, it } from "vitest"

import { getAchievementStats } from "@/lib/analytics/achievements"
import { getMonthlyWrapData } from "@/lib/analytics/monthly-wrap"
import { defaultCategories } from "@/lib/constants/default-categories"
import type { Budget, Expense } from "@/lib/types/finance"

const baseExpense = {
  paymentMethod: "ewallet" as const,
  tags: [],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
}

const budget: Budget = {
  id: "budget-total",
  categoryId: "TOTAL",
  amount: 1000000,
  period: "monthly",
  rollover: false,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
}

describe("monthly wrap analytics", () => {
  it("builds a focused monthly recap from expenses and achievements", () => {
    const expenses: Expense[] = [
      {
        ...baseExpense,
        id: "food-1",
        amount: 200000,
        categoryId: "cat-food",
        date: "2026-05-01",
        note: "Makan keluarga",
      },
      {
        ...baseExpense,
        id: "transport-1",
        amount: 100000,
        categoryId: "cat-transport",
        date: "2026-05-02",
        note: "Transport",
      },
      {
        ...baseExpense,
        id: "previous-food",
        amount: 500000,
        categoryId: "cat-food",
        date: "2026-04-01",
        note: "Bulan lalu",
      },
    ]
    const achievementStats = getAchievementStats({
      budgets: [budget],
      expenses,
      monthId: "2026-05",
      today: new Date(2026, 4, 3, 12),
    })

    const wrap = getMonthlyWrapData({
      achievementStats,
      categories: defaultCategories,
      expenses,
      monthId: "2026-05",
    })

    expect(wrap.monthLabel).toBe("Mei 2026")
    expect(wrap.total).toBe(300000)
    expect(wrap.previousTotal).toBe(500000)
    expect(wrap.deltaAmount).toBe(-200000)
    expect(wrap.transactionCount).toBe(2)
    expect(wrap.topCategory).toMatchObject({
      name: "Makanan & Minuman",
      amount: 200000,
    })
    expect(wrap.largestExpense).toMatchObject({
      note: "Makan keluarga",
      amount: 200000,
    })
    expect(wrap.headline).toBe("Bulan ini lebih ramping dari bulan lalu.")
  })
})
