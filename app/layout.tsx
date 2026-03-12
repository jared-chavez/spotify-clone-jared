import "./globals.css"
import { Figtree } from "next/font/google"

import Sidebar from "../components/Sidebar"
import RegisterServiceWorker from "./components/RegisterServiceWorker"
import SupabaseProvider from "./providers/SupabaseProvider"
import UserProvider from "./providers/UserProvider"
import ModalProvider from "./providers/ModalProvider"
import ToasterProvider from "./providers/ToastProvider"
import ServiceWorkerProvider from "./providers/ServiceWorkerProvider"
import { DataStrategyProvider } from "./providers/DataStrategyProvider"
import OfflineBanner from "@/components/OfflineBanner"
import getSongsByUserId from "@/actions/getSongsByUserId"
import Player from "@/components/Player"
import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices"

const figtree = Figtree({ subsets: ["latin"] })

export const metadata = {
  title: "Spotify clone",
  description: "Listen to music!",
}

export const revalidate = 0

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userSongs = await getSongsByUserId()
  const products = await getActiveProductsWithPrices()

  return (
    <html lang="en">
      <body className={figtree.className}>
        <RegisterServiceWorker />
        <ToasterProvider />
        <ServiceWorkerProvider />
        <SupabaseProvider>
          <UserProvider>
            <DataStrategyProvider initialUserSongs={userSongs}>
              <OfflineBanner />
              <ModalProvider products={products} />
              <Sidebar>{children}</Sidebar>
              <Player />
            </DataStrategyProvider>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
