"use client"

import { useWorkoutLogs } from "@/hooks/use-workout-logs"
import { useExercises } from "@/hooks/use-exercises"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

export default function HistoricoPage() {
  const { logs, isLoading } = useWorkoutLogs()
  const { exercises } = useExercises()

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId)
    return exercise?.name || "Exercício desconhecido"
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.logged_at).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(log)
    return acc
  }, {} as Record<string, typeof logs>)

  const sortedDates = Object.keys(groupedLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="container mx-auto space-y-4 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Histórico</h1>
        <p className="mt-2 text-muted-foreground">
          Seus registros de treino organizados por data
        </p>
      </div>
      {logs.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum registro ainda. Comece registrando seus treinos!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <h2 className="text-lg font-semibold">
                {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h2>
              {groupedLogs[date].map((log) => (
                <Card key={log.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {getExerciseName(log.exercise_id)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {log.workout_sets && log.workout_sets.length > 0 ? (
                      <div className="space-y-3">
                        {log.workout_sets
                          .sort((a, b) => a.set_number - b.set_number)
                          .map((set) => (
                            <div
                              key={set.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-lg font-bold">
                                    Série {set.set_number}: {set.weight} kg
                                  </p>
                                  {set.assisted && (
                                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-500">
                                      Ajuda
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {set.reps} repetições
                                </p>
                              </div>
                            </div>
                          ))}
                        <div className="text-right text-xs text-muted-foreground">
                          {format(new Date(log.logged_at), "HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{log.weight} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {log.reps} repetições
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {format(new Date(log.logged_at), "HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

