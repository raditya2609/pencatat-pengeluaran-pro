"use client"

import { CheckCircle2, Lightbulb, TrendingUp, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Insight } from "@/lib/types/finance"
import { cn } from "@/lib/utils/cn"

interface InsightCardsProps {
  insights: Insight[]
  onDismiss: (insight: Insight) => void
}

export function InsightCards({ insights, onDismiss }: InsightCardsProps) {
  if (!insights.length) {
    return null
  }

  return (
    <section aria-label="Insight keuangan" className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-primary">Insight</h2>
        <p className="mt-1 text-sm text-secondary">
          Sinyal penting dari pola pengeluaranmu.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {insights.map((insight) => {
          const Icon =
            insight.severity === "celebration"
              ? CheckCircle2
              : insight.severity === "warning"
                ? TrendingUp
                : Lightbulb

          return (
            <Card
              className={cn(
                "relative overflow-hidden",
                insight.severity === "warning" && "border-warning/40",
                insight.severity === "celebration" && "border-success/40",
              )}
              key={insight.id}
            >
              <div className="flex gap-3 pr-9">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    insight.severity === "warning"
                      ? "bg-warning/15 text-warning"
                      : insight.severity === "celebration"
                        ? "bg-success/15 text-success"
                        : "bg-accent-soft text-accent",
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">
                    {insight.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-secondary">
                    {insight.description}
                  </p>
                </div>
              </div>

              <Button
                aria-label="Sembunyikan insight"
                className="absolute right-2 top-2 h-9 w-9"
                onClick={() => onDismiss(insight)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
