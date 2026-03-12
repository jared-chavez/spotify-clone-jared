"use client"

import { useEffect } from "react"

export default function ServiceWorkerProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nueva versión disponible; opcional: notificar al usuario para recargar
              if (typeof window !== "undefined" && "toast" in window) {
                // Si usas react-hot-toast, podrías disparar un toast aquí
              }
            }
          })
        })
      } catch (err) {
        console.warn("Service Worker registration failed:", err)
      }
    }

    register()
  }, [])

  return null
}
