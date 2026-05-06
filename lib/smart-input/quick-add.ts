import type { Category, PaymentMethod } from "@/lib/types/finance"
import type { ExpenseDraft } from "@/lib/store/use-finance-store"

interface ParsedAmount {
  amount: number
  raw: string
}

const categoryKeywords: Record<string, string[]> = {
  "cat-food": ["makan", "sarapan", "siang", "malam", "kopi", "warteg", "resto"],
  "cat-transport": ["ojek", "grab", "gojek", "bensin", "tol", "parkir"],
  "cat-shopping": ["belanja", "baju", "sepatu", "marketplace", "tokopedia"],
  "cat-bills": ["tagihan", "listrik", "internet", "pulsa", "air", "pln"],
  "cat-entertainment": ["film", "bioskop", "netflix", "game", "hiburan"],
  "cat-health": ["obat", "dokter", "vitamin", "klinik", "apotek"],
  "cat-education": ["buku", "kursus", "kelas", "sekolah"],
  "cat-investment": ["saham", "reksa", "crypto", "investasi"],
  "cat-donation": ["hadiah", "donasi", "zakat", "sedekah"],
}

const paymentKeywords: Record<PaymentMethod, string[]> = {
  cash: ["cash", "tunai"],
  debit: ["debit"],
  credit: ["kredit", "cc", "kartu kredit"],
  ewallet: ["gopay", "ovo", "dana", "shopeepay", "ewallet", "e-wallet"],
  transfer: ["transfer", "tf"],
}

export function parseQuickExpense(
  input: string,
  categories: Category[],
  selectedMonthId: string,
): ExpenseDraft | null {
  const normalized = input.trim().toLowerCase()
  const parsedAmount = parseAmount(normalized)

  if (!normalized || !parsedAmount) {
    return null
  }

  const categoryId = inferCategoryId(normalized, categories)
  const paymentMethod = inferPaymentMethod(normalized)
  const note = cleanupNote(input, parsedAmount.raw)

  return {
    amount: parsedAmount.amount,
    categoryId,
    note,
    date: getDefaultDate(selectedMonthId),
    paymentMethod,
    tags: [],
  }
}

export function createTemplateExpense(
  template: QuickExpenseTemplate,
  selectedMonthId: string,
): ExpenseDraft {
  return {
    amount: template.amount,
    categoryId: template.categoryId,
    note: template.note,
    date: getDefaultDate(selectedMonthId),
    paymentMethod: template.paymentMethod,
    tags: template.tags,
  }
}

export interface QuickExpenseTemplate {
  id: string
  label: string
  amount: number
  categoryId: string
  note: string
  paymentMethod?: PaymentMethod
  tags: string[]
}

export const quickExpenseTemplates: QuickExpenseTemplate[] = [
  {
    id: "template-coffee",
    label: "Kopi pagi",
    amount: 35000,
    categoryId: "cat-food",
    note: "Kopi pagi",
    paymentMethod: "ewallet",
    tags: ["kopi"],
  },
  {
    id: "template-lunch",
    label: "Makan siang",
    amount: 50000,
    categoryId: "cat-food",
    note: "Makan siang",
    paymentMethod: "debit",
    tags: ["makan"],
  },
  {
    id: "template-fuel",
    label: "Bensin",
    amount: 150000,
    categoryId: "cat-transport",
    note: "Bensin",
    paymentMethod: "debit",
    tags: ["kendaraan"],
  },
]

function parseAmount(input: string): ParsedAmount | null {
  const match = input.match(
    /(?:rp\s*)?(\d+(?:[.,]\d+)?)(?:\s*)(rb|ribu|k|jt|juta)?|\b(\d{4,})\b/i,
  )

  if (!match) {
    return null
  }

  const raw = match[0]
  const compactNumber = match[1] ?? match[3]
  const suffix = match[2]
  const number = parseLocalizedNumber(compactNumber)

  if (!Number.isFinite(number) || number <= 0) {
    return null
  }

  if (suffix === "jt" || suffix === "juta") {
    return { amount: Math.round(number * 1_000_000), raw }
  }

  if (suffix === "rb" || suffix === "ribu" || suffix === "k") {
    return { amount: Math.round(number * 1_000), raw }
  }

  return { amount: Math.round(number), raw }
}

function parseLocalizedNumber(value: string): number {
  const hasDecimalComma = /^\d+,\d{1,2}$/.test(value)

  if (hasDecimalComma) {
    return Number(value.replace(",", "."))
  }

  return Number(value.replace(/\./g, "").replace(",", "."))
}

function inferCategoryId(input: string, categories: Category[]): string {
  for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => input.includes(keyword))) {
      return categoryId
    }
  }

  return categories.find((category) => category.id === "cat-other")?.id ?? categories[0]?.id ?? ""
}

function inferPaymentMethod(input: string): PaymentMethod | undefined {
  return Object.entries(paymentKeywords).find(([, keywords]) =>
    keywords.some((keyword) => input.includes(keyword)),
  )?.[0] as PaymentMethod | undefined
}

function cleanupNote(input: string, rawAmount: string): string {
  return input
    .replace(rawAmount, "")
    .replace(/\s+/g, " ")
    .replace(/\b(pakai|via|dengan)\s+(cash|tunai|debit|kredit|gopay|ovo|dana|transfer|tf)\b/gi, "")
    .trim()
}

function getDefaultDate(selectedMonthId: string): string {
  const today = new Date().toISOString().slice(0, 10)

  return today.startsWith(selectedMonthId) ? today : `${selectedMonthId}-01`
}
