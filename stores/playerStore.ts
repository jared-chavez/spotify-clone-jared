/**
 * Estado del reproductor con persistencia local (localStorage).
 * Estrategia LOCAL: sobrevive recargas y cierre de pestaña.
 */

import { create } from "zustand"

const PLAYER_STORAGE_KEY = "spotify-clone-player"

interface PlayerState {
  ids: string[]
  activeId?: string
}

function getStoredPlayer(): Partial<PlayerState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PlayerState
    if (Array.isArray(parsed.ids) && parsed.ids.length > 0) {
      return { ids: parsed.ids, activeId: parsed.activeId }
    }
  } catch {
    // ignore
  }
  return {}
}

interface PlayerStore extends PlayerState {
  setId: (id: string) => void
  setIds: (ids: string[]) => void
  reset: () => void
}

const stored = getStoredPlayer()

const usePlayerStore = create<PlayerStore>((set) => ({
  ids: stored.ids ?? [],
  activeId: stored.activeId,
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids }),
  reset: () => set({ ids: [], activeId: undefined }),
}))

function persistPlayer(state: PlayerState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
      ids: state.ids,
      activeId: state.activeId,
    }))
  } catch {
    // ignore
  }
}

usePlayerStore.subscribe((state) => {
  persistPlayer({ ids: state.ids, activeId: state.activeId })
})

export default usePlayerStore
