# Pencatat Pengeluaran Pro - Project Summary

## Project Overview

**Pencatat Pengeluaran Pro** is an Indonesian-language, mobile-first, offline-capable personal finance web app for tracking IDR expenses. It is designed to feel like a premium native app in the browser, with fast local persistence, rich summaries, budgets, focused reports, smart quick input, insights, and data export/import tools.

The app is currently client-side only. There is no backend in v1. Data is persisted locally through Zustand persist middleware backed by IndexedDB via `idb-keyval`.

Release status:

- Version: `1.0.0`
- V1 readiness checks passed on 2026-05-06:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm audit --audit-level=high`
  - production `next start` smoke checks for `/`, `/offline`, `/manifest.webmanifest`, `/sw.js`, and PWA icon assets.

## Current Stack

- Framework: Next.js 16.2.4 with App Router
- Language: TypeScript strict mode
- Styling: Tailwind CSS with CSS variables
- UI primitives: lightweight local shadcn-style components plus Radix Dialog
- Icons: Lucide React
- Charts: Recharts, lazy-loaded only in `Laporan`
- State: Zustand + persist middleware + IndexedDB storage
- Forms: React Hook Form + Zod
- Dates: date-fns with Indonesian locale
- Export images: html-to-image for report cards
- Testing: Vitest + Testing Library setup
- Build: `next build --webpack`

Important note: `next build --webpack` is intentional because Next 16 Turbopack build hit sandbox port-binding issues in this environment.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

Dev server is expected at:

```txt
http://localhost:3000
```

## Implemented Features

### Foundation

- Next.js app scaffolded from scratch in the repo root.
- Strict TypeScript, ESLint 9 flat config, Prettier, Vitest.
- Dark theme tokens in `app/globals.css`.
- Inter variable font via `@fontsource-variable/inter`.
- PWA manifest, icons, and real service worker caching exist.
- Offline page exists at `/offline`.
- Mobile-first layout with desktop max width.

### Navigation / Shell

- Main app shell lives in `components/app-shell/app-shell.tsx`.
- PWA status/install controls live in `components/pwa/pwa-controls.tsx`.
- Tabs:
  - `Ringkasan`
  - `Pengeluaran`
  - `Anggaran`
  - `Laporan`
  - `Pengaturan`
- Bottom mobile nav lives in `components/app-shell/bottom-nav.tsx`.
- Desktop segmented tab nav is in `AppShell`.
- Month scroller supports 12 months back, current month, and 1 month forward.
- Month pill labels are adaptive:
  - Current-year months: `Jan`, `Feb`
  - Cross-year months: `Mei '25`
  - Selected pill: `Mei 2026`

### Data Model

Core types live in:

```txt
lib/types/finance.ts
```

Main entities:

- `Expense`
- `Category`
- `Budget`
- `SavingGoal`
- `RecurringRule`
- `ExpenseTemplate`
- `SplitBill`
- `Insight`
- `Achievement`
- `AppSettings`
- `FinanceSnapshot`

Default categories live in:

```txt
lib/constants/default-categories.ts
```

Seed snapshot lives in:

```txt
lib/repository/seed.ts
```

Default categories include:

- Makanan & Minuman
- Transportasi
- Belanja
- Tagihan
- Hiburan
- Kesehatan
- Pendidikan
- Investasi
- Anak & Keluarga
- Hadiah & Donasi
- Lainnya

### Store / Persistence

Main store:

```txt
lib/store/use-finance-store.ts
```

Persistence:

- Zustand persist middleware
- IndexedDB via `idb-keyval`
- Storage key: `pencatat-pengeluaran-pro:finance-store`

Implemented store actions:

- `setActiveTab`
- `setSelectedMonthId`
- `setHasHydrated`
- `addExpense`
- `importExpenses`
- `updateExpense`
- `deleteExpense`
- `addBudget`
- `updateBudget`
- `deleteBudget`
- `dismissInsight`
- `updateSettings`
- `resetAllData`
- `toggleDemoData`

Repository interface and IndexedDB repository exist:

```txt
lib/repository/finance-repository.ts
lib/repository/indexeddb-repository.ts
```

Currently, the actual app store persistence uses Zustand’s custom IndexedDB storage directly. The repository interface exists for future backend/cloud migration.

### Expense CRUD

Expense components:

```txt
components/expenses/expense-form-dialog.tsx
components/expenses/expense-list.tsx
components/expenses/empty-expenses.tsx
components/expenses/payment-method.ts
```

Features:

- Add/edit expense with bottom sheet on mobile and dialog on desktop.
- Form fields:
  - amount
  - category
  - note
  - date
  - time
  - payment method
  - tags
- Validation via React Hook Form + Zod:

```txt
lib/validation/expense-schema.ts
```

- Expense list grouped by date.
- Sticky date headers.
- Search by note/category/amount/tags.
- Category filter.
- Payment method filter.
- Edit row action.
- Delete row action.
- Swipe-reveal delete on touch devices.

### Budgets

Budget components:

```txt
components/budgets/budget-dashboard.tsx
components/budgets/budget-form-dialog.tsx
components/budgets/empty-budgets.tsx
```

Features:

- Add/edit/delete budgets.
- Budget can target:
  - `TOTAL`
  - specific category
- Period:
  - monthly
  - weekly
- Rollover toggle.
- Progress rings.
- Green/yellow/red status.
- Inline budget alerts.
- Budget thresholds are editable in `Pengaturan` and affect budget status.

Validation:

```txt
lib/validation/budget-schema.ts
```

### Ringkasan

Summary UI:

```txt
components/summary/summary-preview.tsx
components/summary/empty-summary.tsx
components/achievements/achievement-panel.tsx
```

Analytics:

```txt
lib/analytics/summary.ts
lib/analytics/achievements.ts
```

Implemented cards:

- Total Pengeluaran with month-over-month delta
- Kategori Terbesar with progress
- Jumlah Transaksi
- Avg Daily Spend
- Projected End-of-Month
- Days Without Spending
- Streak & Achievement panel:
  - current logging streak
  - longest logging streak
  - no-spend streak
  - unlocked badge count
  - compact badge preview
- Trend Bulanan / month-on-month analysis:
  - total current vs previous month
  - category current vs previous month

### Streaks / Achievements

Achievement UI:

```txt
components/achievements/achievement-panel.tsx
```

Achievement analytics:

```txt
lib/analytics/achievements.ts
```

Implemented:

- Streak tracker derived from unique expense dates.
- Current logging streak counts consecutive logged days ending today or yesterday.
- Longest logging streak across all recorded data.
- No-spend streak from today backward.
- Achievement badges:
  - Transaksi Pertama
  - Rutin 3 Hari
  - Konsisten 7 Hari
  - Budget Aman
  - Bulan Lebih Hemat
  - Eksplorer Kategori
- Unlocked achievements are synced into persisted Zustand state with `unlockedAt`.
- Compact achievement panel is shown in `Ringkasan`.
- Full achievement panel is shown in `Pengaturan`.

### Monthly Wrap

Monthly Wrap UI:

```txt
components/monthly-wrap/monthly-wrap-card.tsx
```

Monthly Wrap analytics:

```txt
lib/analytics/monthly-wrap.ts
```

Implemented:

- Focused monthly recap shown in `Ringkasan`.
- Includes:
  - month label
  - total spend
  - delta vs previous month
  - top category
  - transaction count
  - best streak
  - unlocked badge count
  - biggest category movement
  - largest expense
- Generates a short headline based on the month pattern.
- Export Monthly Wrap as PNG via lazy-loaded `html-to-image`.

### Laporan

Report dashboard:

```txt
components/reports/report-dashboard.tsx
```

Report analytics:

```txt
lib/analytics/reports.ts
```

`Laporan` was intentionally simplified to four focused sections:

- Tren Bulanan
- Komposisi Kategori
- Top 10 Pengeluaran
- Kategori Tumbuh / Turun

Notes:

- `Laporan` is lazy-loaded via `next/dynamic` from `AppShell`.
- Recharts and `html-to-image` do not load on first screen.
- Each report card has PNG export.
- Chart data has screen-reader table alternatives.
- Removed earlier extra report cards to reduce visual clutter.

### Smart Quick Add

Smart input parser:

```txt
lib/smart-input/quick-add.ts
```

UI:

```txt
components/smart-input/quick-add.tsx
```

Features:

- Quick add input appears under the month scroller.
- Example:

```txt
makan siang 50rb di warteg pakai gopay
```

- Supports amount suffixes:
  - `rb`
  - `ribu`
  - `k`
  - `jt`
  - `juta`
  - `Rp`
- Infers category from Indonesian keywords.
- Infers payment method from keywords like `gopay`, `ovo`, `dana`, `transfer`, `cash`, `debit`.
- One-tap templates:
  - Kopi pagi
  - Makan siang
  - Bensin

### Insights

Insight engine:

```txt
lib/insights/insights.ts
```

Insight UI:

```txt
components/insights/insight-cards.tsx
```

Implemented rule-based insights:

- Category spending increase
- Budget warning
- Coffee spending pattern
- Unusual transaction
- Savings vs previous months

Insights are dismissible. Dismissed insight IDs are persisted in store as `insights` with `dismissedAt`.

### Demo Data

Demo data is controlled by:

```txt
toggleDemoData()
```

Demo includes:

- Current-month expenses
- Previous-month expenses for MoM trends
- Demo budgets:
  - Total Bulanan
  - Makanan
  - Transportasi
  - Tagihan

Toggling demo off removes only demo records and preserves user-created data.

### Pengaturan / Data Tools

Settings dashboard:

```txt
components/settings/settings-dashboard.tsx
```

Data transfer utilities:

```txt
lib/data/transfer.ts
```

Features:

- Export full data snapshot as JSON.
- Export expenses as CSV.
- Import expenses from CSV.
- View full streak and achievement progress.
- Wipe all data with double confirm by typing `HAPUS`.
- Edit budget alert thresholds:
  - Info
  - Pantau
  - Bahaya

JSON export format:

```ts
{
  exportedAt: string;
  version: 1;
  snapshot: FinanceSnapshot;
}
```

CSV headers:

```txt
date,time,amount,categoryId,categoryName,note,paymentMethod,tags
```

Tags are exported/imported with `|` as separator.

### PWA Polish

PWA controls:

```txt
components/pwa/pwa-controls.tsx
```

Service worker:

```txt
public/sw.js
```

Manifest and icons:

```txt
app/manifest.ts
public/icons/icon.svg
public/icons/icon-maskable.svg
public/icons/icon-monochrome.svg
```

Implemented:

- Client-side service worker registration from the app shell.
- Real service worker caching for:
  - app shell routes
  - `/offline`
  - manifest
  - app icons
  - Next static chunks
  - images/fonts/styles/scripts
- Runtime cache cleanup by version during activation.
- Navigation fallback to cached app shell or `/offline`.
- Offline status indicator in the header and fixed offline banner.
- Install prompt button using `beforeinstallprompt` when the browser supports it.
- Update prompt button for waiting service worker updates.
- Manifest improvements:
  - `scope`
  - app categories
  - maskable icon
  - monochrome icon
  - app shortcut for quick expense entry.

## Important Utilities

```txt
lib/utils/format-idr.ts
lib/utils/dates.ts
lib/utils/ids.ts
lib/utils/cn.ts
```

`formatIDR()` formats IDR like:

```txt
Rp 1.250.000
```

No decimals.

## Current Tests

Tests live in:

```txt
tests/
```

Current passing count:

```txt
31 tests
```

Coverage areas:

- IDR formatting
- Month pill generation
- Seed snapshot
- Expense actions
- Budget actions
- Expense form schema
- Budget form schema
- Summary analytics
- Achievement analytics
- Monthly Wrap analytics
- Report analytics
- Quick-add parser
- Insights
- Data transfer CSV/JSON

Latest verification for the Monthly Wrap slice:

```txt
npm run lint
npm run typecheck
npm test
npm run build
```

All passed.

## Known Environment Notes

- `tsconfig.tsbuildinfo` is generated by TypeScript and deleted after checks. It is ignored by `.gitignore`.
- `.next` generated types can occasionally duplicate in this sandbox after build/dev cache changes. If typecheck reports duplicate `.next/types/*.d 2.ts`, run:

```bash
rm -rf .next
npm run typecheck
```

- Dev server sometimes needs restart after `rm -rf .next`:

```bash
pkill -f "next dev"
npm run dev
```

## Current UX Notes

- UI strings are Indonesian.
- Code names and comments are English.
- The product is dark-theme-first.
- Cards use 8px-ish radius.
- The app is mobile-first and desktop-compatible.
- Current bottom nav has five tabs, so labels are compact on mobile.

## Not Implemented Yet

Remaining planned Phase 5 work:

- Recurring expenses scheduler.
- Voice input.
- Receipt OCR.
- Full theme switching implementation.
- Import full JSON snapshot.
- CSV import preview / conflict handling.

Not planned for now:

- Saving goals / Tujuan Menabung, per product direction.

## Recommended Next Slice

Do **recurring expenses scheduler** next:

- Add recurring expense rules for daily, weekly, monthly, and yearly schedules.
- Preview upcoming generated expenses before applying them.
- Keep generated records linked to `recurringId` so they can be edited safely.

Suggested commit message for the current completed slice:

```txt
feat: add monthly wrap
```

Suggested next commit message:

```txt
feat: add recurring expenses
```
