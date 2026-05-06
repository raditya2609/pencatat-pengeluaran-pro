import { beforeEach, describe, expect, it } from "vitest"

import { createInitialSnapshot } from "@/lib/repository/seed"
import { useFinanceStore } from "@/lib/store/use-finance-store"

const budgetDraft = {
  categoryId: "TOTAL" as const,
  amount: 1500000,
  period: "monthly" as const,
  rollover: false,
}

describe("budget store actions", () => {
  beforeEach(() => {
    useFinanceStore.setState({
      ...createInitialSnapshot(),
      activeTab: "budgets",
      selectedMonthId: "2026-05",
      hasHydrated: true,
    })
  })

  it("adds, updates, and deletes a budget", () => {
    const budget = useFinanceStore.getState().addBudget(budgetDraft)

    expect(useFinanceStore.getState().budgets).toHaveLength(1)
    expect(budget.amount).toBe(1500000)

    useFinanceStore.getState().updateBudget(budget.id, {
      ...budgetDraft,
      amount: 1750000,
      rollover: true,
    })

    expect(useFinanceStore.getState().budgets[0]).toMatchObject({
      amount: 1750000,
      rollover: true,
    })

    useFinanceStore.getState().deleteBudget(budget.id)

    expect(useFinanceStore.getState().budgets).toEqual([])
  })
})
