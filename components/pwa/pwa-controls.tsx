"use client"

import { Download, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

type InstallOutcome = "accepted" | "dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function PwaControls({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [hasServiceWorkerError, setHasServiceWorkerError] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    queueMicrotask(() => {
      setIsOnline(navigator.onLine)
      setIsStandalone(isStandaloneMode())
      setHasServiceWorkerError(!("serviceWorker" in navigator))
    })

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsStandalone(true)
    }
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (!isStandaloneMode()) {
        setInstallPrompt(event as BeforeInstallPromptEvent)
      }
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("appinstalled", handleAppInstalled)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("appinstalled", handleAppInstalled)
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    let isMounted = true

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")

        if (!isMounted) {
          return
        }

        setHasServiceWorkerError(false)
        registration.update().catch(() => undefined)

        const markReady = () => {
          if (isMounted) {
            setIsServiceWorkerReady(true)
          }
        }

        if (navigator.serviceWorker.controller || registration.active) {
          markReady()
        }

        navigator.serviceWorker.ready.then(markReady).catch(() => {
          if (isMounted) {
            setHasServiceWorkerError(true)
          }
        })

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing

          worker?.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true)
            }
          })
        })
      } catch {
        if (isMounted) {
          setHasServiceWorkerError(true)
        }
      }
    }

    registerServiceWorker()

    return () => {
      isMounted = false
    }
  }, [])

  const status = useMemo(() => {
    if (!isOnline) {
      return {
        Icon: WifiOff,
        label: "Offline aktif",
        className: "border-warning/30 bg-warning/10 text-warning",
      }
    }

    if (hasServiceWorkerError) {
      return {
        Icon: WifiOff,
        label: "Offline terbatas",
        className: "border-danger/30 bg-danger/10 text-danger",
      }
    }

    if (!isServiceWorkerReady) {
      return {
        Icon: RefreshCw,
        label: "Menyiapkan offline",
        className: "border-border bg-surface text-secondary",
      }
    }

    return {
      Icon: Wifi,
      label: "Siap offline",
      className: "border-success/30 bg-success/10 text-success",
    }
  }, [hasServiceWorkerError, isOnline, isServiceWorkerReady])

  const handleInstall = async () => {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const handleRefreshForUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" })
    window.location.reload()
  }

  const showInstallButton = Boolean(installPrompt && !isStandalone)

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
            status.className,
          )}
        >
          <status.Icon aria-hidden="true" className="h-3.5 w-3.5" />
          {status.label}
        </div>

        {showInstallButton ? (
          <Button onClick={handleInstall} size="sm" variant="secondary">
            <Download aria-hidden="true" className="h-4 w-4" />
            Pasang
          </Button>
        ) : null}

        {updateAvailable ? (
          <Button onClick={handleRefreshForUpdate} size="sm" variant="secondary">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Perbarui
          </Button>
        ) : null}
      </div>

      {!isOnline ? (
        <div
          className="fixed inset-x-4 bottom-28 z-50 mx-auto max-w-sm rounded-lg border border-warning/30 bg-surface-elevated px-4 py-3 text-sm text-primary shadow-glow md:bottom-6"
          role="status"
        >
          <p className="font-semibold">Koneksi terputus</p>
          <p className="mt-1 text-xs leading-5 text-secondary">
            Catatan tetap tersimpan lokal. Sinkronisasi jaringan akan pulih saat
            perangkat online lagi.
          </p>
        </div>
      ) : null}
    </>
  )
}
