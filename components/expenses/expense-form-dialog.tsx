"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { paymentMethodOptions } from "@/components/expenses/payment-method"
import type { Category, Expense } from "@/lib/types/finance"
import type { ExpenseDraft } from "@/lib/store/use-finance-store"
import {
  expenseFormSchema,
  type ExpenseFormValues,
  parseTags,
} from "@/lib/validation/expense-schema"

interface ExpenseFormDialogProps {
  categories: Category[]
  editingExpense?: Expense | null
  open: boolean
  selectedMonthId: string
  onOpenChange: (open: boolean) => void
  onSubmitExpense: (draft: ExpenseDraft) => void
}

function getDefaultDate(selectedMonthId: string): string {
  const today = new Date().toISOString().slice(0, 10)

  if (today.startsWith(selectedMonthId)) {
    return today
  }

  return `${selectedMonthId}-01`
}

export function ExpenseFormDialog({
  categories,
  editingExpense,
  open,
  selectedMonthId,
  onOpenChange,
  onSubmitExpense,
}: ExpenseFormDialogProps) {
  const defaultValues = useMemo<ExpenseFormValues>(
    () => ({
      amount: editingExpense?.amount ?? 0,
      categoryId: editingExpense?.categoryId ?? categories[0]?.id ?? "",
      note: editingExpense?.note ?? "",
      date: editingExpense?.date ?? getDefaultDate(selectedMonthId),
      time: editingExpense?.time ?? "",
      paymentMethod: editingExpense?.paymentMethod,
      tagsText: editingExpense?.tags.join(", ") ?? "",
    }),
    [categories, editingExpense, selectedMonthId],
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [defaultValues, open, reset])

  const submit = handleSubmit((values) => {
    onSubmitExpense({
      amount: values.amount,
      categoryId: values.categoryId,
      note: values.note,
      date: values.date,
      time: values.time,
      paymentMethod: values.paymentMethod || undefined,
      tags: parseTags(values.tagsText),
    })
    onOpenChange(false)
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent aria-describedby="expense-form-description">
        <div className="pr-12">
          <DialogTitle className="text-xl font-bold text-primary">
            {editingExpense ? "Edit pengeluaran" : "Tambah pengeluaran"}
          </DialogTitle>
          <DialogDescription
            className="mt-2 text-sm leading-6 text-secondary"
            id="expense-form-description"
          >
            Catat nominal, kategori, dan detail singkat supaya laporanmu makin
            akurat.
          </DialogDescription>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Field label="Nominal" message={errors.amount?.message}>
            <div className="flex overflow-hidden rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-accent">
              <span className="flex items-center border-r border-border px-3 text-sm font-semibold text-secondary">
                Rp
              </span>
              <input
                className="min-h-12 w-full bg-transparent px-3 text-base font-semibold tabular-nums text-primary outline-none placeholder:text-tertiary"
                inputMode="numeric"
                min={0}
                placeholder="50000"
                type="number"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
          </Field>

          <Field label="Kategori" message={errors.categoryId?.message}>
            <select
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
              {...register("categoryId")}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji ? `${category.emoji} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Catatan" message={errors.note?.message}>
            <input
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="Contoh: makan siang di warteg"
              type="text"
              {...register("note")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal" message={errors.date?.message}>
              <input
                className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
                type="date"
                {...register("date")}
              />
            </Field>
            <Field label="Jam" message={errors.time?.message}>
              <input
                className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
                type="time"
                {...register("time")}
              />
            </Field>
          </div>

          <Field
            label="Metode pembayaran"
            message={errors.paymentMethod?.message}
          >
            <select
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
              {...register("paymentMethod")}
            >
              <option value="">Tanpa metode</option>
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tag" message={errors.tagsText?.message}>
            <input
              className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-primary outline-none placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="kopi, kerja, bulanan"
              type="text"
              {...register("tagsText")}
            />
          </Field>

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
              {editingExpense ? "Simpan" : "Tambah"}
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
