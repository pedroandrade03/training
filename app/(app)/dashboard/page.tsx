"use client"

import {
  useDashboardRanking,
  useUserExerciseProgress,
  useProgressionRanking,
} from "@/hooks/use-dashboard"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Activity, Award, LineChart } from "lucide-react"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ProgressionChart } from "@/components/progression-chart"

export default function DashboardPage() {
  const { ranking, isLoading: rankingLoading } = useDashboardRanking()
  const { ranking: progressionRanking, isLoading: progressionLoading } =
    useProgressionRanking()
  const { user } = useAuth()
  const { progress, isLoading: progressLoading } = useUserExerciseProgress(user?.id)

  const currentUserRank = ranking.findIndex((u) => u.user_id === user?.id) + 1
  const currentUserMetrics = ranking.find((u) => u.user_id === user?.id)
  const currentUserProgressionRank =
    progressionRanking.findIndex((u) => u.user_id === user?.id) + 1
  const currentUserProgression = progressionRanking.find((u) => u.user_id === user?.id)

  if (rankingLoading || progressLoading || progressionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe sua progressão e compare com outros usuários
        </p>
      </div>

      {/* Current User Stats */}
      {currentUserMetrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de PRs</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentUserMetrics.total_pr_weight.toFixed(1)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                {currentUserMetrics.total_exercises_with_pr} exercícios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentUserMetrics.total_volume.toFixed(0)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                {currentUserMetrics.recent_volume.toFixed(0)} kg (30 dias)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posição no Ranking</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                #{currentUserRank || "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                de {ranking.length} usuários
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progression Chart */}
      <ProgressionChart />

      {/* Progression Ranking - Based on improvement from first weight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-foreground" />
            Ranking de Progressão
          </CardTitle>
          <CardDescription>
            Classificação baseada na evolução desde a primeira carga registrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressionRanking.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progressionRanking.map((rankedUser, index) => {
                const isCurrentUser = rankedUser.user_id === user?.id
                const getRankIcon = (idx: number) => {
                  if (idx === 0) return "🥇"
                  if (idx === 1) return "🥈"
                  if (idx === 2) return "🥉"
                  return `#${idx + 1}`
                }

                return (
                  <div
                    key={rankedUser.user_id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 transition-colors ${
                      isCurrentUser
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback>
                          {rankedUser.user_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{rankedUser.user_name}</p>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>
                            <TrendingUp className="mr-1 inline h-3 w-3" />
                            {rankedUser.average_progression_percentage.toFixed(1)}% média
                          </span>
                          <span>
                            <Activity className="mr-1 inline h-3 w-3" />
                            {rankedUser.exercises_with_progression} exercícios
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <div className="text-lg font-bold text-foreground">
                        +{rankedUser.total_progression_percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rankedUser.first_total_weight.toFixed(1)} →{" "}
                        {rankedUser.total_pr_weight.toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PR Ranking - Based on total PR weight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-foreground" />
            Ranking de Recordes (PRs)
          </CardTitle>
          <CardDescription>
            Classificação baseada na soma dos recordes pessoais (PRs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.map((rankedUser, index) => {
                const isCurrentUser = rankedUser.user_id === user?.id
                const getRankIcon = (idx: number) => {
                  if (idx === 0) return "🥇"
                  if (idx === 1) return "🥈"
                  if (idx === 2) return "🥉"
                  return `#${idx + 1}`
                }

                return (
                  <div
                    key={rankedUser.user_id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 transition-colors ${
                      isCurrentUser
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback>
                          {rankedUser.user_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{rankedUser.user_name}</p>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>
                            <TrendingUp className="mr-1 inline h-3 w-3" />
                            {rankedUser.total_pr_weight.toFixed(1)} kg PR
                          </span>
                          <span>
                            <Activity className="mr-1 inline h-3 w-3" />
                            {rankedUser.total_exercises_with_pr} exercícios
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <div className="text-lg font-bold text-primary">
                        {rankedUser.total_pr_weight.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">kg total</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Exercise Progress */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sua Progressão por Exercício</CardTitle>
            <CardDescription>
              Seus recordes pessoais em cada exercício
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{exercise.exercise_name}</p>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{exercise.total_workouts} treinos</span>
                      {exercise.last_workout_date && (
                        <span>
                          Último:{" "}
                          {format(new Date(exercise.last_workout_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {exercise.pr_weight.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-muted-foreground">PR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

