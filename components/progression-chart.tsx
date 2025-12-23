"use client"

import { useWeightProgression } from "@/hooks/use-dashboard"
import { useExercises } from "@/hooks/use-exercises"
import { useAuth } from "@/hooks/use-auth"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"

export function ProgressionChart() {
  const { user } = useAuth()
  const { exercises } = useExercises()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("all")
  const { progression, isLoading } = useWeightProgression(
    user?.id,
    selectedExerciseId === "all" ? undefined : selectedExerciseId
  )

  // Group data by date and exercise for multi-line chart
  // Sort by date first
  const sortedProgression = [...progression].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const chartData = sortedProgression.reduce((acc, item) => {
    const dateKey = item.date
    const existing = acc.find((d) => d.date === dateKey)

    if (existing) {
      // If exercise already exists for this date, take the max weight
      existing[item.exercise_name] = Math.max(
        existing[item.exercise_name] || 0,
        item.max_weight
      )
    } else {
      const newEntry: any = { date: dateKey }
      newEntry[item.exercise_name] = item.max_weight
      acc.push(newEntry)
    }

    return acc
  }, [] as any[])

  // Sort chart data by date
  chartData.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Get unique exercise names for legend
  const exerciseNames = Array.from(
    new Set(progression.map((p) => p.exercise_name))
  ).sort()

  // Show empty state if no data
  const hasData = progression.length > 0 && chartData.length > 0

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM", { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)} kg
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Progressão de Cargas</CardTitle>
              <CardDescription>
                Acompanhe sua evolução ao longo do tempo
              </CardDescription>
            </div>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por exercício" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os exercícios</SelectItem>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Color palette for exercises - grayscale with variations for better distinction
  const colors = [
    "#ffffff", // white
    "#d4d4d4", // light gray
    "#a3a3a3", // medium gray
    "#737373", // dark gray
    "#525252", // darker gray
    "#404040", // very dark gray
    "#262626", // almost black
    "#171717", // near black
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Progressão de Cargas</CardTitle>
            <CardDescription>
              Acompanhe sua evolução ao longo do tempo
            </CardDescription>
          </div>
          <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por exercício" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os exercícios</SelectItem>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  {exerciseNames.map((name, index) => (
                    <linearGradient
                      key={name}
                      id={`color${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors[index % colors.length]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors[index % colors.length]}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{
                    value: "Peso (kg)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
                {exerciseNames.map((name, index) => (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={colors[index % colors.length]}
                    fillOpacity={1}
                    fill={`url(#color${index})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">
              Nenhum dado de progressão disponível ainda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

