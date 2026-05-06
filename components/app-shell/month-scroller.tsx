"use client"

import { useMemo } from "react"

import { getMonthPills } from "@/lib/utils/dates"
import { cn } from "@/lib/utils/cn"

interface MonthScrollerProps {
  selectedMonthId: string
  onMonthChange: (monthId: string) => void
}

export function MonthScroller({
  selectedMonthId,
  onMonthChange,
}: MonthScrollerProps) {
  const months = useMemo(() => getMonthPills(), [])

  return (
    <section aria-label="Pilih bulan" className="-mx-4 overflow-hidden px-4">
      <div className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {months.map((month) => {
          const isSelected = selectedMonthId === month.id

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "min-w-fit snap-center rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-secondary hover:bg-surface-elevated hover:text-primary",
              )}
              key={month.id}
              onClick={() => onMonthChange(month.id)}
              type="button"
            >
              {isSelected ? month.selectedLabel : month.displayLabel}
              {month.isCurrentMonth ? (
                <span className="ml-1 text-[11px] opacity-80">ini</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
