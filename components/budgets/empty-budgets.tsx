import { Gauge } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmptyBudgetsProps {
  onAddBudget?: () => void
  onDemoClick?: () => void
}

export function EmptyBudgets({ onAddBudget, onDemoClick }: EmptyBudgetsProps) {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center text-center">
      <Gauge aria-hidden="true" className="mb-4 h-10 w-10 text-tertiary" />
      <h2 className="text-lg font-bold text-primary">Belum ada anggaran</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-secondary">
        Atur batas pengeluaran per kategori untuk mengontrol keuanganmu.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onAddBudget ? (
          <Button onClick={onAddBudget} type="button">
            Tambah anggaran
          </Button>
        ) : null}
        {onDemoClick ? (
          <Button onClick={onDemoClick} type="button" variant="secondary">
            Lihat Demo
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
