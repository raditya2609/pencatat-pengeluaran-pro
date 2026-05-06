import type { FinanceSnapshot } from "@/lib/types/finance"

export interface FinanceRepository {
  loadSnapshot(): Promise<FinanceSnapshot | null>
  saveSnapshot(snapshot: FinanceSnapshot): Promise<void>
  clearSnapshot(): Promise<void>
}
