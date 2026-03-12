/**
 * Caché local para datos de la app (canciones). Usado en estrategia OFFLINE.
 * Se rellena con datos REMOTOS cuando hay conexión; se lee cuando no hay red.
 */

import { create } from "zustand"
import { Song } from "@/types"

const CACHE_STORAGE_KEY = "spotify-clone-offline-cache"
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

interface OfflineCacheState {
  userSongs: Song[]
  likedSongs: Song[]
  lastSyncedAt: string | null
}

function getStoredCache(): OfflineCacheState {
  if (typeof window === "undefined") {
    return { userSongs: [], likedSongs: [], lastSyncedAt: null }
  }
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return { userSongs: [], likedSongs: [], lastSyncedAt: null }
    const parsed = JSON.parse(raw) as OfflineCacheState
    const lastSync = parsed.lastSyncedAt ? new Date(parsed.lastSyncedAt).getTime() : 0
    if (Date.now() - lastSync > MAX_CACHE_AGE_MS) {
      return { userSongs: [], likedSongs: [], lastSyncedAt: null }
    }
    return {
      userSongs: Array.isArray(parsed.userSongs) ? parsed.userSongs : [],
      likedSongs: Array.isArray(parsed.likedSongs) ? parsed.likedSongs : [],
      lastSyncedAt: parsed.lastSyncedAt ?? null,
    }
  } catch {
    return { userSongs: [], likedSongs: [], lastSyncedAt: null }
  }
}

export interface OfflineCacheStore extends OfflineCacheState {
  setUserSongs: (songs: Song[]) => void
  setLikedSongs: (songs: Song[]) => void
  clear: () => void
}

function persistCache(state: OfflineCacheState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const useOfflineCacheStore = create<OfflineCacheStore>((set) => ({
  ...getStoredCache(),
  setUserSongs: (userSongs) =>
    set((state) => {
      const next = {
        ...state,
        userSongs,
        lastSyncedAt: new Date().toISOString(),
      }
      persistCache(next)
      return next
    }),
  setLikedSongs: (likedSongs) =>
    set((state) => {
      const next = {
        ...state,
        likedSongs,
        lastSyncedAt: state.lastSyncedAt ?? new Date().toISOString(),
      }
      persistCache(next)
      return next
    }),
  clear: () => {
    const next = { userSongs: [], likedSongs: [], lastSyncedAt: null }
    persistCache(next)
    set(next)
  },
}))

/** Obtiene una canción del cache local por id (para uso offline). */
export function getCachedSongById(id: string): Song | undefined {
  const state = useOfflineCacheStore.getState()
  return state.userSongs.find((s) => s.id === id) ?? state.likedSongs.find((s) => s.id === id)
}

export default useOfflineCacheStore
