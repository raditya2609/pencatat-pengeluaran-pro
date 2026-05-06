"use client"

import { BarChart3, ClipboardList, LineChart, PieChart, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AppTab } from "@/lib/store/use-finance-store"
import { getTabLabel } from "@/lib/store/selectors"
import { cn } from "@/lib/utils/cn"

const tabs: Array<{ id: AppTab; icon: typeof BarChart3 }> = [
  { id: "summary", icon: PieChart },
  { id: "expenses", icon: ClipboardList },
  { id: "budgets", icon: BarChart3 },
  { id: "reports", icon: LineChart },
  { id: "settings", icon: Settings },
]

interface BottomNavProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/92 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-5 gap-1">
        {tabs.map(({ id, icon: Icon }) => {
          const isActive = activeTab === id

          return (
            <Button
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-12 rounded-lg px-1.5 text-[10px]",
                isActive && "bg-accent-soft text-accent hover:bg-accent-soft",
              )}
              key={id}
              onClick={() => onTabChange(id)}
              size="sm"
              variant="ghost"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{getTabLabel(id)}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
