"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exercise } from "@/hooks/use-exercises"
import { useCategories } from "@/hooks/use-exercises"
import { useUsers } from "@/hooks/use-users"
import { Loader2 } from "lucide-react"

interface ExerciseFormProps {
  exercise?: Exercise | null
  onSubmit: (data: { 
    name: string
    suggested_reps: string
    exercise_type?: 'strength' | 'cardio'
    category_ids?: string[]
    assigned_user_ids?: string[]
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ExerciseForm({
  exercise,
  onSubmit,
  onCancel,
  isLoading = false,
}: ExerciseFormProps) {
  const [name, setName] = useState("")
  const [suggestedReps, setSuggestedReps] = useState("")
  const [exerciseType, setExerciseType] = useState<'strength' | 'cardio'>('strength')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { users, isLoading: usersLoading } = useUsers()

  useEffect(() => {
    if (exercise) {
      setName(exercise.name)
      setSuggestedReps(exercise.suggested_reps)
      setExerciseType(exercise.exercise_type || 'strength')
      // Set selected categories from exercise.categories
      if (exercise.categories) {
        setSelectedCategoryIds(exercise.categories.map(c => c.id))
      } else {
        setSelectedCategoryIds([])
      }
      
      // Get assigned user IDs
      if (exercise.exercise_assignments) {
        setSelectedUserIds(
          exercise.exercise_assignments.map((assignment) => assignment.user_id)
        )
      } else {
        setSelectedUserIds([])
      }
    } else {
      setName("")
      setSuggestedReps("")
      setExerciseType('strength')
      setSelectedCategoryIds([])
      setSelectedUserIds([])
    }
  }, [exercise])

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || (!suggestedReps && exerciseType === 'strength')) return
    await onSubmit({ 
      name, 
      suggested_reps: suggestedReps || (exerciseType === 'cardio' ? 'Tempo: minutos' : ''),
      exercise_type: exerciseType,
      category_ids: selectedCategoryIds,
      assigned_user_ids: selectedUserIds.length > 0 ? selectedUserIds : undefined
    })
    if (!exercise) {
      setName("")
      setSuggestedReps("")
      setExerciseType('strength')
      setSelectedCategoryIds([])
      setSelectedUserIds([])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise ? "Editar Exercício" : "Novo Exercício"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do Exercício
            </label>
            <Input
              id="name"
              placeholder="Ex: Supino Reto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="exercise_type" className="text-sm font-medium">
              Tipo de Exercício
            </label>
            <select
              id="exercise_type"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as 'strength' | 'cardio')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="strength">Força</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>

          {exerciseType === 'strength' && (
            <div className="space-y-2">
              <label htmlFor="reps" className="text-sm font-medium">
                Repetições Sugeridas
              </label>
              <Input
                id="reps"
                placeholder="Ex: 3x10 ou 4x8-12"
                value={suggestedReps}
                onChange={(e) => setSuggestedReps(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Categories Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Categorias
            </label>
            {categoriesLoading ? (
               <div className="flex items-center justify-center py-2">
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
               </div>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-md border border-input p-3">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => handleToggleCategory(cat.id)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Atribuir para (deixe vazio para todos)
            </label>
            {usersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-input p-3">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">
                        {user.name || user.email || "Usuário sem nome"}
                        {user.is_admin && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Admin)
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
            {selectedUserIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedUserIds.length} usuário(s) selecionado(s). Deixe vazio
                para disponibilizar para todos.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : exercise ? "Atualizar" : "Criar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
