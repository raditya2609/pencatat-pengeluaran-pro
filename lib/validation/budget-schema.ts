import { z } from "zod"

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  amount: z
    .number({
      error: "Nominal anggaran wajib diisi.",
    })
    .int("Nominal harus berupa angka bulat.")
    .positive("Nominal harus lebih dari Rp 0."),
  period: z.enum(["monthly", "weekly"]),
  rollover: z.boolean(),
})

export type BudgetFormValues = z.infer<typeof budgetFormSchema>
