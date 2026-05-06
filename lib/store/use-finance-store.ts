"use client"

import { create } from "zustand"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"
import { del, get, set } from "idb-keyval"

import { createInitialSnapshot } from "@/lib/repository/seed"
import type {
  Budget,
  BudgetPeriod,
  Expense,
  FinanceSnapshot,
  Achievement,
  Insight,
  PaymentMethod,
  AppSettings,
} from "@/lib/types/finance"
import { toMonthId } from "@/lib/utils/dates"
import { createId } from "@/lib/utils/ids"

export type AppTab = "summary" | "expenses" | "budgets" | "reports" | "settings"

export interface ExpenseDraft {
  amount: number
  categoryId: string
  note?: string
  date: string
  time?: string
  paymentMethod?: PaymentMethod
  tags: string[]
}

export interface BudgetDraft {
  categoryId: string | "TOTAL"
  amount: number
  period: BudgetPeriod
  rollover: boolean
}

interface FinanceStore extends FinanceSnapshot {
  activeTab: AppTab
  selectedMonthId: string
  hasHydrated: boolean
  setActiveTab: (tab: AppTab) => void
  setSelectedMonthId: (monthId: string) => void
  setHasHydrated: (hasHydrated: boolean) => void
  addExpense: (draft: ExpenseDraft) => Expense
  importExpenses: (drafts: ExpenseDraft[]) => void
  updateExpense: (id: string, draft: ExpenseDraft) => void
  deleteExpense: (id: string) => void
  addBudget: (draft: BudgetDraft) => Budget
  updateBudget: (id: string, draft: BudgetDraft) => void
  deleteBudget: (id: string) => void
  syncAchievements: (achievements: Achievement[]) => void
  dismissInsight: (insight: Insight) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  resetAllData: () => void
  toggleDemoData: () => void
}

const idbStorage: StateStorage = {
  async getItem(name) {
    return (await get<string>(name)) ?? null
  },
  async setItem(name, value) {
    await set(name, value)
  },
  async removeItem(name) {
    await del(name)
  },
}

const initialSnapshot = createInitialSnapshot()
const demoExpenseIds = [
  "demo-expense-breakfast",
  "demo-expense-ride",
  "demo-expense-bill",
  "demo-expense-coffee",
  "demo-expense-groceries",
  "demo-expense-last-food",
  "demo-expense-last-transport",
  "demo-expense-last-bills",
  "demo-expense-last-health",
]
const demoBudgetIds = [
  "demo-budget-total",
  "demo-budget-food",
  "demo-budget-transport",
  "demo-budget-bills",
]

function createExpense(draft: ExpenseDraft, id = createId()): Expense {
  const now = new Date().toISOString()

  return {
    id,
    amount: draft.amount,
    categoryId: draft.categoryId,
    note: draft.note?.trim() || undefined,
    date: draft.date,
    time: draft.time || undefined,
    paymentMethod: draft.paymentMethod,
    tags: draft.tags,
    createdAt: now,
    updatedAt: now,
  }
}

function createBudget(draft: BudgetDraft, id = createId()): Budget {
  const now = new Date().toISOString()

  return {
    id,
    categoryId: draft.categoryId,
    amount: draft.amount,
    period: draft.period,
    rollover: draft.rollover,
    createdAt: now,
    updatedAt: now,
  }
}

function createDemoExpenses(today = new Date()): Expense[] {
  const isoDate = (dayOffset: number) => {
    const date = new Date(today)
    date.setDate(today.getDate() - dayOffset)

    return date.toISOString().slice(0, 10)
  }
  const lastMonthDate = (day: number) => {
    const date = new Date(today)
    date.setDate(1)
    date.setMonth(date.getMonth() - 1)
    date.setDate(Math.min(day, 28))

    return date.toISOString().slice(0, 10)
  }

  return [
    createExpense(
      {
        amount: 28000,
        categoryId: "cat-food",
        note: "Sarapan bubur ayam",
        date: isoDate(0),
        time: "08:10",
        paymentMethod: "ewallet",
        tags: ["demo"],
      },
      demoExpenseIds[0],
    ),
    createExpense(
      {
        amount: 42000,
        categoryId: "cat-transport",
        note: "Ojek online pulang kantor",
        date: isoDate(0),
        time: "18:45",
        paymentMethod: "ewallet",
        tags: ["demo"],
      },
      demoExpenseIds[1],
    ),
    createExpense(
      {
        amount: 350000,
        categoryId: "cat-bills",
        note: "Internet rumah",
        date: isoDate(2),
        paymentMethod: "transfer",
        tags: ["demo", "bulanan"],
      },
      demoExpenseIds[2],
    ),
    createExpense(
      {
        amount: 32000,
        categoryId: "cat-food",
        note: "Kopi sore",
        date: isoDate(3),
        time: "16:20",
        paymentMethod: "debit",
        tags: ["demo", "kopi"],
      },
      demoExpenseIds[3],
    ),
    createExpense(
      {
        amount: 186000,
        categoryId: "cat-shopping",
        note: "Belanja kebutuhan mingguan",
        date: isoDate(5),
        paymentMethod: "debit",
        tags: ["demo"],
      },
      demoExpenseIds[4],
    ),
    createExpense(
      {
        amount: 260000,
        categoryId: "cat-food",
        note: "Makan luar bulan lalu",
        date: lastMonthDate(4),
        paymentMethod: "debit",
        tags: ["demo"],
      },
      demoExpenseIds[5],
    ),
    createExpense(
      {
        amount: 125000,
        categoryId: "cat-transport",
        note: "Transportasi bulan lalu",
        date: lastMonthDate(8),
        paymentMethod: "ewallet",
        tags: ["demo"],
      },
      demoExpenseIds[6],
    ),
    createExpense(
      {
        amount: 330000,
        categoryId: "cat-bills",
        note: "Tagihan listrik bulan lalu",
        date: lastMonthDate(12),
        paymentMethod: "transfer",
        tags: ["demo", "bulanan"],
      },
      demoExpenseIds[7],
    ),
    createExpense(
      {
        amount: 90000,
        categoryId: "cat-health",
        note: "Vitamin",
        date: lastMonthDate(18),
        paymentMethod: "cash",
        tags: ["demo"],
      },
      demoExpenseIds[8],
    ),
  ]
}

function createDemoBudgets(): Budget[] {
  return [
    createBudget(
      {
        categoryId: "TOTAL",
        amount: 1250000,
        period: "monthly",
        rollover: false,
      },
      demoBudgetIds[0],
    ),
    createBudget(
      {
        categoryId: "cat-food",
        amount: 450000,
        period: "monthly",
        rollover: false,
      },
      demoBudgetIds[1],
    ),
    createBudget(
      {
        categoryId: "cat-transport",
        amount: 250000,
        period: "monthly",
        rollover: false,
      },
      demoBudgetIds[2],
    ),
    createBudget(
      {
        categoryId: "cat-bills",
        amount: 500000,
        period: "monthly",
        rollover: true,
      },
      demoBudgetIds[3],
    ),
  ]
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (setStore) => ({
      ...initialSnapshot,
      activeTab: "summary",
      selectedMonthId: toMonthId(new Date()),
      hasHydrated: false,
      setActiveTab: (tab) => setStore({ activeTab: tab }),
      setSelectedMonthId: (monthId) => setStore({ selectedMonthId: monthId }),
      setHasHydrated: (hasHydrated) => setStore({ hasHydrated }),
      addExpense: (draft) => {
        const expense = createExpense(draft)
        setStore((state) => ({
          expenses: [expense, ...state.expenses],
        }))

        return expense
      },
      importExpenses: (drafts) => {
        setStore((state) => ({
          expenses: [...drafts.map((draft) => createExpense(draft)), ...state.expenses],
        }))
      },
      updateExpense: (id, draft) => {
        setStore((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? {
                  ...expense,
                  ...draft,
                  note: draft.note?.trim() || undefined,
                  time: draft.time || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : expense,
          ),
        }))
      },
      deleteExpense: (id) => {
        setStore((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }))
      },
      addBudget: (draft) => {
        const budget = createBudget(draft)
        setStore((state) => ({
          budgets: [budget, ...state.budgets],
        }))

        return budget
      },
      updateBudget: (id, draft) => {
        setStore((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id
              ? {
                  ...budget,
                  ...draft,
                  updatedAt: new Date().toISOString(),
                }
              : budget,
          ),
        }))
      },
      deleteBudget: (id) => {
        setStore((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }))
      },
      syncAchievements: (achievements) => {
        setStore((state) => {
          const existingMap = new Map(
            state.achievements.map((achievement) => [
              achievement.id,
              achievement,
            ]),
          )
          const now = new Date().toISOString()
          const nextAchievements = [...state.achievements]

          achievements.forEach((achievement) => {
            const existing = existingMap.get(achievement.id)

            if (existing?.unlockedAt) {
              return
            }

            if (existing) {
              nextAchievements.splice(nextAchievements.indexOf(existing), 1, {
                ...existing,
                ...achievement,
                unlockedAt: now,
              })
              return
            }

            nextAchievements.push({
              ...achievement,
              unlockedAt: now,
            })
          })

          return {
            achievements: nextAchievements,
          }
        })
      },
      dismissInsight: (insight) => {
        setStore((state) => ({
          insights: [
            ...state.insights.filter((item) => item.id !== insight.id),
            {
              ...insight,
              dismissedAt: new Date().toISOString(),
            },
          ],
        }))
      },
      updateSettings: (settings) => {
        setStore((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        }))
      },
      resetAllData: () => {
        setStore({
          ...createInitialSnapshot(),
          activeTab: "summary",
          selectedMonthId: toMonthId(new Date()),
          hasHydrated: true,
        })
      },
      toggleDemoData: () => {
        setStore((state) => {
          const isDemoEnabled = state.settings.demoDataEnabled
          const expensesWithoutDemo = state.expenses.filter(
            (expense) => !demoExpenseIds.includes(expense.id),
          )
          const budgetsWithoutDemo = state.budgets.filter(
            (budget) => !demoBudgetIds.includes(budget.id),
          )

          return {
            expenses: isDemoEnabled
              ? expensesWithoutDemo
              : [...createDemoExpenses(), ...expensesWithoutDemo],
            budgets: isDemoEnabled
              ? budgetsWithoutDemo
              : [...createDemoBudgets(), ...budgetsWithoutDemo],
            settings: {
              ...state.settings,
              demoDataEnabled: !isDemoEnabled,
            },
          }
        })
      },
    }),
    {
      name: "pencatat-pengeluaran-pro:finance-store",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        expenses: state.expenses,
        categories: state.categories.length
          ? state.categories
          : initialSnapshot.categories,
        budgets: state.budgets,
        savingGoals: state.savingGoals,
        recurringRules: state.recurringRules,
        templates: state.templates,
        splitBills: state.splitBills,
        achievements: state.achievements,
        insights: state.insights,
        settings: state.settings,
        selectedMonthId: state.selectedMonthId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
