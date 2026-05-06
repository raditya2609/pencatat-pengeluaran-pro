import type { Metadata, Viewport } from "next"

import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Pencatat Pengeluaran Pro",
  description:
    "Aplikasi pencatat pengeluaran IDR yang cepat, indah, dan siap offline.",
  applicationName: "Pencatat Pengeluaran Pro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pengeluaran Pro",
  },
  manifest: "/manifest.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="dark" lang="id">
      <body>{children}</body>
    </html>
  )
}
