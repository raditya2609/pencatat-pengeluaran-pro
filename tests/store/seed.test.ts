import { describe, expect, it } from "vitest"

import { createInitialSnapshot } from "@/lib/repository/seed"

describe("createInitialSnapshot", () => {
  it("seeds default Indonesian expense categories", () => {
    const snapshot = createInitialSnapshot()

    expect(snapshot.categories).toHaveLength(11)
    expect(snapshot.categories.map((category) => category.name)).toContain(
      "Makanan & Minuman",
    )
    expect(snapshot.categories.every((category) => category.isDefault)).toBe(
      true,
    )
  })

  it("starts with empty user-owned collections and dark settings", () => {
    const snapshot = createInitialSnapshot()

    expect(snapshot.expenses).toEqual([])
    expect(snapshot.budgets).toEqual([])
    expect(snapshot.settings).toMatchObject({
      theme: "dark",
      currency: "IDR",
      demoDataEnabled: false,
    })
  })
})
