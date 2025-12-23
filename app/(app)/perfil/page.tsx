"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Edit2, Check, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

export default function PerfilPage() {
  const { user, profile, signOut, refetchProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(profile?.name || "")
  const [isSaving, setIsSaving] = useState(false)

  // Update editedName when profile changes
  useEffect(() => {
    setEditedName(profile?.name || "")
  }, [profile?.name])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const handleSaveName = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: editedName.trim() || null })
        .eq("id", user.id)

      if (error) throw error

      // Refetch profile to update UI immediately
      if (refetchProfile) {
        await refetchProfile()
      }
      
      setIsEditingName(false)
    } catch (error: any) {
      console.error("Error updating name:", error)
      alert("Erro ao atualizar nome")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedName(profile?.name || "")
    setIsEditingName(false)
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              {!isEditingName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedName(profile?.name || "")
                    setIsEditingName(true)
                  }}
                  className="h-8"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Seu nome"
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="h-10 w-10"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-base">{profile?.name || "Não informado"}</p>
            )}
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

