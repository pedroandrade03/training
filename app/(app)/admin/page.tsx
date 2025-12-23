"use client"

import { useExercises } from "@/hooks/use-exercises"
import { useAuth } from "@/hooks/use-auth"
import { ExerciseForm } from "@/components/exercise-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { Exercise } from "@/hooks/use-exercises"

export default function AdminPage() {
  const { exercises, isLoading, createExercise, updateExercise, deleteExercise } =
    useExercises()
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/treino")
    }
  }, [isAdmin, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const handleCreate = async (data: { 
    name: string
    suggested_reps: string
    category?: string | null
    assigned_user_ids?: string[]
  }) => {
    setFormLoading(true)
    try {
      await createExercise(data)
      setShowForm(false)
    } catch (error) {
      console.error("Error creating exercise:", error)
      alert("Erro ao criar exercício")
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data: { 
    name: string
    suggested_reps: string
    category?: string | null
    assigned_user_ids?: string[]
  }) => {
    if (!editingExercise) return
    setFormLoading(true)
    try {
      await updateExercise({ id: editingExercise.id, ...data })
      setEditingExercise(null)
    } catch (error) {
      console.error("Error updating exercise:", error)
      alert("Erro ao atualizar exercício")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este exercício?")) {
      try {
        await deleteExercise(id)
      } catch (error) {
        console.error("Error deleting exercise:", error)
        alert("Erro ao excluir exercício")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-4 p-4 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Exercícios</h1>
          <p className="mt-2 text-muted-foreground">
            Crie e edite exercícios disponíveis para todos os usuários
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingExercise(null)
          }}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {(showForm || editingExercise) && (
        <ExerciseForm
          exercise={editingExercise}
          onSubmit={editingExercise ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingExercise(null)
          }}
          isLoading={formLoading}
        />
      )}

      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">
                Nenhum exercício cadastrado ainda.
              </p>
            </div>
          </div>
        ) : (
          exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{exercise.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Repetições sugeridas: {exercise.suggested_reps}
                    </p>
                    {exercise.exercise_assignments &&
                      exercise.exercise_assignments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Atribuído para:{" "}
                            {exercise.exercise_assignments
                              .map(
                                (assignment) =>
                                  assignment.profiles?.name ||
                                  assignment.profiles?.email ||
                                  "Usuário"
                              )
                              .join(", ")}
                          </p>
                        </div>
                      )}
                    {(!exercise.exercise_assignments ||
                      exercise.exercise_assignments.length === 0) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Disponível para todos
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingExercise(exercise)
                        setShowForm(false)
                      }}
                      className="h-10 w-10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(exercise.id)}
                      className="h-10 w-10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

