"use client"

import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      aria-label="Tambah pengeluaran"
      className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-glow transition duration-200 hover:scale-[1.04] hover:bg-accent-hover active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:bottom-8 md:right-8"
      onClick={onClick}
      type="button"
    >
      <Plus aria-hidden="true" className="h-7 w-7" />
    </button>
  )
}
