import type { PaymentMethod } from "@/lib/types/finance"

export const paymentMethodOptions: Array<{
  value: PaymentMethod
  label: string
}> = [
  { value: "cash", label: "Tunai" },
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Kartu kredit" },
  { value: "ewallet", label: "E-wallet" },
  { value: "transfer", label: "Transfer" },
]

export function getPaymentMethodLabel(method?: PaymentMethod): string {
  return (
    paymentMethodOptions.find((option) => option.value === method)?.label ??
    "Tanpa metode"
  )
}
