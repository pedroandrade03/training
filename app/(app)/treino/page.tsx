"use client"

import { useState } from "react"
import { useExercises } from "@/hooks/use-exercises"
import { useAuth } from "@/hooks/use-auth"
import { ExerciseCard } from "@/components/exercise-card"
import { CategoryFilter } from "@/components/category-filter"
import { ExerciseForm } from "@/components/exercise-form"
import { Loader2 } from "lucide-react"
import type { Exercise } from "@/hooks/use-exercises"

export default function TreinoPage() {
  const { exercises, isLoading, deleteExercise, updateExercise, createExercise } = useExercises()
  const { isAdmin } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Filter exercises by category (checking if exercise has the selected category in its list)
  const filteredExercises = selectedCategory === "all"
    ? exercises
    : exercises.filter((exercise) => 
        exercise.categories.some(cat => cat.name === selectedCategory)
      )

  const handleEdit = async (exercise: Exercise) => {
    setEditingExercise(exercise)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: { 
    name: string
    suggested_reps: string
    exercise_type?: 'strength' | 'cardio'
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-4 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meus Treinos</h1>
        <p className="mt-2 text-muted-foreground">
          Selecione um exercício para registrar sua carga
        </p>
      </div>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {exercises.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum exercício cadastrado ainda.
            </p>
            {isAdmin && (
              <p className="mt-2 text-sm text-muted-foreground">
                Vá para a aba Admin para criar exercícios.
              </p>
            )}
          </div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum exercício encontrado na categoria {selectedCategory ? `"${selectedCategory}"` : "selecionada"}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isFormOpen && isAdmin && (
            <div className="mb-4">
              <ExerciseForm
                exercise={editingExercise}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingExercise(null)
                }}
                isLoading={isLoading}
              />
            </div>
          )}
          <div className="space-y-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
