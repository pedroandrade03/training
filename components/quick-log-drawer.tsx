"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorkoutLogs, type WorkoutLog } from "@/hooks/use-workout-logs"
import type { Exercise } from "@/hooks/use-exercises"
import { Plus, Trash2 } from "lucide-react"

interface QuickLogDrawerProps {
  exercise: Exercise
  isOpen: boolean
  onClose: () => void
  currentPR?: number | null
  editingLogId?: string | null
}

interface WorkoutSet {
  set_number: number
  weight: string
  reps: string
  assisted: boolean
}

export function QuickLogDrawer({
  exercise,
  isOpen,
  onClose,
  currentPR,
  editingLogId = null,
}: QuickLogDrawerProps) {
  const [sets, setSets] = useState<WorkoutSet[]>([
    { set_number: 1, weight: "", reps: "", assisted: false },
  ])
  const [loading, setLoading] = useState(false)
  const { createLog, updateLog, logs } = useWorkoutLogs()

  const handleAddSet = () => {
    setSets([
      ...sets,
      {
        set_number: sets.length + 1,
        weight: "",
        reps: "",
        assisted: false,
      },
    ])
  }

  const handleRemoveSet = (index: number) => {
    if (sets.length === 1) return // Keep at least one set
    const newSets = sets.filter((_, i) => i !== index)
    // Renumber sets
    setSets(newSets.map((set, i) => ({ ...set, set_number: i + 1 })))
  }

  const handleSetChange = (
    index: number,
    field: "weight" | "reps" | "assisted",
    value: string | boolean
  ) => {
    const newSets = [...sets]
    newSets[index] = { ...newSets[index], [field]: value }
    setSets(newSets)
  }

  // Load existing log data when editing
  useEffect(() => {
    if (editingLogId && isOpen) {
      const logToEdit = logs.find(l => l.id === editingLogId)
      if (logToEdit && logToEdit.workout_sets && logToEdit.workout_sets.length > 0) {
        setSets(
          logToEdit.workout_sets
            .sort((a, b) => a.set_number - b.set_number)
            .map(set => ({
              set_number: set.set_number,
              weight: set.weight.toString(),
              reps: set.reps.toString(),
              assisted: set.assisted,
            }))
        )
      } else if (logToEdit) {
        // Old format: single set
        setSets([{
          set_number: 1,
          weight: logToEdit.weight.toString(),
          reps: logToEdit.reps.toString(),
          assisted: false,
        }])
      }
    } else if (!isOpen) {
      // Reset when drawer closes
      setSets([{ set_number: 1, weight: "", reps: "", assisted: false }])
    }
  }, [editingLogId, isOpen, logs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all sets have weight and reps
    const isValid = sets.every(
      (set) => set.weight && set.reps && parseFloat(set.weight) > 0 && parseInt(set.reps) > 0
    )
    
    if (!isValid) {
      alert("Preencha peso e repetições para todas as séries")
      return
    }

    setLoading(true)
    try {
      const setsData = sets.map((set) => ({
        set_number: set.set_number,
        weight: parseFloat(set.weight),
        reps: parseInt(set.reps),
        assisted: set.assisted,
      }))

      if (editingLogId) {
        await updateLog({
          logId: editingLogId,
          sets: setsData,
        })
      } else {
        await createLog({
          exercise_id: exercise.id,
          sets: setsData,
        })
      }
      // Reset form
      setSets([{ set_number: 1, weight: "", reps: "", assisted: false }])
      onClose()
    } catch (error) {
      console.error("Error saving log:", error)
      alert("Erro ao salvar treino")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="sticky top-0 z-10 bg-background">
          <DrawerTitle>
            {editingLogId ? "Editar" : "Registrar"} {exercise.name}
          </DrawerTitle>
          <DrawerDescription>
            {editingLogId 
              ? "Edite suas séries e cargas" 
              : "Registre todas as séries realizadas hoje"}
          </DrawerDescription>
          {currentPR !== null && (
            <div className="mt-2 rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Seu recorde atual</p>
              <p className="text-xl font-bold">{currentPR} kg</p>
            </div>
          )}
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-4">
          <div className="space-y-4">
            {sets.map((set, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Série {set.set_number}</h3>
                  {sets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSet(index)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Peso (kg)</label>
                    <Input
                      type="number"
                      step="0.5"
                      inputMode="decimal"
                      placeholder="Ex: 50.5"
                      value={set.weight}
                      onChange={(e) =>
                        handleSetChange(index, "weight", e.target.value)
                      }
                      required
                      disabled={loading}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Repetições</label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 10"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetChange(index, "reps", e.target.value)
                      }
                      required
                      disabled={loading}
                      min="1"
                      className="h-12 text-lg"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={set.assisted}
                      onChange={(e) =>
                        handleSetChange(index, "assisted", e.target.checked)
                      }
                      disabled={loading}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm">Teve ajuda/spotter</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSet}
            className="w-full"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Série
          </Button>

          <DrawerFooter className="sticky bottom-0 bg-background">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Salvando..." : editingLogId ? "Atualizar" : "Salvar Treino"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" size="lg" disabled={loading}>
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
