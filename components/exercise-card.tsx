"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWorkoutLogs } from "@/hooks/use-workout-logs"
import { useCardioLogs } from "@/hooks/use-cardio-logs"
import { QuickLogDrawer } from "./quick-log-drawer"
import { CardioLogDrawer } from "./cardio-log-drawer"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import type { Exercise } from "@/hooks/use-exercises"

interface ExerciseCardProps {
  exercise: Exercise
  isAdmin?: boolean
  onEdit?: (exercise: Exercise) => void
  onDelete?: (id: string) => void
}

export function ExerciseCard({
  exercise,
  isAdmin = false,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  const isCardio = exercise.exercise_type === 'cardio'
  const { getPR, getLastWorkout } = useWorkoutLogs()
  const { logs: cardioLogs, isLoading: cardioLogsLoading } = useCardioLogs(isCardio ? exercise.id : undefined)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  const pr = isCardio ? null : getPR(exercise.id)
  const lastWorkout = isCardio ? null : getLastWorkout(exercise.id)
  
  // Get last cardio workout
  const lastCardioWorkout = isCardio && !cardioLogsLoading && cardioLogs.length > 0 ? cardioLogs[0] : null

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">{exercise.name}</CardTitle>
                <div className="flex flex-wrap gap-1">
                  {exercise.categories && exercise.categories.length > 0 ? (
                    exercise.categories.map((cat) => (
                      <span 
                        key={cat.id}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary whitespace-nowrap"
                      >
                        {cat.name}
                      </span>
                    ))
                  ) : exercise.category ? (
                    // Fallback for old data if needed
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {exercise.category.toUpperCase()}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Repetições sugeridas: {exercise.suggested_reps}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(exercise)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete?.(exercise.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCardio ? (
            lastCardioWorkout ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-sm text-muted-foreground">Último Treino</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-semibold text-primary">
                      {lastCardioWorkout.duration_minutes} minutos
                    </p>
                    {lastCardioWorkout.speed && (
                      <p className="text-muted-foreground">
                        Velocidade: {lastCardioWorkout.speed} km/h
                      </p>
                    )}
                    {lastCardioWorkout.resistance && (
                      <p className="text-muted-foreground">
                        Resistência: {lastCardioWorkout.resistance}
                      </p>
                    )}
                    {lastCardioWorkout.incline && (
                      <p className="text-muted-foreground">
                        Inclinação: {lastCardioWorkout.incline}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Nenhum registro ainda
                </p>
              </div>
            )
          ) : pr !== null ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Recorde Pessoal</p>
                <p className="text-2xl font-bold text-primary">{pr} kg</p>
              </div>
              {lastWorkout && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Último Treino
                  </p>
                  <div className="space-y-1.5">
                    {lastWorkout.sets.map((set, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {set.weight} kg × {set.reps} reps
                        </span>
                        {set.assisted && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Ajuda
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Nenhum registro ainda
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setIsDrawerOpen(true)}
            size="lg"
          >
            Registrar
          </Button>
        </CardFooter>
      </Card>
      {isCardio ? (
        <CardioLogDrawer
          exercise={exercise}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      ) : (
        <QuickLogDrawer
          exercise={exercise}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentPR={pr}
        />
      )}
    </>
  )
}
