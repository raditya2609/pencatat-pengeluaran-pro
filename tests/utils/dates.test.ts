import { describe, expect, it } from "vitest"

import { getMonthPills, toMonthId } from "@/lib/utils/dates"

describe("date utilities", () => {
  it("creates 12 months back plus current month and 1 forward", () => {
    const months = getMonthPills(new Date("2026-05-05T12:00:00.000Z"))

    expect(months).toHaveLength(14)
    expect(months[0]?.id).toBe("2025-05")
    expect(months[12]?.id).toBe("2026-05")
    expect(months[13]?.id).toBe("2026-06")
    expect(months[12]?.isCurrentMonth).toBe(true)
  })

  it("adds year context for month pills outside the current year", () => {
    const months = getMonthPills(new Date(2026, 4, 5, 12))

    expect(months[0]?.displayLabel).toBe("Mei '25")
    expect(months[8]?.displayLabel).toBe("Jan")
    expect(months[12]?.selectedLabel).toBe("Mei 2026")
  })

  it("converts dates to stable month ids", () => {
    expect(toMonthId(new Date(2026, 4, 31, 12))).toBe("2026-05")
  })
})
