"use client"

import { useCategories } from "@/hooks/use-exercises"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onCategoryChange(null)}
        className="whitespace-nowrap"
        size="sm"
      >
        Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? "default" : "outline"}
          onClick={() => onCategoryChange(category.name)}
          className="whitespace-nowrap"
          size="sm"
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}

