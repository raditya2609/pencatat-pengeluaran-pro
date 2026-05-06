import { describe, expect, it } from "vitest"

import {
  expenseFormSchema,
  parseTags,
} from "@/lib/validation/expense-schema"

describe("expense form validation", () => {
  it("accepts a valid expense form payload", () => {
    const result = expenseFormSchema.safeParse({
      amount: 50000,
      categoryId: "cat-food",
      note: "Makan siang",
      date: "2026-05-05",
      time: "12:30",
      paymentMethod: "ewallet",
      tagsText: "kantor, makan",
    })

    expect(result.success).toBe(true)
  })

  it("rejects zero amount", () => {
    const result = expenseFormSchema.safeParse({
      amount: 0,
      categoryId: "cat-food",
      date: "2026-05-05",
    })

    expect(result.success).toBe(false)
  })

  it("normalizes comma-separated tags", () => {
    expect(parseTags(" Kopi, Kerja, , Bulanan ")).toEqual([
      "kopi",
      "kerja",
      "bulanan",
    ])
  })
})
