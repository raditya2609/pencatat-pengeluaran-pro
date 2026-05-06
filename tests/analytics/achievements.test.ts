import { describe, expect, it } from "vitest"

import { getAchievementStats } from "@/lib/analytics/achievements"
import type { Budget, Expense } from "@/lib/types/finance"

const baseExpense = {
  amount: 50000,
  categoryId: "cat-food",
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

describe("achievement analytics", () => {
  it("calculates logging and no-spend streaks from expense dates", () => {
    const expenses: Expense[] = [
      { ...baseExpense, id: "may-1", date: "2026-05-01" },
      { ...baseExpense, id: "may-2", date: "2026-05-02" },
      { ...baseExpense, id: "may-3", date: "2026-05-03" },
      { ...baseExpense, id: "may-5", date: "2026-05-05" },
    ]

    const stats = getAchievementStats({
      budgets: [budget],
      expenses,
      monthId: "2026-05",
      today: new Date(2026, 4, 6, 12),
    })

    expect(stats.streaks.currentLoggingStreak).toBe(1)
    expect(stats.streaks.longestLoggingStreak).toBe(3)
    expect(stats.streaks.noSpendStreak).toBe(1)
    expect(stats.streaks.activeDaysThisMonth).toBe(4)
  })

  it("unlocks badges when spending behavior meets the targets", () => {
    const expenses: Expense[] = [
      { ...baseExpense, id: "cat-1", categoryId: "cat-food", date: "2026-05-01" },
      {
        ...baseExpense,
        id: "cat-2",
        categoryId: "cat-transport",
        date: "2026-05-02",
      },
      {
        ...baseExpense,
        id: "cat-3",
        categoryId: "cat-shopping",
        date: "2026-05-03",
      },
      {
        ...baseExpense,
        id: "cat-4",
        categoryId: "cat-bills",
        date: "2026-05-04",
      },
      {
        ...baseExpense,
        id: "cat-5",
        categoryId: "cat-health",
        date: "2026-05-05",
      },
      {
        ...baseExpense,
        amount: 400000,
        id: "previous",
        categoryId: "cat-food",
        date: "2026-04-05",
      },
    ]

    const unlocked = getAchievementStats({
      budgets: [budget],
      expenses,
      monthId: "2026-05",
      today: new Date(2026, 4, 5, 12),
    })
      .achievements.filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.id)

    expect(unlocked).toEqual(
      expect.arrayContaining([
        "first-expense",
        "three-day-streak",
        "budget-safe",
        "leaner-month",
        "category-explorer",
      ]),
    )
  })
})
