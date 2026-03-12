"use client"

import { useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"

import { Database } from "@/types_db"

interface SupabaseProviderProps {
  children: React.ReactNode
}

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>())

  return (
    <SessionContextProvider supabaseClient={supabaseClient as unknown as SupabaseClient}>
      {children}
    </SessionContextProvider>
  )
}

export default SupabaseProvider
