"use client"

import { Award, Download, ReceiptText, Sparkles, TrendingDown } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MonthlyWrapData } from "@/lib/analytics/monthly-wrap"
import { cn } from "@/lib/utils/cn"
import { formatIDR } from "@/lib/utils/format-idr"

interface MonthlyWrapCardProps {
  data: MonthlyWrapData
}

export function MonthlyWrapCard({ data }: MonthlyWrapCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const exportWrap = async () => {
    if (!ref.current || isExporting) {
      return
    }

    setIsExporting(true)
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#0A0A0B",
        pixelRatio: 2,
      })
      const link = document.createElement("a")
      link.download = `monthly-wrap-${data.monthLabel.toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div ref={ref}>
        <div className="border-b border-border bg-surface-elevated p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-secondary">Monthly Wrap</p>
              <h3 className="mt-1 text-2xl font-bold text-primary">
                {data.monthLabel}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
                {data.headline}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background px-3 py-2 sm:text-right">
              <p className="text-xs font-medium text-tertiary">
                Total pengeluaran
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-primary">
                {formatIDR(data.total)}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-semibold",
                  data.deltaAmount > 0
                    ? "text-danger"
                    : data.deltaAmount < 0
                      ? "text-success"
                      : "text-tertiary",
                )}
              >
                {data.deltaAmount === 0
                  ? "Sama dengan bulan lalu"
                  : `${data.deltaAmount > 0 ? "+" : "-"}${formatIDR(Math.abs(data.deltaAmount))} vs bulan lalu`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <WrapMetric
            detail={data.topCategory?.name ?? "Belum ada kategori dominan"}
            icon={ReceiptText}
            label="Kategori utama"
            value={
              data.topCategory
                ? `${data.topCategory.emoji ?? ""} ${formatIDR(data.topCategory.amount)}`
                : "-"
            }
          />
          <WrapMetric
            detail="Transaksi tercatat bulan ini"
            icon={ReceiptText}
            label="Jumlah transaksi"
            value={data.transactionCount.toString()}
          />
          <WrapMetric
            detail="Streak pencatatan terbaik"
            icon={TrendingDown}
            label="Best streak"
            value={`${data.bestStreak} hari`}
          />
          <WrapMetric
            detail="Achievement bulan ini dan sebelumnya"
            icon={Award}
            label="Badge unlocked"
            value={data.unlockedCount.toString()}
          />
        </div>

        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
          <WrapHighlight
            label="Perubahan terbesar"
            value={
              data.biggestChange
                ? `${data.biggestChange.emoji ?? ""} ${data.biggestChange.name}`
                : "Belum ada pembanding"
            }
            detail={
              data.biggestChange
                ? `${data.biggestChange.amount > 0 ? "+" : "-"}${formatIDR(Math.abs(data.biggestChange.amount))}`
                : "Butuh data bulan lalu"
            }
            tone={
              data.biggestChange && data.biggestChange.amount > 0
                ? "danger"
                : "success"
            }
          />
          <WrapHighlight
            label="Pengeluaran terbesar"
            value={data.largestExpense?.note ?? "Belum ada transaksi"}
            detail={
              data.largestExpense
                ? formatIDR(data.largestExpense.amount)
                : "Tambahkan pengeluaran dulu"
            }
            tone="neutral"
          />
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <Button onClick={exportWrap} size="sm" type="button" variant="secondary">
          <Download aria-hidden="true" className="h-4 w-4" />
          {isExporting ? "Menyiapkan..." : "Export PNG"}
        </Button>
      </div>
    </Card>
  )
}

function WrapMetric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string
  icon: typeof ReceiptText
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium text-tertiary">{label}</p>
      <p className="mt-1 truncate font-mono text-lg font-bold tabular-nums text-primary">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-secondary">{detail}</p>
    </div>
  )
}

function WrapHighlight({
  detail,
  label,
  tone,
  value,
}: {
  detail: string
  label: string
  tone: "danger" | "neutral" | "success"
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium text-tertiary">{label}</p>
      <p className="mt-1 truncate text-base font-bold text-primary">{value}</p>
      <p
        className={cn(
          "mt-1 font-mono text-sm font-bold tabular-nums",
          tone === "danger"
            ? "text-danger"
            : tone === "success"
              ? "text-success"
              : "text-secondary",
        )}
      >
        {detail}
      </p>
    </div>
  )
}
