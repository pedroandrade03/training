"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User } from "lucide-react"

export default function PerfilPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto space-y-4 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Perfil</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(profile?.name || null)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {profile?.name || "Usuário"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {profile?.email || user?.email}
              </p>
              {profile?.is_admin && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{profile?.email || user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome</p>
            <p className="text-base">{profile?.name || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tipo de Conta
            </p>
            <p className="text-base">
              {profile?.is_admin ? "Administrador" : "Aluno"}
            </p>
          </div>
        </CardContent>
      </Card>
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleSignOut}
        size="lg"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  )
}

