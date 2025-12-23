"use client"

import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCardioLogs } from "@/hooks/use-cardio-logs"
import type { Exercise } from "@/hooks/use-exercises"
import { Loader2 } from "lucide-react"

interface CardioLogDrawerProps {
  exercise: Exercise
  isOpen: boolean
  onClose: () => void
  editingLogId?: string | null
}

export function CardioLogDrawer({
  exercise,
  isOpen,
  onClose,
  editingLogId = null,
}: CardioLogDrawerProps) {
  const { createCardioLog, updateCardioLog, logs, isLoading: logsLoading } = useCardioLogs(exercise.id)
  const [duration, setDuration] = useState("")
  const [speed, setSpeed] = useState("")
  const [resistance, setResistance] = useState("")
  const [incline, setIncline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when drawer opens/closes or exercise changes
  useEffect(() => {
    if (!isOpen) {
      setDuration("")
      setSpeed("")
      setResistance("")
      setIncline("")
      setError(null)
    }
  }, [isOpen, exercise.id])

  // Load existing log data if editing
  useEffect(() => {
    if (editingLogId && isOpen && logs.length > 0) {
      const logToEdit = logs.find(l => l.id === editingLogId)
      if (logToEdit) {
        setDuration(logToEdit.duration_minutes.toString())
        setSpeed(logToEdit.speed?.toString() || "")
        setResistance(logToEdit.resistance?.toString() || "")
        setIncline(logToEdit.incline?.toString() || "")
      }
    } else if (!isOpen) {
      setDuration("")
      setSpeed("")
      setResistance("")
      setIncline("")
    }
  }, [editingLogId, isOpen, logs])

  const getExerciseFields = () => {
    const name = exercise.name.toLowerCase()
    if (name.includes("esteira")) {
      return {
        showSpeed: true,
        showResistance: false,
        showIncline: true,
        speedLabel: "Velocidade (km/h)",
        inclineLabel: "Inclinação (%)",
      }
    } else if (name.includes("elíptica") || name.includes("eliptica")) {
      return {
        showSpeed: true,
        showResistance: true,
        showIncline: false,
        speedLabel: "Velocidade (km/h)",
        resistanceLabel: "Resistência (nível)",
      }
    } else if (name.includes("bicicleta") || name.includes("bike")) {
      return {
        showSpeed: true,
        showResistance: true,
        showIncline: false,
        speedLabel: "Velocidade (km/h)",
        resistanceLabel: "Resistência (nível)",
      }
    }
    return {
      showSpeed: false,
      showResistance: false,
      showIncline: false,
    }
  }

  const fields = getExerciseFields()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!duration || parseFloat(duration) <= 0) {
      setError("Tempo é obrigatório")
      return
    }

    setIsSubmitting(true)

    try {
      const logData = {
        exercise_id: exercise.id,
        duration_minutes: parseFloat(duration),
        speed: fields.showSpeed && speed ? parseFloat(speed) : null,
        resistance: fields.showResistance && resistance ? parseInt(resistance) : null,
        incline: fields.showIncline && incline ? parseFloat(incline) : null,
      }

      if (editingLogId) {
        await updateCardioLog({
          id: editingLogId,
          ...logData,
        })
      } else {
        await createCardioLog(logData)
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar treino")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0 border-b bg-background">
          <DrawerTitle>Registrar {exercise.name}</DrawerTitle>
          <DrawerDescription>
            {editingLogId ? "Editar treino de cardio" : "Registre seu treino de cardio"}
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Tempo (minutos) *
            </label>
            <Input
              id="duration"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0.1"
              placeholder="Ex: 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {fields.showSpeed && (
            <div className="space-y-2">
              <label htmlFor="speed" className="text-sm font-medium">
                {fields.speedLabel}
              </label>
              <Input
                id="speed"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="Ex: 10"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {fields.showResistance && (
            <div className="space-y-2">
              <label htmlFor="resistance" className="text-sm font-medium">
                {fields.resistanceLabel}
              </label>
              <Input
                id="resistance"
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Ex: 5"
                value={resistance}
                onChange={(e) => setResistance(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {fields.showIncline && (
            <div className="space-y-2">
              <label htmlFor="incline" className="text-sm font-medium">
                {fields.inclineLabel}
              </label>
              <Input
                id="incline"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 5"
                value={incline}
                onChange={(e) => setIncline(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          </div>
          <div className="flex-shrink-0 border-t bg-background p-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingLogId ? (
                  "Atualizar"
                ) : (
                  "Registrar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

