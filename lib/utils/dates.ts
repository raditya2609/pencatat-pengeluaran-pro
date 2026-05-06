import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns"
import { id } from "date-fns/locale"

export interface MonthPill {
  id: string
  label: string
  displayLabel: string
  selectedLabel: string
  shortLabel: string
  date: Date
  isCurrentMonth: boolean
}

export function toMonthId(date: Date): string {
  return format(date, "yyyy-MM")
}

export function getMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy", { locale: id })
}

export function getMonthPillLabel(date: Date, baseDate = new Date()): string {
  const baseYear = format(baseDate, "yyyy")
  const dateYear = format(date, "yyyy")
  const month = format(date, "MMM", { locale: id })

  if (dateYear === baseYear) {
    return month
  }

  return `${month} '${format(date, "yy")}`
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function getMonthPills(baseDate = new Date()): MonthPill[] {
  const currentMonth = startOfMonth(baseDate)

  return Array.from({ length: 14 }, (_, index) => {
    const date = addMonths(subMonths(currentMonth, 12), index)

    return {
      id: toMonthId(date),
      label: getMonthLabel(date),
      displayLabel: getMonthPillLabel(date, currentMonth),
      selectedLabel: format(date, "MMM yyyy", { locale: id }),
      shortLabel: format(date, "MMM", { locale: id }),
      date,
      isCurrentMonth: isSameMonth(date, currentMonth),
    }
  })
}
