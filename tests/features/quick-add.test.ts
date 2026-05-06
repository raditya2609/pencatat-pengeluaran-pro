import { describe, expect, it } from "vitest"

import {
  createTemplateExpense,
  parseQuickExpense,
  quickExpenseTemplates,
} from "@/lib/smart-input/quick-add"
import { defaultCategories } from "@/lib/constants/default-categories"

describe("quick add parser", () => {
  it("parses Indonesian shorthand amount and category", () => {
    const draft = parseQuickExpense(
      "makan siang 50rb di warteg pakai gopay",
      defaultCategories,
      "2026-05",
    )

    expect(draft).toMatchObject({
      amount: 50000,
      categoryId: "cat-food",
      paymentMethod: "ewallet",
    })
    expect(draft?.note).toContain("makan siang")
  })

  it("parses juta amount", () => {
    const draft = parseQuickExpense(
      "bayar internet 1,2jt transfer",
      defaultCategories,
      "2026-05",
    )

    expect(draft).toMatchObject({
      amount: 1200000,
      categoryId: "cat-bills",
      paymentMethod: "transfer",
    })
  })

  it("returns null without amount", () => {
    expect(parseQuickExpense("makan siang", defaultCategories, "2026-05")).toBeNull()
  })

  it("creates one-tap template expense", () => {
    const draft = createTemplateExpense(quickExpenseTemplates[0]!, "2026-05")

    expect(draft).toMatchObject({
      amount: 35000,
      categoryId: "cat-food",
      tags: ["kopi"],
    })
  })
})
