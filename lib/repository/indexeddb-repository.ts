import { del, get, set } from "idb-keyval"

import type { FinanceRepository } from "@/lib/repository/finance-repository"
import type { FinanceSnapshot } from "@/lib/types/finance"

const snapshotKey = "pencatat-pengeluaran-pro:snapshot"

export const indexedDBFinanceRepository: FinanceRepository = {
  async loadSnapshot() {
    return (await get<FinanceSnapshot>(snapshotKey)) ?? null
  },
  async saveSnapshot(snapshot) {
    await set(snapshotKey, snapshot)
  },
  async clearSnapshot() {
    await del(snapshotKey)
  },
}
