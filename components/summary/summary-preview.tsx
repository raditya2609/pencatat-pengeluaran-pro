import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Gauge,
  PieChart,
  ReceiptText,
  TrendingUp,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import type { SummaryMetrics } from "@/lib/analytics/summary"
import { formatIDR } from "@/lib/utils/format-idr"
import { cn } from "@/lib/utils/cn"

interface SummaryPreviewProps {
  metrics: SummaryMetrics
}

export function SummaryPreview({ metrics }: SummaryPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          detail={<DeltaLabel deltaPercent={metrics.deltaPercent} />}
          icon={ReceiptText}
          label="Total Pengeluaran"
          value={formatIDR(metrics.total)}
        />

        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <PieChart aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-secondary">Kategori Terbesar</p>
          {metrics.largestCategory ? (
            <>
              <p className="mt-2 truncate text-xl font-bold text-primary">
                <span aria-hidden="true" className="mr-1">
                  {metrics.largestCategory.emoji}
                </span>
                {metrics.largestCategory.categoryName}
              </p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-primary">
                {formatIDR(metrics.largestCategory.amount)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: metrics.largestCategory.color,
                    width: `${metrics.largestCategory.percentage}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-tertiary">
                {Math.round(metrics.largestCategory.percentage)}% dari total
                bulan ini
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-secondary">
              Belum ada kategori dominan bulan ini.
            </p>
          )}
        </Card>

        <MetricCard
          detail={`${metrics.averageTransactionsPerDay.toFixed(1)} transaksi rata-rata per hari`}
          icon={ArrowUpRight}
          label="Jumlah Transaksi"
          value={metrics.transactionCount.toString()}
        />

        <MetricCard
          detail={`${formatIDR(metrics.averageTransactionAmount)} rata-rata per transaksi`}
          icon={Gauge}
          label="Avg Daily Spend"
          value={formatIDR(metrics.averageDailySpend)}
        />

        <MetricCard
          detail="Estimasi berdasarkan ritme saat ini"
          icon={TrendingUp}
          label="Projected End-of-Month"
          value={formatIDR(metrics.projectedEndOfMonth)}
        />

        <MetricCard
          detail="Hari berjalan tanpa transaksi tercatat"
          icon={CalendarCheck}
          label="Days Without Spending"
          value={`${metrics.daysWithoutSpending} hari`}
        />
      </div>

      <MonthComparisonPanel metrics={metrics} />
    </div>
  )
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: React.ReactNode
  icon: typeof ReceiptText
  label: string
  value: string
}) {
  return (
    <Card>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-secondary">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-primary">
        {value}
      </p>
      <div className="mt-2 text-xs leading-5 text-tertiary">{detail}</div>
    </Card>
  )
}

function DeltaLabel({ deltaPercent }: { deltaPercent: number | null }) {
  if (deltaPercent === null) {
    return <span>Belum ada pembanding bulan lalu</span>
  }

  const isUp = deltaPercent > 0
  const isFlat = deltaPercent === 0
  const Icon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        isFlat ? "text-tertiary" : isUp ? "text-danger" : "text-success",
      )}
    >
      {!isFlat ? <Icon aria-hidden="true" className="h-3.5 w-3.5" /> : null}
      {isFlat
        ? "Sama seperti bulan lalu"
        : `${Math.abs(deltaPercent).toFixed(1)}% ${isUp ? "naik" : "turun"} dari bulan lalu`}
    </span>
  )
}

function MonthComparisonPanel({ metrics }: { metrics: SummaryMetrics }) {
  const comparison = metrics.monthComparison
  const topCategories = comparison.categories.slice(0, 5)
  const maxCategoryAmount = Math.max(
    1,
    ...topCategories.flatMap((category) => [
      category.currentAmount,
      category.previousAmount,
    ]),
  )

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <TrendingUp aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-secondary">Trend Bulanan</p>
          <h3 className="mt-1 text-xl font-bold text-primary">
            Analisis bulan ke bulan
          </h3>
        </div>

        <div className="rounded-lg border border-border bg-background px-3 py-2 text-right">
          <p className="text-xs font-medium text-secondary">Selisih total</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums text-primary">
            {comparison.deltaAmount >= 0 ? "+" : "-"}
            {formatIDR(Math.abs(comparison.deltaAmount))}
          </p>
          <div className="mt-1 text-xs">
            <DeltaLabel deltaPercent={comparison.deltaPercent} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ComparisonTotal
          label="Bulan ini"
          tone="current"
          value={comparison.currentTotal}
        />
        <ComparisonTotal
          label="Bulan lalu"
          tone="previous"
          value={comparison.previousTotal}
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-primary">
            Per kategori terbesar
          </p>
          <p className="text-xs text-tertiary">Bulan ini vs bulan lalu</p>
        </div>

        {topCategories.length ? (
          topCategories.map((category) => (
            <div
              className="rounded-lg border border-border bg-background p-3"
              key={category.categoryId}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-bold text-primary">
                  <span aria-hidden="true" className="mr-1">
                    {category.emoji}
                  </span>
                  {category.categoryName}
                </p>
                <CategoryDelta
                  deltaAmount={category.deltaAmount}
                  deltaPercent={category.deltaPercent}
                />
              </div>

              <div className="mt-3 space-y-2">
                <ComparisonBar
                  amount={category.currentAmount}
                  color={category.color}
                  label="Ini"
                  maxAmount={maxCategoryAmount}
                />
                <ComparisonBar
                  amount={category.previousAmount}
                  color="rgba(255,255,255,0.24)"
                  label="Lalu"
                  maxAmount={maxCategoryAmount}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-secondary">
            Butuh data minimal dua bulan untuk membaca trend kategori.
          </p>
        )}
      </div>
    </Card>
  )
}

function ComparisonTotal({
  label,
  tone,
  value,
}: {
  label: string
  tone: "current" | "previous"
  value: number
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium text-secondary">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-bold tabular-nums",
          tone === "current" ? "text-accent" : "text-primary",
        )}
      >
        {formatIDR(value)}
      </p>
    </div>
  )
}

function CategoryDelta({
  deltaAmount,
  deltaPercent,
}: {
  deltaAmount: number
  deltaPercent: number | null
}) {
  const isUp = deltaAmount > 0
  const isFlat = deltaAmount === 0

  return (
    <div
      className={cn(
        "shrink-0 text-right text-xs font-semibold",
        isFlat ? "text-tertiary" : isUp ? "text-danger" : "text-success",
      )}
    >
      <p>
        {isFlat ? "" : isUp ? "+" : "-"}
        {formatIDR(Math.abs(deltaAmount))}
      </p>
      <p className="mt-0.5">
        {deltaPercent === null
          ? "baru"
          : `${Math.abs(deltaPercent).toFixed(1)}% ${isUp ? "naik" : isFlat ? "tetap" : "turun"}`}
      </p>
    </div>
  )
}

function ComparisonBar({
  amount,
  color,
  label,
  maxAmount,
}: {
  amount: number
  color: string
  label: string
  maxAmount: number
}) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_6.5rem] items-center gap-2">
      <span className="text-xs font-semibold text-tertiary">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: `${Math.max(4, (amount / maxAmount) * 100)}%`,
          }}
        />
      </div>
      <span className="text-right font-mono text-xs font-bold tabular-nums text-secondary">
        {formatIDR(amount)}
      </span>
    </div>
  )
}
