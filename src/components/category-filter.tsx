"use client"

import { useCategories } from "@/hooks/use-exercises"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        onClick={() => onSelectCategory("all")}
        className="whitespace-nowrap"
        size="sm"
      >
        Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? "default" : "outline"}
          onClick={() => onSelectCategory(category.name)}
          className="whitespace-nowrap"
          size="sm"
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}

