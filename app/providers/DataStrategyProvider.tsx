"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Song } from "@/types"
import useOfflineCacheStore, { type OfflineCacheStore } from "@/stores/offlineCacheStore"
import useOnlineStatus from "@/hooks/useOnlineStatus"

/**
 * Estrategia de datos: locales (cache), remotos (server/Supabase), offline (cache).
 * - Cuando hay datos del servidor (online): se muestran y se guardan en cache.
 * - Cuando no hay datos del servidor (offline o HTML cacheado): se usan los del cache local.
 */

interface DataStrategyContextValue {
  /** Canciones para la biblioteca del usuario (remotas o cacheadas) */
  userSongs: Song[]
  /** Si hay conexión a internet */
  isOnline: boolean
  /** Actualizar cache de liked (desde página Liked) */
  setLikedSongsCache: (songs: Song[]) => void
}

const DataStrategyContext = createContext<DataStrategyContextValue | null>(null)

interface DataStrategyProviderProps {
  children: React.ReactNode
  /** Canciones del usuario desde el servidor (layout) */
  initialUserSongs: Song[]
}

export function DataStrategyProvider({ children, initialUserSongs }: DataStrategyProviderProps) {
  const isOnline = useOnlineStatus()
  const [hydrated, setHydrated] = useState(false)

  const setUserSongs = useOfflineCacheStore((s: OfflineCacheStore) => s.setUserSongs)
  const setLikedSongs = useOfflineCacheStore((s: OfflineCacheStore) => s.setLikedSongs)
  const cachedUserSongs = useOfflineCacheStore((s: OfflineCacheStore) => s.userSongs)

  // Sincronizar datos remotos al cache cuando llegan del servidor
  useEffect(() => {
    if (initialUserSongs.length > 0) {
      setUserSongs(initialUserSongs)
    }
  }, [initialUserSongs, setUserSongs])

  // Marcar hidratación para usar cache en cliente cuando el servidor no envió datos
  useEffect(() => {
    setHydrated(true)
  }, [])

  const userSongs = useMemo(() => {
    if (!hydrated) return initialUserSongs
    if (initialUserSongs.length > 0) return initialUserSongs
    return cachedUserSongs
  }, [hydrated, initialUserSongs, cachedUserSongs])

  const setLikedSongsCache = useCallback(
    (songs: Song[]) => {
      setLikedSongs(songs)
    },
    [setLikedSongs]
  )

  const value = useMemo<DataStrategyContextValue>(
    () => ({ userSongs, isOnline, setLikedSongsCache }),
    [userSongs, isOnline, setLikedSongsCache]
  )

  return (
    <DataStrategyContext.Provider value={value}>{children}</DataStrategyContext.Provider>
  )
}

export function useDataStrategy() {
  const ctx = useContext(DataStrategyContext)
  if (!ctx) {
    throw new Error("useDataStrategy must be used within DataStrategyProvider")
  }
  return ctx
}
