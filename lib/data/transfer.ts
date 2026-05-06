import type { Category, Expense, FinanceSnapshot, PaymentMethod } from "@/lib/types/finance"
import type { ExpenseDraft } from "@/lib/store/use-finance-store"

const expenseHeaders = [
  "date",
  "time",
  "amount",
  "categoryId",
  "categoryName",
  "note",
  "paymentMethod",
  "tags",
]

export function createSnapshotJson(snapshot: FinanceSnapshot): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      snapshot,
    },
    null,
    2,
  )
}

export function createExpensesCsv(
  expenses: Expense[],
  categories: Category[],
): string {
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const rows = expenses.map((expense) => [
    expense.date,
    expense.time ?? "",
    expense.amount.toString(),
    expense.categoryId,
    categoryMap.get(expense.categoryId)?.name ?? "",
    expense.note ?? "",
    expense.paymentMethod ?? "",
    expense.tags.join("|"),
  ])

  return [expenseHeaders, ...rows].map(toCsvRow).join("\n")
}

export function parseExpensesCsv(
  csv: string,
  categories: Category[],
): ExpenseDraft[] {
  const rows = parseCsvRows(csv).filter((row) => row.some(Boolean))

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0]!.map((header) => header.trim())
  const categoryByName = new Map(
    categories.map((category) => [category.name.toLowerCase(), category.id]),
  )

  return rows.slice(1).flatMap((row) => {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, row[index]?.trim() ?? ""]),
    )
    const amount = Number(record.amount)
    const categoryId =
      record.categoryId ||
      categoryByName.get(record.categoryName?.toLowerCase() ?? "") ||
      categories.find((category) => category.id === "cat-other")?.id ||
      categories[0]?.id ||
      ""

    if (!record.date || !Number.isFinite(amount) || amount <= 0 || !categoryId) {
      return []
    }

    return [
      {
        amount: Math.round(amount),
        categoryId,
        date: record.date,
        note: record.note || undefined,
        paymentMethod: normalizePaymentMethod(record.paymentMethod),
        tags: record.tags
          ? record.tags
              .split("|")
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean)
          : [],
        time: record.time || undefined,
      },
    ]
  })
}

export function downloadTextFile({
  filename,
  mimeType,
  text,
}: {
  filename: string
  mimeType: string
  text: string
}) {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

function toCsvRow(row: string[]): string {
  return row
    .map((cell) => {
      const escaped = cell.replace(/"/g, "\"\"")

      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    })
    .join(",")
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ""
  let inQuotes = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    const nextChar = csv[index + 1]

    if (char === "\"" && inQuotes && nextChar === "\"") {
      currentCell += "\""
      index += 1
      continue
    }

    if (char === "\"") {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell)
      currentCell = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1
      }
      currentRow.push(currentCell)
      rows.push(currentRow)
      currentRow = []
      currentCell = ""
      continue
    }

    currentCell += char
  }

  currentRow.push(currentCell)
  rows.push(currentRow)

  return rows
}

function normalizePaymentMethod(value?: string): PaymentMethod | undefined {
  if (
    value === "cash" ||
    value === "debit" ||
    value === "credit" ||
    value === "ewallet" ||
    value === "transfer"
  ) {
    return value
  }

  return undefined
}
