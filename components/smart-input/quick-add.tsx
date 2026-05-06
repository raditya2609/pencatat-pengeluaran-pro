"use client"

import { Sparkles } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  createTemplateExpense,
  parseQuickExpense,
  quickExpenseTemplates,
} from "@/lib/smart-input/quick-add"
import type { ExpenseDraft } from "@/lib/store/use-finance-store"
import type { Category } from "@/lib/types/finance"
import { formatIDR } from "@/lib/utils/format-idr"

interface SmartQuickAddProps {
  categories: Category[]
  selectedMonthId: string
  onAddExpense: (draft: ExpenseDraft) => void
}

export function SmartQuickAdd({
  categories,
  selectedMonthId,
  onAddExpense,
}: SmartQuickAddProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const submitQuickAdd = () => {
    const draft = parseQuickExpense(input, categories, selectedMonthId)

    if (!draft) {
      setError("Tulis nominalnya juga, misalnya: makan siang 50rb.")
      return
    }

    onAddExpense(draft)
    setInput("")
    setError("")
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-primary">Quick add</h2>
          <p className="mt-1 text-sm leading-6 text-secondary">
            Contoh: makan siang 50rb di warteg pakai gopay
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="quick-add">
          Tambah pengeluaran cepat
        </label>
        <input
          className="min-h-12 flex-1 rounded-lg border border-border bg-background px-3 text-primary outline-none placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-accent"
          id="quick-add"
          onChange={(event) => {
            setInput(event.target.value)
            setError("")
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submitQuickAdd()
            }
          }}
          placeholder="makan siang 50rb di warteg"
          type="text"
          value={input}
        />
        <Button onClick={submitQuickAdd} type="button">
          Tambah
        </Button>
      </div>

      {error ? (
        <p aria-live="polite" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickExpenseTemplates.map((template) => (
          <button
            className="min-w-fit rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            key={template.id}
            onClick={() =>
              onAddExpense(createTemplateExpense(template, selectedMonthId))
            }
            type="button"
          >
            <p className="text-sm font-bold text-primary">{template.label}</p>
            <p className="mt-1 font-mono text-xs font-semibold text-secondary">
              {formatIDR(template.amount)}
            </p>
          </button>
        ))}
      </div>
    </Card>
  )
}
