import { Card } from "@/components/ui/card"

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-primary">
      <Card className="max-w-sm text-center">
        <h1 className="text-2xl font-bold">Kamu sedang offline</h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          Tenang, Pencatat Pengeluaran Pro dirancang untuk tetap bisa dipakai
          tanpa koneksi internet.
        </p>
      </Card>
    </main>
  )
}
