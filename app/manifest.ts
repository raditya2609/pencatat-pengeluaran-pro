import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pencatat Pengeluaran Pro",
    short_name: "Pengeluaran Pro",
    description:
      "Aplikasi pencatat pengeluaran IDR yang cepat, indah, dan siap offline.",
    start_url: "/",
    display: "standalone",
    scope: "/",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    lang: "id",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-monochrome.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "monochrome",
      },
    ],
    shortcuts: [
      {
        name: "Tambah Pengeluaran",
        short_name: "Tambah",
        description: "Buka aplikasi untuk mencatat pengeluaran baru.",
        url: "/?quickAdd=1",
        icons: [
          {
            src: "/icons/icon-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    ],
  }
}
