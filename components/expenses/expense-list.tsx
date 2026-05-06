"use client"

import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Edit3, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { EmptyExpenses } from "@/components/expenses/empty-expenses"
import { getPaymentMethodLabel, paymentMethodOptions } from "@/components/expenses/payment-method"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Category, Expense, PaymentMethod } from "@/lib/types/finance"
import { formatIDR } from "@/lib/utils/format-idr"

interface ExpenseListProps {
  categories: Category[]
  expenses: Expense[]
  onAddExpense: () => void
  onDeleteExpense: (id: string) => void
  onEditExpense: (expense: Expense) => void
}

type ExpenseGroup = {
  date: string
  label: string
  expenses: Expense[]
}

export function ExpenseList({
  categories,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
}: ExpenseListProps) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">(
    "all",
  )

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return expenses.filter((expense) => {
      const category = categoriesById.get(expense.categoryId)
      const haystack = [
        expense.note,
        category?.name,
        expense.amount.toString(),
        formatIDR(expense.amount),
        ...expense.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery)
      const matchesCategory =
        categoryFilter === "all" || expense.categoryId === categoryFilter
      const matchesPayment =
        paymentFilter === "all" || expense.paymentMethod === paymentFilter

      return matchesSearch && matchesCategory && matchesPayment
    })
  }, [categoriesById, categoryFilter, expenses, paymentFilter, query])

  const groups = useMemo<ExpenseGroup[]>(() => {
    const grouped = new Map<string, Expense[]>()

    filteredExpenses.forEach((expense) => {
      const current = grouped.get(expense.date) ?? []
      grouped.set(expense.date, [...current, expense])
    })

    return Array.from(grouped.entries()).map(([date, groupExpenses]) => ({
      date,
      label: format(parseISO(date), "EEEE, d MMMM yyyy", {
        locale: idLocale,
      }),
      expenses: groupExpenses,
    }))
  }, [filteredExpenses])

  if (!expenses.length) {
    return <EmptyExpenses />
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-secondary">
          <Search aria-hidden="true" className="h-4 w-4" />
          <label className="sr-only" htmlFor="expense-search">
            Cari pengeluaran
          </label>
          <input
            className="min-h-11 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary"
            id="expense-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari catatan, tag, kategori..."
            type="search"
            value={query}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-secondary">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Filter kategori</span>
            <select
              className="min-h-8 flex-1 bg-transparent text-primary outline-none"
              onChange={(event) => setCategoryFilter(event.target.value)}
              value={categoryFilter}
            >
              <option value="all">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-secondary">
            <span className="sr-only">Filter metode pembayaran</span>
            <select
              className="min-h-8 w-full bg-transparent text-primary outline-none"
              onChange={(event) =>
                setPaymentFilter(event.target.value as PaymentMethod | "all")
              }
              value={paymentFilter}
            >
              <option value="all">Semua metode</option>
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {groups.length ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.date}>
              <div className="sticky top-0 z-10 -mx-1 bg-background/92 px-1 py-2 backdrop-blur md:top-2">
                <h3 className="text-sm font-bold capitalize text-secondary">
                  {group.label}
                </h3>
              </div>
              <div className="space-y-2">
                {group.expenses.map((expense) => (
                  <ExpenseRow
                    category={categoriesById.get(expense.categoryId)}
                    expense={expense}
                    key={expense.id}
                    onDelete={() => onDeleteExpense(expense.id)}
                    onEdit={() => onEditExpense(expense)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-48 flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-primary">
            Tidak ada hasil yang cocok
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-secondary">
            Coba ubah kata kunci atau filter untuk melihat pengeluaran lainnya.
          </p>
          <Button className="mt-4" onClick={onAddExpense} variant="secondary">
            Tambah pengeluaran
          </Button>
        </Card>
      )}
    </div>
  )
}

function ExpenseRow({
  category,
  expense,
  onDelete,
  onEdit,
}: {
  category?: Category
  expense: Expense
  onDelete: () => void
  onEdit: () => void
}) {
  const [offset, setOffset] = useState(0)
  const startX = useRef<number | null>(null)

  return (
    <div className="relative overflow-hidden rounded-lg">
      <button
        aria-label="Hapus pengeluaran"
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-danger text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={onDelete}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-5 w-5" />
      </button>

      <Card
        className="relative flex touch-pan-y items-center gap-3 p-3 transition-transform"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") {
            startX.current = event.clientX
          }
        }}
        onPointerMove={(event) => {
          if (startX.current === null) {
            return
          }

          const delta = event.clientX - startX.current
          setOffset(Math.max(-96, Math.min(0, delta)))
        }}
        onPointerUp={() => {
          setOffset((currentOffset) => (currentOffset < -48 ? -96 : 0))
          startX.current = null
        }}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${category?.color ?? "#6B6B70"}22` }}
        >
          <span aria-hidden="true">{category?.emoji ?? "📦"}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary">
                {expense.note || category?.name || "Pengeluaran"}
              </p>
              <p className="mt-1 truncate text-xs text-secondary">
                {category?.name ?? "Tanpa kategori"} ·{" "}
                {getPaymentMethodLabel(expense.paymentMethod)}
                {expense.time ? ` · ${expense.time}` : ""}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-primary">
              {formatIDR(expense.amount)}
            </p>
          </div>

          {expense.tags.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {expense.tags.map((tag) => (
                <span
                  className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          aria-label="Edit pengeluaran"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={onEdit}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Edit3 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}
