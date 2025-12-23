"use client"

import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}

