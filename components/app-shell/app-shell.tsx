"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { AchievementPanel } from "@/components/achievements/achievement-panel"
import { BottomNav } from "@/components/app-shell/bottom-nav"
import { FloatingActionButton } from "@/components/app-shell/floating-action-button"
import { MonthScroller } from "@/components/app-shell/month-scroller"
import { BudgetDashboard } from "@/components/budgets/budget-dashboard"
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog"
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog"
import { ExpenseList } from "@/components/expenses/expense-list"
import { InsightCards } from "@/components/insights/insight-cards"
import { MonthlyWrapCard } from "@/components/monthly-wrap/monthly-wrap-card"
import { PwaControls } from "@/components/pwa/pwa-controls"
import { SettingsDashboard } from "@/components/settings/settings-dashboard"
import { SmartQuickAdd } from "@/components/smart-input/quick-add"
import { EmptySummary } from "@/components/summary/empty-summary"
import { SummaryPreview } from "@/components/summary/summary-preview"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  getBudgetUsages,
  getSummaryMetrics,
  type BudgetUsage,
} from "@/lib/analytics/summary"
import {
  getAchievementStats,
  toUnlockedAchievements,
} from "@/lib/analytics/achievements"
import { getMonthlyWrapData } from "@/lib/analytics/monthly-wrap"
import { getGeneratedInsights } from "@/lib/insights/insights"
import {
  getTabLabel,
  selectExpensesForMonth,
  selectTotalForMonth,
} from "@/lib/store/selectors"
import {
  type AppTab,
  type BudgetDraft,
  type ExpenseDraft,
  useFinanceStore,
} from "@/lib/store/use-finance-store"
import type { Budget, Expense } from "@/lib/types/finance"
import { formatIDR } from "@/lib/utils/format-idr"
import { cn } from "@/lib/utils/cn"

const tabs: AppTab[] = ["summary", "expenses", "budgets", "reports", "settings"]
const ReportDashboard = dynamic(
  () =>
    import("@/components/reports/report-dashboard").then(
      (module) => module.ReportDashboard,
    ),
  {
    loading: () => (
      <Card className="flex min-h-64 items-center justify-center text-center text-sm text-secondary">
        Memuat laporan...
      </Card>
    ),
    ssr: false,
  },
)

export function AppShell() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const activeTab = useFinanceStore((state) => state.activeTab)
  const selectedMonthId = useFinanceStore((state) => state.selectedMonthId)
  const expenses = useFinanceStore((state) => state.expenses)
  const categories = useFinanceStore((state) => state.categories)
  const budgets = useFinanceStore((state) => state.budgets)
  const achievements = useFinanceStore((state) => state.achievements)
  const insights = useFinanceStore((state) => state.insights)
  const settings = useFinanceStore((state) => state.settings)
  const addExpense = useFinanceStore((state) => state.addExpense)
  const importExpenses = useFinanceStore((state) => state.importExpenses)
  const updateExpense = useFinanceStore((state) => state.updateExpense)
  const deleteExpense = useFinanceStore((state) => state.deleteExpense)
  const addBudget = useFinanceStore((state) => state.addBudget)
  const updateBudget = useFinanceStore((state) => state.updateBudget)
  const deleteBudget = useFinanceStore((state) => state.deleteBudget)
  const syncAchievements = useFinanceStore((state) => state.syncAchievements)
  const dismissInsight = useFinanceStore((state) => state.dismissInsight)
  const updateSettings = useFinanceStore((state) => state.updateSettings)
  const resetAllData = useFinanceStore((state) => state.resetAllData)
  const toggleDemoData = useFinanceStore((state) => state.toggleDemoData)
  const setActiveTab = useFinanceStore((state) => state.setActiveTab)
  const setSelectedMonthId = useFinanceStore((state) => state.setSelectedMonthId)

  const total = selectTotalForMonth(expenses, selectedMonthId)
  const currentMonthExpenses = selectExpensesForMonth(expenses, selectedMonthId)
  const summaryMetrics = getSummaryMetrics({
    categories,
    expenses,
    monthId: selectedMonthId,
  })
  const snapshot = {
    achievements,
    budgets,
    categories,
    expenses,
    insights,
    recurringRules: useFinanceStore((state) => state.recurringRules),
    savingGoals: useFinanceStore((state) => state.savingGoals),
    settings,
    splitBills: useFinanceStore((state) => state.splitBills),
    templates: useFinanceStore((state) => state.templates),
  }
  const budgetUsages = getBudgetUsages({
    budgets,
    categories,
    expenses,
    monthId: selectedMonthId,
    thresholds: settings.budgetAlertThresholds,
  })
  const dismissedInsightIds = new Set(
    insights.filter((insight) => insight.dismissedAt).map((insight) => insight.id),
  )
  const generatedInsights = getGeneratedInsights({
    budgets,
    categories,
    dismissedInsightIds,
    expenses,
    monthId: selectedMonthId,
  })
  const achievementStats = useMemo(
    () =>
      getAchievementStats({
        budgets,
        expenses,
        monthId: selectedMonthId,
      }),
    [budgets, expenses, selectedMonthId],
  )
  const monthlyWrapData = useMemo(
    () =>
      getMonthlyWrapData({
        achievementStats,
        categories,
        expenses,
        monthId: selectedMonthId,
      }),
    [achievementStats, categories, expenses, selectedMonthId],
  )
  const unlockedAchievementKey = achievementStats.achievements
    .filter((achievement) => achievement.unlocked)
    .map((achievement) => achievement.id)
    .join("|")

  useEffect(() => {
    const unlockedAchievements = toUnlockedAchievements(
      achievementStats.achievements,
    )

    if (unlockedAchievements.length) {
      syncAchievements(unlockedAchievements)
    }
  }, [achievementStats.achievements, syncAchievements, unlockedAchievementKey])

  const openNewExpenseForm = () => {
    setEditingExpense(null)
    setIsExpenseFormOpen(true)
  }

  const openEditExpenseForm = (expense: Expense) => {
    setEditingExpense(expense)
    setIsExpenseFormOpen(true)
  }

  const openNewBudgetForm = () => {
    setEditingBudget(null)
    setIsBudgetFormOpen(true)
  }

  const openEditBudgetForm = (usage: BudgetUsage) => {
    setEditingBudget(usage.budget)
    setIsBudgetFormOpen(true)
  }

  const submitExpense = (draft: ExpenseDraft) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, draft)
      setEditingExpense(null)
      return
    }

    addExpense(draft)
    setActiveTab("expenses")
  }

  const submitBudget = (draft: BudgetDraft) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, draft)
      setEditingBudget(null)
      return
    }

    addBudget(draft)
    setActiveTab("budgets")
  }

  const showDemoData = (tab: AppTab = "expenses") => {
    toggleDemoData()
    setActiveTab(tab)
  }

  return (
    <div className="min-h-dvh bg-background text-primary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col px-4 pb-28 pt-5 md:px-8 md:pb-8">
        <header className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <PwaControls className="mb-3" />
            <h1 className="max-w-sm text-3xl font-bold leading-tight text-primary md:max-w-none md:text-5xl">
              Pencatat Pengeluaran
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-secondary md:text-base">
              Kelola pengeluaran IDR dengan ringkasan bulanan yang cepat,
              rapi, dan siap dipakai saat offline.
            </p>
          </div>

          <Card className="w-full md:w-80">
            <p className="text-sm font-medium text-secondary">Total bulan ini</p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-primary">
              {formatIDR(total)}
            </p>
            <p className="mt-2 text-xs text-tertiary">
              {categories.length} kategori siap dipakai
            </p>
          </Card>
        </header>

        <MonthScroller
          onMonthChange={setSelectedMonthId}
          selectedMonthId={selectedMonthId}
        />

        <div className="mt-4">
          <SmartQuickAdd
            categories={categories}
            onAddExpense={(draft) => {
              addExpense(draft)
              setActiveTab("expenses")
            }}
            selectedMonthId={selectedMonthId}
          />
        </div>

        <div className="mt-4 hidden rounded-lg border border-border bg-surface p-1 md:grid md:w-fit md:grid-cols-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab

            return (
              <Button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md",
                  isActive && "bg-accent-soft text-accent hover:bg-accent-soft",
                )}
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant="ghost"
              >
                {getTabLabel(tab)}
              </Button>
            )
          })}
        </div>

        <main className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-labelledby={`${activeTab}-heading`}>
            <h2 className="sr-only" id={`${activeTab}-heading`}>
              {getTabLabel(activeTab)}
            </h2>
            {activeTab === "summary" ? (
              currentMonthExpenses.length ? (
                <div className="space-y-4">
                  <InsightCards
                    insights={generatedInsights}
                    onDismiss={dismissInsight}
                  />
                  <MonthlyWrapCard data={monthlyWrapData} />
                  <AchievementPanel
                    achievements={achievementStats.achievements}
                    compact
                    persistedAchievements={achievements}
                    streaks={achievementStats.streaks}
                  />
                  <SummaryPreview metrics={summaryMetrics} />
                </div>
              ) : (
                <EmptySummary onDemoClick={() => showDemoData("expenses")} />
              )
            ) : null}
            {activeTab === "expenses" ? (
              <ExpenseList
                categories={categories}
                expenses={currentMonthExpenses}
                onAddExpense={openNewExpenseForm}
                onDeleteExpense={deleteExpense}
                onEditExpense={openEditExpenseForm}
              />
            ) : null}
            {activeTab === "budgets" ? (
              <BudgetDashboard
                onAddBudget={openNewBudgetForm}
                onDemoClick={() => showDemoData("budgets")}
                onDeleteBudget={deleteBudget}
                onEditBudget={openEditBudgetForm}
                usages={budgetUsages}
              />
            ) : null}
            {activeTab === "reports" ? (
              <ReportDashboard
                budgets={budgets}
                categories={categories}
                expenses={expenses}
                selectedMonthId={selectedMonthId}
              />
            ) : null}
            {activeTab === "settings" ? (
              <SettingsDashboard
                categories={categories}
                onImportExpenses={(drafts) => {
                  importExpenses(drafts)
                  setActiveTab("expenses")
                }}
                onResetAllData={resetAllData}
                onUpdateSettings={updateSettings}
                settings={settings}
                snapshot={snapshot}
                achievementStats={achievementStats}
              />
            ) : null}
          </section>

          <aside className="hidden space-y-4 md:block">
            <Card>
              <h2 className="text-base font-bold text-primary">
                Fondasi siap
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Data tersimpan di IndexedDB, kategori default sudah disiapkan,
                dan fase berikutnya tinggal mengaktifkan pencatatan pengeluaran.
              </p>
            </Card>
            <Card>
              <h2 className="text-base font-bold text-primary">Kualitas</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Strict TypeScript, ESLint, Prettier, Vitest, dan utilitas IDR
                sudah menjadi bagian dari fondasi awal.
              </p>
            </Card>
          </aside>
        </main>
      </div>

      <ExpenseFormDialog
        categories={categories}
        editingExpense={editingExpense}
        onOpenChange={(open) => {
          setIsExpenseFormOpen(open)
          if (!open) {
            setEditingExpense(null)
          }
        }}
        onSubmitExpense={submitExpense}
        open={isExpenseFormOpen}
        selectedMonthId={selectedMonthId}
      />
      <BudgetFormDialog
        budgets={budgets}
        categories={categories}
        editingBudget={editingBudget}
        onOpenChange={(open) => {
          setIsBudgetFormOpen(open)
          if (!open) {
            setEditingBudget(null)
          }
        }}
        onSubmitBudget={submitBudget}
        open={isBudgetFormOpen}
      />
      <FloatingActionButton onClick={openNewExpenseForm} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
