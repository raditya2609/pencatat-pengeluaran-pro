import type { Expense } from "@/lib/types/finance"
import type { AppTab } from "@/lib/store/use-finance-store"

export function selectExpensesForMonth(
  expenses: Expense[],
  monthId: string,
): Expense[] {
  return expenses
    .filter((expense) => expense.date.startsWith(monthId))
    .sort((first, second) => {
      const firstDate = `${first.date}T${first.time ?? "00:00"}`
      const secondDate = `${second.date}T${second.time ?? "00:00"}`

      return secondDate.localeCompare(firstDate)
    })
}

export function selectTotalForMonth(expenses: Expense[], monthId: string): number {
  return selectExpensesForMonth(expenses, monthId).reduce(
    (total, expense) => total + expense.amount,
    0,
  )
}

export function getTabLabel(tab: AppTab): string {
  const labels: Record<AppTab, string> = {
    summary: "Ringkasan",
    expenses: "Pengeluaran",
    budgets: "Anggaran",
    reports: "Laporan",
    settings: "Pengaturan",
  }

  return labels[tab]
}
