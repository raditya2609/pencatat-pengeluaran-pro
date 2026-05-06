export type PaymentMethod = "cash" | "debit" | "credit" | "ewallet" | "transfer"
export type BudgetPeriod = "monthly" | "weekly"
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly"
export type InsightSeverity = "info" | "warning" | "celebration"
export type ThemeMode = "dark" | "light" | "system"
export type FirstDayOfWeek = "monday" | "sunday"

export interface Expense {
  id: string
  amount: number
  categoryId: string
  note?: string
  date: string
  time?: string
  paymentMethod?: PaymentMethod
  tags: string[]
  recurringId?: string
  templateId?: string
  splitBillId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  emoji?: string
  color: string
  isDefault: boolean
  parentId?: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  categoryId: string | "TOTAL"
  amount: number
  period: BudgetPeriod
  rollover: boolean
  createdAt: string
  updatedAt: string
}

export interface SavingGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  emoji: string
  createdAt: string
  updatedAt: string
}

export interface RecurringRule {
  id: string
  expenseTemplate: Omit<
    Expense,
    "id" | "createdAt" | "updatedAt" | "recurringId"
  >
  frequency: RecurringFrequency
  interval: number
  startDate: string
  endDate?: string
  nextRunDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseTemplate {
  id: string
  name: string
  amount: number
  categoryId: string
  note?: string
  paymentMethod?: PaymentMethod
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SplitBill {
  id: string
  totalAmount: number
  peopleCount: number
  participantNames: string[]
  portions: SplitBillPortion[]
  createdAt: string
  updatedAt: string
}

export interface SplitBillPortion {
  name: string
  amount: number
  isPaid: boolean
}

export interface Insight {
  id: string
  type: string
  title: string
  description: string
  severity: InsightSeverity
  ctaLabel?: string
  ctaHref?: string
  dismissedAt?: string
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  badgeIcon: string
  unlockedAt?: string
}

export interface AppSettings {
  theme: ThemeMode
  firstDayOfWeek: FirstDayOfWeek
  budgetAlertThresholds: number[]
  currency: "IDR"
  demoDataEnabled: boolean
  onboardingCompleted: boolean
  reducedMotion: boolean
}

export interface FinanceSnapshot {
  expenses: Expense[]
  categories: Category[]
  budgets: Budget[]
  savingGoals: SavingGoal[]
  recurringRules: RecurringRule[]
  templates: ExpenseTemplate[]
  splitBills: SplitBill[]
  achievements: Achievement[]
  insights: Insight[]
  settings: AppSettings
}
