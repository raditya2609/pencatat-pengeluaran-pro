import { defaultCategories } from "@/lib/constants/default-categories"
import type { FinanceSnapshot } from "@/lib/types/finance"

export function createInitialSnapshot(): FinanceSnapshot {
  return {
    expenses: [],
    categories: defaultCategories,
    budgets: [],
    savingGoals: [],
    recurringRules: [],
    templates: [],
    splitBills: [],
    achievements: [],
    insights: [],
    settings: {
      theme: "dark",
      firstDayOfWeek: "monday",
      budgetAlertThresholds: [50, 75, 90, 100],
      currency: "IDR",
      demoDataEnabled: false,
      onboardingCompleted: false,
      reducedMotion: false,
    },
  }
}
