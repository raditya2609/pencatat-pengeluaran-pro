"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BudgetDraft } from "@/lib/store/use-finance-store"
import type { Budget, Category } from "@/lib/types/finance"
import {
  budgetFormSchema,
  type BudgetFormValues,
} from "@/lib/validation/budget-schema"

interface BudgetFormDialogProps {
  budgets: Budget[]
  categories: Category[]
  editingBudget?: Budget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitBudget: (draft: BudgetDraft) => void
}

export function BudgetFormDialog({
  budgets,
  categories,
  editingBudget,
  open,
  onOpenChange,
  onSubmitBudget,
}: BudgetFormDialogProps) {
  const usedCategoryIds = useMemo(
    () =>
      new Set(
        budgets
          .filter((budget) => budget.id !== editingBudget?.id)
          .map((budget) => budget.categoryId),
      ),
    [budgets, editingBudget],
  )

  const defaultCategoryId = useMemo(() => {
    if (editingBudget) {
      return editingBudget.categoryId
    }

    if (!usedCategoryIds.has("TOTAL")) {
      return "TOTAL"
    }

    return (
      categories.find((category) => !usedCategoryIds.has(category.id))?.id ??
      "TOTAL"
    )
  }, [categories, editingBudget, usedCategoryIds])

  const defaultValues = useMemo<BudgetFormValues>(
    () => ({
      categoryId: defaultCategoryId,
      amount: editingBudget?.amount ?? 0,
      period: editingBudget?.period ?? "monthly",
      rollover: editingBudget?.rollover ?? false,
    }),
    [defaultCategoryId, editingBudget],
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [defaultValues, open, reset])

  const submit = handleSubmit((values) => {
    onSubmitBudget(values)
    onOpenChange(false)
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent aria-describedby="budget-form-description">
        <div className="pr-12">
          <DialogTitle className="text-xl font-bold text-primary">
            {editingBudget ? "Edit anggaran" : "Tambah anggaran"}
          </DialogTitle>
          <DialogDescription
            className="mt-2 text-sm leading-6 text-secondary"
            id="budget-form-description"
          >
            Tetapkan batas supaya pengeluaran bulanan lebih mudah dipantau.
          </DialogDescription>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Field label="Kategori" message={errors.categoryId?.message}>
            <select
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
              {...register("categoryId")}
            >
              <option disabled={usedCategoryIds.has("TOTAL")} value="TOTAL">
                💳 Total Bulanan
              </option>
              {categories.map((category) => (
                <option
                  disabled={usedCategoryIds.has(category.id)}
                  key={category.id}
                  value={category.id}
                >
                  {category.emoji ? `${category.emoji} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nominal anggaran" message={errors.amount?.message}>
            <div className="flex overflow-hidden rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-accent">
              <span className="flex items-center border-r border-border px-3 text-sm font-semibold text-secondary">
                Rp
              </span>
              <input
                className="min-h-12 w-full bg-transparent px-3 text-base font-semibold tabular-nums text-primary outline-none placeholder:text-tertiary"
                inputMode="numeric"
                min={0}
                placeholder="1500000"
                type="number"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
          </Field>

          <Field label="Periode" message={errors.period?.message}>
            <select
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
              {...register("period")}
            >
              <option value="monthly">Bulanan</option>
              <option value="weekly">Mingguan</option>
            </select>
          </Field>

          <label className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-background px-3">
            <span className="text-sm font-semibold text-secondary">
              Rollover sisa anggaran
            </span>
            <input
              className="h-5 w-5 accent-[var(--accent)]"
              type="checkbox"
              {...register("rollover")}
            />
          </label>

          <div aria-live="polite" className="sr-only">
            {Object.values(errors)
              .map((error) => error?.message)
              .filter(Boolean)
              .join(". ")}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              Batal
            </Button>
            <Button className="flex-1" disabled={isSubmitting} type="submit">
              {editingBudget ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  children,
  label,
  message,
}: {
  children: React.ReactNode
  label: string
  message?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-secondary">
        {label}
      </span>
      {children}
      {message ? (
        <span className="mt-2 block text-sm text-danger">{message}</span>
      ) : null}
    </label>
  )
}
