"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Download, SortAsc, SortDesc } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getReportData, type ReportData } from "@/lib/analytics/reports"
import type { Budget, Category, Expense } from "@/lib/types/finance"
import { cn } from "@/lib/utils/cn"
import { formatIDR } from "@/lib/utils/format-idr"

interface ReportDashboardProps {
  budgets: Budget[]
  categories: Category[]
  expenses: Expense[]
  selectedMonthId: string
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

export function ReportDashboard({
  categories,
  expenses,
  selectedMonthId,
}: ReportDashboardProps) {
  const [trendMonths, setTrendMonths] = useState<6 | 12>(6)
  const data = useMemo(
    () =>
      getReportData({
        categories,
        expenses,
        monthId: selectedMonthId,
        trendMonths,
      }),
    [categories, expenses, selectedMonthId, trendMonths],
  )

  if (!expenses.length) {
    return (
      <ReportEmptyState
        description="Tambahkan beberapa pengeluaran atau aktifkan demo data dari Ringkasan agar laporan mulai terbaca."
        title="Data belum cukup untuk menampilkan grafik"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Laporan</h2>
          <p className="mt-1 text-sm leading-6 text-secondary">
            Fokus pada tren utama: bulanan, kategori, transaksi terbesar, dan
            kategori yang naik atau turun.
          </p>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-border bg-surface p-1">
          {[6, 12].map((months) => (
            <Button
              className={cn(
                "h-9 rounded-md",
                trendMonths === months &&
                  "bg-accent-soft text-accent hover:bg-accent-soft",
              )}
              key={months}
              onClick={() => setTrendMonths(months as 6 | 12)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {months} bulan
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlyTrendCard data={data} />
        <CategoryCompositionCard data={data} />
        <TopExpensesCard data={data} />
        <CategoryMovementCard data={data} />
      </div>
    </div>
  )
}

function MonthlyTrendCard({ data }: { data: ReportData }) {
  return (
    <ChartCard title="Tren Bulanan" description="Total pengeluaran dan moving average.">
      <ChartFrame hasData={data.monthlyTrend.some((point) => point.total > 0)}>
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data.monthlyTrend}>
            <defs>
              <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-tertiary)" tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => formatIDR(Number(value))} />
            <Area
              dataKey="total"
              fill="url(#trendFill)"
              name="Total"
              stroke="var(--chart-1)"
              strokeWidth={3}
            />
            <Line
              dataKey="movingAverage"
              dot={false}
              name="Rata-rata bergerak"
              stroke="var(--chart-3)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>
      <AccessibleTable
        columns={["Bulan", "Total", "Moving average"]}
        rows={data.monthlyTrend.map((point) => [
          point.label,
          formatIDR(point.total),
          formatIDR(point.movingAverage),
        ])}
      />
    </ChartCard>
  )
}

function CategoryCompositionCard({ data }: { data: ReportData }) {
  const total = data.categoryComposition.reduce(
    (sum, category) => sum + category.amount,
    0,
  )

  return (
    <ChartCard title="Komposisi Kategori" description="Porsi kategori bulan ini.">
      <ChartFrame hasData={total > 0}>
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={data.categoryComposition}
              dataKey="amount"
              innerRadius={62}
              nameKey="categoryName"
              outerRadius={96}
              paddingAngle={3}
            >
              {data.categoryComposition.map((category, index) => (
                <Cell
                  fill={chartColors[index % chartColors.length]}
                  key={category.categoryId}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatIDR(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-tertiary">Total</p>
            <p className="font-mono text-sm font-bold text-primary">
              {formatIDR(total)}
            </p>
          </div>
        </div>
      </ChartFrame>
      <AccessibleTable
        columns={["Kategori", "Nominal"]}
        rows={data.categoryComposition.map((category) => [
          category.categoryName,
          formatIDR(category.amount),
        ])}
      />
    </ChartCard>
  )
}

function TopExpensesCard({ data }: { data: ReportData }) {
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")
  const sorted = [...data.topExpenses].sort((first, second) =>
    sortDirection === "desc"
      ? second.amount - first.amount
      : first.amount - second.amount,
  )

  return (
    <ChartCard title="Top 10 Pengeluaran" description="Transaksi terbesar bulan ini.">
      <div className="mb-3 flex justify-end">
        <Button
          onClick={() =>
            setSortDirection((current) => (current === "desc" ? "asc" : "desc"))
          }
          size="sm"
          type="button"
          variant="secondary"
        >
          {sortDirection === "desc" ? (
            <SortDesc aria-hidden="true" className="h-4 w-4" />
          ) : (
            <SortAsc aria-hidden="true" className="h-4 w-4" />
          )}
          Urutkan
        </Button>
      </div>
      <div className="space-y-2">
        {sorted.length ? (
          sorted.map((expense) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
              key={expense.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary">
                  {expense.note}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  {expense.categoryName} · {expense.date}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm font-bold text-primary">
                {formatIDR(expense.amount)}
              </p>
            </div>
          ))
        ) : (
          <ReportEmptyState
            compact
            description="Tambahkan transaksi untuk melihat daftar terbesar."
            title="Belum ada pengeluaran"
          />
        )}
      </div>
      <AccessibleTable
        columns={["Catatan", "Kategori", "Tanggal", "Nominal"]}
        rows={sorted.map((expense) => [
          expense.note,
          expense.categoryName,
          expense.date,
          formatIDR(expense.amount),
        ])}
      />
    </ChartCard>
  )
}

function CategoryMovementCard({ data }: { data: ReportData }) {
  return (
    <ChartCard
      title="Kategori Tumbuh / Turun"
      description="Kategori dengan perubahan tercepat."
    >
      <div className="space-y-2">
        {data.categoryMovements.length ? (
          data.categoryMovements.map((category) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_92px_96px] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
              key={category.categoryId}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary">
                  <span aria-hidden="true" className="mr-1">
                    {category.emoji}
                  </span>
                  {category.categoryName}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs font-semibold",
                    category.deltaAmount > 0
                      ? "text-danger"
                      : category.deltaAmount < 0
                        ? "text-success"
                        : "text-tertiary",
                  )}
                >
                  {category.deltaAmount > 0 ? "+" : ""}
                  {formatIDR(category.deltaAmount)}
                </p>
              </div>
              <MiniSparkline color={category.color} values={category.sparkline} />
              <p className="text-right text-xs font-semibold text-secondary">
                {category.deltaPercent === null
                  ? "baru"
                  : `${Math.abs(category.deltaPercent).toFixed(1)}%`}
              </p>
            </div>
          ))
        ) : (
          <ReportEmptyState
            compact
            description="Butuh data kategori minimal dua bulan."
            title="Trend kategori belum tersedia"
          />
        )}
      </div>
      <AccessibleTable
        columns={["Kategori", "Selisih", "Persentase"]}
        rows={data.categoryMovements.map((category) => [
          category.categoryName,
          formatIDR(category.deltaAmount),
          category.deltaPercent === null
            ? "baru"
            : `${category.deltaPercent.toFixed(1)}%`,
        ])}
      />
    </ChartCard>
  )
}

function ChartCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  async function exportPng() {
    if (!ref.current) {
      return
    }

    const { toPng } = await import("html-to-image")
    const dataUrl = await toPng(ref.current, {
      backgroundColor: "#0A0A0B",
      pixelRatio: 2,
    })
    const link = document.createElement("a")
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <Card className="overflow-hidden p-0">
      <div ref={ref} className="bg-surface p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-primary">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
          </div>
          <Button
            aria-label={`Export ${title} sebagai PNG`}
            className="h-10 w-10 shrink-0"
            onClick={exportPng}
            size="icon"
            type="button"
            variant="secondary"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </Card>
  )
}

function ChartFrame({
  children,
  className,
  hasData,
}: {
  children: React.ReactNode
  className?: string
  hasData: boolean
}) {
  return (
    <div className={cn("relative h-64", className)}>
      {hasData ? (
        children
      ) : (
        <ReportEmptyState
          compact
          description="Data belum cukup untuk menampilkan grafik."
          title="Belum ada data"
        />
      )}
    </div>
  )
}

function ReportEmptyState({
  compact = false,
  description,
  title,
}: {
  compact?: boolean
  description: string
  title: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-surface text-center",
        compact ? "min-h-36 p-4" : "min-h-64 p-6",
      )}
    >
      <h3 className="text-lg font-bold text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-secondary">
        {description}
      </p>
    </div>
  )
}

function AccessibleTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: string[][]
}) {
  return (
    <table className="sr-only">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.join("-")}-${index}`}>
            {row.map((cell) => (
              <td key={cell}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MiniSparkline({ color, values }: { color: string; values: number[] }) {
  const max = Math.max(1, ...values)
  const points = values
    .map((value, index) => {
      const x = index * 32
      const y = 28 - (value / max) * 24

      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg aria-hidden="true" className="h-8 w-24" viewBox="0 0 64 32">
      <polyline
        fill="none"
        points={points}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  )
}
