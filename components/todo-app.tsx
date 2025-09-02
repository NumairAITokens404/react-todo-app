"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type Filter = "all" | "active" | "completed"

const STORAGE_KEY = "v0.basic-todo.items"
const STORAGE_FILTER_KEY = "v0.basic-todo.filter"

function useLocalTodos() {
  const [todos, setTodos] = React.useState<Todo[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Todo[]) : []
    } catch {
      return []
    }
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // ignore write errors
    }
  }, [todos])

  return { todos, setTodos }
}

function useLocalFilter() {
  const [filter, setFilter] = React.useState<Filter>(() => {
    if (typeof window === "undefined") return "all"
    try {
      const raw = window.localStorage.getItem(STORAGE_FILTER_KEY)
      return (raw as Filter) || "all"
    } catch {
      return "all"
    }
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_FILTER_KEY, filter)
    } catch {
      // ignore write errors
    }
  }, [filter])

  return { filter, setFilter }
}

export function TodoApp() {
  const { todos, setTodos } = useLocalTodos()
  const { filter, setFilter } = useLocalFilter()
  const [title, setTitle] = React.useState("")

  const remaining = todos.filter((t) => !t.completed).length
  const completed = todos.length - remaining
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0

  const filteredTodos = React.useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed)
      case "completed":
        return todos.filter((t) => t.completed)
      default:
        return todos
    }
  }, [todos, filter])

  function handleAdd(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const next: Todo = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((prev) => [next, ...prev])
    setTitle("")
  }

  function toggleTodo(id: string, checked: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: checked } : t)))
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-pretty">Your Tasks</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completed}/{todos.length} done
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <label htmlFor="new-todo" className="sr-only">
            Add a new task
          </label>
          <Input
            id="new-todo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            autoComplete="off"
            aria-label="New task title"
          />
          <Button type="submit" aria-label="Add task">
            Add
          </Button>
        </form>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton active={filter === "active"} onClick={() => setFilter("active")}>
              Active
            </FilterButton>
            <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>
              Completed
            </FilterButton>
          </div>
          <Progress value={progress} ariaLabel="Completion progress" />
        </div>

        <ul className="space-y-2">
          {filteredTodos.length === 0 ? (
            <li className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No tasks {filter !== "all" ? `in "${filter}"` : ""}. Add one above to get started.
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "flex items-center justify-between rounded-md border p-3",
                  todo.completed ? "bg-muted/40" : "bg-background",
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={(v) => toggleTodo(todo.id, Boolean(v))}
                    aria-label={todo.completed ? "Mark as not completed" : "Mark as completed"}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn("text-sm", todo.completed ? "line-through text-muted-foreground" : "text-foreground")}
                  >
                    {todo.title}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {todo.completed ? (
                    <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="size-4 text-blue-600" aria-hidden />
                  )}
                  <Button size="icon" variant="ghost" onClick={() => deleteTodo(todo.id)} aria-label="Delete task">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {remaining} {remaining === 1 ? "task" : "tasks"} remaining
        </span>
        <Button variant="outline" onClick={clearCompleted} disabled={completed === 0}>
          Clear completed
        </Button>
      </CardFooter>
    </Card>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      aria-pressed={active}
      className={cn(!active && "bg-background")}
    >
      {children}
    </Button>
  )
}

function Progress({ value, ariaLabel }: { value: number; ariaLabel?: string }) {
  return (
    <div className="flex items-center gap-2" aria-label={ariaLabel}>
      <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-blue-600 transition-[width]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{value}%</span>
    </div>
  )
}
