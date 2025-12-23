"use client"

import { Button } from "@/components/ui/button"
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/hooks/use-exercises"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategory: ExerciseCategory
  onCategoryChange: (category: ExerciseCategory) => void
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="whitespace-nowrap"
      >
        Todos
      </Button>
      {EXERCISE_CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="whitespace-nowrap"
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}

