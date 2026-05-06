import { WalletCards } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmptySummaryProps {
  onDemoClick: () => void
}

export function EmptySummary({ onDemoClick }: EmptySummaryProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative p-5">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-accent-soft" />
        <div className="relative">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <WalletCards aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-primary">
            Belum ada pengeluaran bulan ini
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-secondary">
            Tambahkan yang pertama dengan tombol + di bawah!
          </p>
          <Button className="mt-5" onClick={onDemoClick} variant="secondary">
            Lihat Demo
          </Button>
        </div>
      </div>
    </Card>
  )
}
