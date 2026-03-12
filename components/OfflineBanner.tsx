"use client"

import { useDataStrategy } from "@/app/providers/DataStrategyProvider"

export default function OfflineBanner() {
  const { isOnline } = useDataStrategy()

  if (isOnline) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-center py-2 text-sm font-medium"
      role="status"
      aria-live="polite"
    >
      {"You're offline. Showing cached data."}
    </div>
  )
}
