import { beforeEach, describe, expect, it } from "vitest"

import { createInitialSnapshot } from "@/lib/repository/seed"
import { useFinanceStore } from "@/lib/store/use-finance-store"

const draft = {
  amount: 50000,
  categoryId: "cat-food",
  note: "Makan siang",
  date: "2026-05-05",
  time: "12:30",
  paymentMethod: "ewallet" as const,
  tags: ["kantor"],
}

describe("expense store actions", () => {
  beforeEach(() => {
    useFinanceStore.setState({
      ...createInitialSnapshot(),
      activeTab: "summary",
      selectedMonthId: "2026-05",
      hasHydrated: true,
    })
  })

  it("adds, updates, and deletes an expense", () => {
    const expense = useFinanceStore.getState().addExpense(draft)

    expect(useFinanceStore.getState().expenses).toHaveLength(1)
    expect(expense.amount).toBe(50000)

    useFinanceStore.getState().updateExpense(expense.id, {
      ...draft,
      amount: 75000,
      note: "Makan siang tim",
    })

    expect(useFinanceStore.getState().expenses[0]).toMatchObject({
      amount: 75000,
      note: "Makan siang tim",
    })

    useFinanceStore.getState().deleteExpense(expense.id)

    expect(useFinanceStore.getState().expenses).toEqual([])
  })

  it("toggles demo data without removing user-created expenses", () => {
    const userExpense = useFinanceStore.getState().addExpense(draft)
    const userBudget = useFinanceStore.getState().addBudget({
      categoryId: "cat-health",
      amount: 300000,
      period: "monthly",
      rollover: false,
    })

    useFinanceStore.getState().toggleDemoData()

    expect(useFinanceStore.getState().settings.demoDataEnabled).toBe(true)
    expect(useFinanceStore.getState().expenses.length).toBeGreaterThan(1)
    expect(useFinanceStore.getState().budgets.length).toBeGreaterThan(1)
    expect(
      useFinanceStore
        .getState()
        .expenses.some((expense) => expense.id === userExpense.id),
    ).toBe(true)
    expect(
      useFinanceStore
        .getState()
        .budgets.some((budget) => budget.id === userBudget.id),
    ).toBe(true)

    useFinanceStore.getState().toggleDemoData()

    expect(useFinanceStore.getState().settings.demoDataEnabled).toBe(false)
    expect(useFinanceStore.getState().expenses).toEqual([userExpense])
    expect(useFinanceStore.getState().budgets).toEqual([userBudget])
  })
})
