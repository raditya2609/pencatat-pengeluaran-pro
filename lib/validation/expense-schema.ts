import { z } from "zod"

export const expenseFormSchema = z.object({
  amount: z
    .number({
      error: "Nominal wajib diisi.",
    })
    .int("Nominal harus berupa angka bulat.")
    .positive("Nominal harus lebih dari Rp 0."),
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  note: z.string().max(120, "Catatan maksimal 120 karakter.").optional(),
  date: z.string().min(1, "Tanggal wajib diisi."),
  time: z.string().optional(),
  paymentMethod: z
    .union([
      z.enum(["cash", "debit", "credit", "ewallet", "transfer"]),
      z.literal(""),
    ])
    .optional(),
  tagsText: z.string().max(120, "Tag maksimal 120 karakter.").optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

export function parseTags(tagsText?: string): string[] {
  return (
    tagsText
      ?.split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean) ?? []
  )
}
