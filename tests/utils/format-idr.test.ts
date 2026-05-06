import { describe, expect, it } from "vitest"

import { formatIDR } from "@/lib/utils/format-idr"

describe("formatIDR", () => {
  it("formats Indonesian Rupiah without decimals", () => {
    expect(formatIDR(1250000)).toBe("Rp 1.250.000")
  })

  it("rounds decimal values to whole rupiah", () => {
    expect(formatIDR(1250.5)).toBe("Rp 1.251")
  })

  it("falls back to zero for invalid numbers", () => {
    expect(formatIDR(Number.NaN)).toBe("Rp 0")
  })
})
