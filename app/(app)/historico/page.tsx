"use client"

import { useState } from "react"
import { useWorkoutLogs } from "@/hooks/use-workout-logs"
import { useCardioLogs } from "@/hooks/use-cardio-logs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { QuickLogDrawer } from "@/components/quick-log-drawer"
import { CardioLogDrawer } from "@/components/cardio-log-drawer"
import { useExercises } from "@/hooks/use-exercises"

export default function HistoricoPage() {
  const { logs, isLoading, updateLog, deleteLog } = useWorkoutLogs()
  const { logs: cardioLogs, updateCardioLog, deleteCardioLog } = useCardioLogs()
  const { exercises } = useExercises()
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editingCardioLogId, setEditingCardioLogId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCardioDrawerOpen, setIsCardioDrawerOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Get exercise map for quick lookup
  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]))

  // Combine and sort logs
  const allLogs = [
    ...logs.map(log => ({
      ...log,
      type: 'strength' as const,
      logged_at: log.logged_at,
    })),
    ...cardioLogs.map(cardioLog => ({
      ...cardioLog,
      type: 'cardio' as const,
      logged_at: cardioLog.workout_logs?.logged_at || cardioLog.created_at,
      workout_log_id: cardioLog.workout_log_id,
      exercise_id: (cardioLog.workout_logs as any)?.exercise_id,
    })),
  ].sort((a, b) => {
    const dateA = new Date(a.logged_at).getTime()
    const dateB = new Date(b.logged_at).getTime()
    return dateB - dateA
  })

  const handleEdit = (log: any) => {
    if (log.type === 'cardio') {
      setEditingCardioLogId(log.id)
      setIsCardioDrawerOpen(true)
    } else {
      setEditingLogId(log.id)
      setIsDrawerOpen(true)
    }
  }

  const handleDelete = async (log: any) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return

    setDeletingId(log.id)
    try {
      if (log.type === 'cardio') {
        await deleteCardioLog(log.id)
      } else {
        await deleteLog(log.id)
      }
    } catch (error: any) {
      console.error("Error deleting log:", error)
      alert("Erro ao excluir registro")
    } finally {
      setDeletingId(null)
    }
  }

  const getExerciseName = (log: any) => {
    if (log.type === 'cardio') {
      const workoutLog = log.workout_logs
      if (workoutLog?.exercises?.name) return workoutLog.exercises.name
      // Fallback: find exercise by exercise_id if available
      if (log.exercise_id) {
        const exercise = exerciseMap.get(log.exercise_id)
        if (exercise) return exercise.name
      }
    } else {
      return log.exercises?.name || "Exercício desconhecido"
    }
    return "Exercício desconhecido"
  }

  const getExercise = (log: any) => {
    if (log.exercise_id) {
      return exerciseMap.get(log.exercise_id)
    }
    return null
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
        <h1 className="text-3xl font-bold">Histórico</h1>
        <p className="mt-2 text-muted-foreground">
          Todos os seus treinos registrados
        </p>
      </div>

      {allLogs.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum treino registrado ainda.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {allLogs.map((log) => {
            const exercise = getExercise(log)
            const exerciseName = getExerciseName(log)

            return (
              <Card key={log.type === 'cardio' ? log.id : log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exerciseName}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format(new Date(log.logged_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(log)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log)}
                        disabled={deletingId === log.id}
                        className="h-8 w-8 text-destructive"
                      >
                        {deletingId === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {log.type === 'cardio' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tempo</span>
                        <span className="font-semibold">{log.duration_minutes} minutos</span>
                      </div>
                      {log.speed && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Velocidade</span>
                          <span className="font-semibold">{log.speed} km/h</span>
                        </div>
                      )}
                      {log.resistance && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Resistência</span>
                          <span className="font-semibold">Nível {log.resistance}</span>
                        </div>
                      )}
                      {log.incline && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Inclinação</span>
                          <span className="font-semibold">{log.incline}%</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {log.workout_sets && log.workout_sets.length > 0 ? (
                        log.workout_sets.map((set: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                          >
                            <div>
                              <span className="font-semibold">
                                Série {set.set_number}: {set.weight} kg × {set.reps} reps
                              </span>
                              {set.assisted && (
                                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  Ajuda
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-border bg-muted/50 p-3">
                          <span className="font-semibold">
                            {log.weight} kg × {log.reps} reps
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit drawers */}
      {editingLogId && (() => {
        const logToEdit = logs.find(l => l.id === editingLogId)
        const exerciseToEdit = logToEdit ? exerciseMap.get(logToEdit.exercise_id) : null
        return exerciseToEdit ? (
          <QuickLogDrawer
            exercise={exerciseToEdit}
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false)
              setEditingLogId(null)
            }}
            editingLogId={editingLogId}
            currentPR={null}
          />
        ) : null
      })()}

      {editingCardioLogId && (() => {
        const cardioLogToEdit = cardioLogs.find(l => l.id === editingCardioLogId)
        const exerciseId = (cardioLogToEdit?.workout_logs as any)?.exercise_id
        const exerciseToEdit = exerciseId ? exerciseMap.get(exerciseId) : null
        return exerciseToEdit ? (
          <CardioLogDrawer
            exercise={exerciseToEdit}
            isOpen={isCardioDrawerOpen}
            onClose={() => {
              setIsCardioDrawerOpen(false)
              setEditingCardioLogId(null)
            }}
            editingLogId={editingCardioLogId}
          />
        ) : null
      })()}
    </div>
  )
}
