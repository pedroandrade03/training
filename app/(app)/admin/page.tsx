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

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const { exercises, isLoading, createExercise, updateExercise, deleteExercise, updateAssignments } = useExercises()
  const { isAdmin, loading: authLoading } = useAuth()
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/treino")
    }
  }, [authLoading, isAdmin, router])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) return null

  const handleSubmit = async (data: { 
    name: string
    suggested_reps: string
    category_ids?: string[]
    assigned_user_ids?: string[]
  }) => {
    try {
      if (editingExercise) {
        await updateExercise({
          id: editingExercise.id,
          ...data,
        })
      } else {
        await createExercise(data)
      }
      setIsFormOpen(false)
      setEditingExercise(null)
    } catch (error) {
      console.error("Error saving exercise:", error)
      alert("Erro ao salvar exercício")
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

  return (
    <div className="container mx-auto space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">Gerenciar exercícios</p>
        </div>
        <Button onClick={() => {
          setEditingExercise(null)
          setIsFormOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-6">
          <ExerciseForm
            exercise={editingExercise}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingExercise(null)
            }}
          />
        </div>
      )}

      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">
                  {exercise.name}
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {exercise.categories?.map(cat => (
                    <span key={cat.id} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingExercise(exercise)
                    setIsFormOpen(true)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(exercise.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Repetições: {exercise.suggested_reps}</p>
                {exercise.exercise_assignments && exercise.exercise_assignments.length > 0 ? (
                  <div className="mt-2">
                    <p className="font-medium text-foreground">Atribuído para:</p>
                    <ul className="list-inside list-disc">
                      {exercise.exercise_assignments.map((assignment) => (
                        <li key={assignment.user_id}>
                          {assignment.profiles?.name || assignment.profiles?.email || "Usuário"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-xs italic">Disponível para todos</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
