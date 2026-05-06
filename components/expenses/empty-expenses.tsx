import { ClipboardList } from "lucide-react"

import { Card } from "@/components/ui/card"

export function EmptyExpenses() {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center text-center">
      <ClipboardList aria-hidden="true" className="mb-4 h-10 w-10 text-tertiary" />
      <h2 className="text-lg font-bold text-primary">Daftar masih kosong</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-secondary">
        Pengeluaran yang kamu catat akan muncul di sini, tersusun rapi per
        tanggal.
      </p>
    </Card>
  )
}
