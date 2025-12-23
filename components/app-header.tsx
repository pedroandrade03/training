"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const pathname = usePathname()

  // Don't show header on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/treino" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.jpg"
            alt="Trainally Logo"
            width={40}
            height={40}
            className="rounded-lg object-cover"
            priority
            unoptimized
          />
          <span className="text-xl font-bold">Trainally</span>
        </Link>
      </div>
    </header>
  )
}

