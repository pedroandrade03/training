"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, History, User, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function BottomNav() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const navItems = [
    { href: "/treino", icon: Dumbbell, label: "Treino" },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/historico", icon: History, label: "Histórico" },
    { href: "/perfil", icon: User, label: "Perfil" },
    ...(isAdmin ? [{ href: "/admin", icon: Settings, label: "Admin" }] : []),
  ]

      return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
          <div className="flex min-h-[64px] items-center justify-around pb-safe pb-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-[44px] flex-col items-center justify-center gap-1.5 rounded-lg px-4 py-2 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )
}

