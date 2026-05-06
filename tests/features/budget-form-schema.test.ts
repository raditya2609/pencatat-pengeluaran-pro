import { describe, expect, it } from "vitest"

import { budgetFormSchema } from "@/lib/validation/budget-schema"

describe("budget form validation", () => {
  it("accepts a valid budget payload", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: "TOTAL",
      amount: 1500000,
      period: "monthly",
      rollover: false,
    })

    expect(result.success).toBe(true)
  })

  it("rejects zero budget amount", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: "TOTAL",
      amount: 0,
      period: "monthly",
      rollover: false,
    })

    expect(result.success).toBe(false)
  })
})
