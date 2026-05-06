"use client"

import { Edit3, Plus, Trash2 } from "lucide-react"

import { EmptyBudgets } from "@/components/budgets/empty-budgets"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { BudgetUsage } from "@/lib/analytics/summary"
import { formatIDR } from "@/lib/utils/format-idr"

interface BudgetDashboardProps {
  usages: BudgetUsage[]
  onAddBudget: () => void
  onDemoClick: () => void
  onDeleteBudget: (id: string) => void
  onEditBudget: (usage: BudgetUsage) => void
}

export function BudgetDashboard({
  usages,
  onAddBudget,
  onDemoClick,
  onDeleteBudget,
  onEditBudget,
}: BudgetDashboardProps) {
  if (!usages.length) {
    return <EmptyBudgets onAddBudget={onAddBudget} onDemoClick={onDemoClick} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-primary">Anggaran</h2>
          <p className="mt-1 text-sm text-secondary">
            Pantau batas pengeluaran per kategori.
          </p>
        </div>
        <Button onClick={onAddBudget} size="sm" type="button">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {usages.map((usage) => (
          <BudgetCard
            key={usage.budget.id}
            onDelete={() => onDeleteBudget(usage.budget.id)}
            onEdit={() => onEditBudget(usage)}
            usage={usage}
          />
        ))}
      </div>
    </div>
  )
}

function BudgetCard({
  usage,
  onDelete,
  onEdit,
}: {
  usage: BudgetUsage
  onDelete: () => void
  onEdit: () => void
}) {
  const percentage = Math.min(usage.percentage, 100)

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProgressRing color={usage.color} percentage={percentage} />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-primary">
              <span aria-hidden="true" className="mr-1">
                {usage.emoji}
              </span>
              {usage.categoryName}
            </p>
            <p className="mt-1 text-xs text-secondary">
              {usage.budget.period === "monthly" ? "Bulanan" : "Mingguan"}
              {usage.budget.rollover ? " · rollover aktif" : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button
            aria-label="Edit anggaran"
            className="h-10 w-10"
            onClick={onEdit}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Hapus anggaran"
            className="h-10 w-10 text-danger hover:text-danger"
            onClick={onDelete}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-secondary">Terpakai</p>
            <p className="font-mono text-lg font-bold tabular-nums text-primary">
              {formatIDR(usage.spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-secondary">Anggaran</p>
            <p className="font-mono text-sm font-bold tabular-nums text-primary">
              {formatIDR(usage.budget.amount)}
            </p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              backgroundColor: usage.color,
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
        <span className="text-sm font-semibold text-secondary">
          {usage.alert}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-primary">
          {usage.remaining >= 0
            ? `${formatIDR(usage.remaining)} sisa`
            : `${formatIDR(Math.abs(usage.remaining))} lewat`}
        </span>
      </div>
    </Card>
  )
}

function ProgressRing({
  color,
  percentage,
}: {
  color: string
  percentage: number
}) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg
        aria-label={`${Math.round(percentage)} persen anggaran terpakai`}
        className="-rotate-90"
        height="56"
        role="img"
        viewBox="0 0 56 56"
        width="56"
      >
        <circle
          cx="28"
          cy="28"
          fill="transparent"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
        />
        <circle
          cx="28"
          cy="28"
          fill="transparent"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="7"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
