"use client"

import { Download, FileUp, RotateCcw, Settings2, Trash2 } from "lucide-react"
import { useRef, useState } from "react"

import { AchievementPanel } from "@/components/achievements/achievement-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AchievementStats } from "@/lib/analytics/achievements"
import {
  createExpensesCsv,
  createSnapshotJson,
  downloadTextFile,
  parseExpensesCsv,
} from "@/lib/data/transfer"
import type { ExpenseDraft } from "@/lib/store/use-finance-store"
import type { AppSettings, Category, FinanceSnapshot } from "@/lib/types/finance"

interface SettingsDashboardProps {
  achievementStats: AchievementStats
  categories: Category[]
  settings: AppSettings
  snapshot: FinanceSnapshot
  onImportExpenses: (drafts: ExpenseDraft[]) => void
  onResetAllData: () => void
  onUpdateSettings: (settings: Partial<AppSettings>) => void
}

export function SettingsDashboard({
  achievementStats,
  categories,
  settings,
  snapshot,
  onImportExpenses,
  onResetAllData,
  onUpdateSettings,
}: SettingsDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmText, setConfirmText] = useState("")
  const [importMessage, setImportMessage] = useState("")

  const exportJson = () => {
    downloadTextFile({
      filename: `pencatat-pengeluaran-${dateStamp()}.json`,
      mimeType: "application/json",
      text: createSnapshotJson(snapshot),
    })
  }

  const exportCsv = () => {
    downloadTextFile({
      filename: `pengeluaran-${dateStamp()}.csv`,
      mimeType: "text/csv;charset=utf-8",
      text: createExpensesCsv(snapshot.expenses, categories),
    })
  }

  const importCsv = async (file?: File) => {
    if (!file) {
      return
    }

    const drafts = parseExpensesCsv(await file.text(), categories)
    onImportExpenses(drafts)
    setImportMessage(
      drafts.length
        ? `${drafts.length} pengeluaran berhasil diimpor.`
        : "Tidak ada baris valid yang bisa diimpor.",
    )
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updateThreshold = (index: number, value: number) => {
    const nextThresholds = [...settings.budgetAlertThresholds]
    nextThresholds[index] = value
    onUpdateSettings({
      budgetAlertThresholds: normalizeThresholds(nextThresholds),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-primary">Pengaturan</h2>
        <p className="mt-1 text-sm leading-6 text-secondary">
          Kelola backup data, impor CSV, dan ambang peringatan anggaran.
        </p>
      </div>

      <AchievementPanel
        achievements={achievementStats.achievements}
        persistedAchievements={snapshot.achievements}
        streaks={achievementStats.streaks}
      />

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Download aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Export data</h3>
            <p className="mt-1 text-sm leading-6 text-secondary">
              Simpan salinan data offline-mu sebagai JSON atau CSV.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportJson} type="button">
            Export JSON
          </Button>
          <Button onClick={exportCsv} type="button" variant="secondary">
            Export CSV
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <FileUp aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Import CSV</h3>
            <p className="mt-1 text-sm leading-6 text-secondary">
              Format terbaik adalah CSV hasil export dari aplikasi ini.
            </p>
          </div>
        </div>
        <input
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => void importCsv(event.target.files?.[0])}
          ref={fileInputRef}
          type="file"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          variant="secondary"
        >
          Pilih file CSV
        </Button>
        {importMessage ? (
          <p aria-live="polite" className="mt-3 text-sm text-secondary">
            {importMessage}
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Settings2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">
              Ambang anggaran
            </h3>
            <p className="mt-1 text-sm leading-6 text-secondary">
              Atur kapan status anggaran berubah menjadi pantau atau bahaya.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ThresholdInput
            label="Info"
            onChange={(value) => updateThreshold(0, value)}
            value={settings.budgetAlertThresholds[0] ?? 50}
          />
          <ThresholdInput
            label="Pantau"
            onChange={(value) => updateThreshold(1, value)}
            value={settings.budgetAlertThresholds[1] ?? 75}
          />
          <ThresholdInput
            label="Bahaya"
            onChange={(value) => updateThreshold(2, value)}
            value={settings.budgetAlertThresholds[2] ?? 90}
          />
        </div>
      </Card>

      <Card className="border-danger/40">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Hapus semua data</h3>
            <p className="mt-1 text-sm leading-6 text-secondary">
              Ketik HAPUS untuk mengosongkan semua data lokal dan kembali ke
              kondisi awal.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="wipe-confirm">
            Konfirmasi hapus data
          </label>
          <input
            className="min-h-11 flex-1 rounded-lg border border-border bg-background px-3 text-primary outline-none placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-danger"
            id="wipe-confirm"
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Ketik HAPUS"
            value={confirmText}
          />
          <Button
            disabled={confirmText !== "HAPUS"}
            onClick={() => {
              onResetAllData()
              setConfirmText("")
              setImportMessage("")
            }}
            type="button"
            variant="secondary"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </Card>
    </div>
  )
}

function ThresholdInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className="block rounded-lg border border-border bg-background p-3">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          className="min-h-10 w-full bg-transparent font-mono text-lg font-bold tabular-nums text-primary outline-none"
          inputMode="numeric"
          max={100}
          min={1}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        <span className="text-sm font-semibold text-tertiary">%</span>
      </div>
    </label>
  )
}

function normalizeThresholds(thresholds: number[]): number[] {
  const normalized = [
    clamp(thresholds[0] ?? 50, 1, 70),
    clamp(thresholds[1] ?? 75, 50, 89),
    clamp(thresholds[2] ?? 90, 75, 99),
    100,
  ]

  return [
    normalized[0],
    Math.max(normalized[0] + 1, normalized[1]),
    Math.max(normalized[1] + 1, normalized[2]),
    100,
  ]
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}
