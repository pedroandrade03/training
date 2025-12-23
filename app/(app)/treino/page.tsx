"use client"

import { useState } from "react"
import { useExercises } from "@/hooks/use-exercises"
import { useAuth } from "@/hooks/use-auth"
import { ExerciseCard } from "@/components/exercise-card"
import { CategoryFilter } from "@/components/category-filter"
import { Loader2 } from "lucide-react"

export default function TreinoPage() {
  const { exercises, isLoading, deleteExercise } = useExercises()
  const { isAdmin } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Filter exercises by category (checking if exercise has the selected category in its list)
  const filteredExercises = selectedCategory === "all"
    ? exercises
    : exercises.filter((exercise) => 
        exercise.categories.some(cat => cat.name === selectedCategory)
      )

  const handleEdit = async (exercise: any) => {
    // This will be handled by the admin page logic if integrated, or via modal
    console.log("Edit requested for", exercise.id)
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
        onSelectCategory={setSelectedCategory}
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
              Nenhum exercício encontrado na categoria "{selectedCategory}".
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
