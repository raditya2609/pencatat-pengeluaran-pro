import { describe, expect, it } from "vitest"

import {
  createExpensesCsv,
  createSnapshotJson,
  parseExpensesCsv,
} from "@/lib/data/transfer"
import { defaultCategories } from "@/lib/constants/default-categories"
import { createInitialSnapshot } from "@/lib/repository/seed"
import type { Expense } from "@/lib/types/finance"

const expense: Expense = {
  id: "expense-1",
  amount: 50000,
  categoryId: "cat-food",
  date: "2026-05-05",
  note: "Makan, siang",
  paymentMethod: "ewallet",
  tags: ["makan", "kantor"],
  time: "12:30",
  createdAt: "2026-05-05T00:00:00.000Z",
  updatedAt: "2026-05-05T00:00:00.000Z",
}

describe("data transfer utilities", () => {
  it("exports and imports expenses as CSV", () => {
    const csv = createExpensesCsv([expense], defaultCategories)
    const drafts = parseExpensesCsv(csv, defaultCategories)

    expect(csv).toContain("\"Makan, siang\"")
    expect(drafts).toEqual([
      {
        amount: 50000,
        categoryId: "cat-food",
        date: "2026-05-05",
        note: "Makan, siang",
        paymentMethod: "ewallet",
        tags: ["makan", "kantor"],
        time: "12:30",
      },
    ])
  })

  it("exports full snapshot JSON with metadata", () => {
    const parsed = JSON.parse(createSnapshotJson(createInitialSnapshot()))

    expect(parsed.version).toBe(1)
    expect(parsed.snapshot.categories).toHaveLength(11)
    expect(parsed.exportedAt).toEqual(expect.any(String))
  })
})
