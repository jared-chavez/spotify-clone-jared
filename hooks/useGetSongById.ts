import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { useSessionContext } from "@supabase/auth-helpers-react"

import { Song } from "@/types"
import { getCachedSongById } from "@/stores/offlineCacheStore"
import useOnlineStatus from "@/hooks/useOnlineStatus"

/**
 * Obtiene una canción por id. Remoto (Supabase) cuando hay red; offline usa cache local.
 */
const useSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const [song, setSong] = useState<Song | undefined>(undefined)
  const { supabaseClient } = useSessionContext()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!id) {
      setSong(undefined)
      return
    }

    if (!isOnline) {
      const cached = getCachedSongById(id)
      setSong(cached)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setSong(undefined)

    const fetchSong = async () => {
      const { data, error } = await supabaseClient.from("songs").select("*").eq("id", id).single()

      if (error) {
        const cached = getCachedSongById(id)
        if (cached) {
          setSong(cached)
        } else {
          toast.error(error.message)
        }
        setIsLoading(false)
        return
      }

      setSong(data as Song)
      setIsLoading(false)
    }

    fetchSong()
  }, [id, supabaseClient, isOnline])

  return useMemo(
    () => ({
      isLoading,
      song,
    }),
    [isLoading, song],
  )
}

export default useSongById
