import type { Metadata } from "next"
import { TodoApp } from "@/components/todo-app"

export const metadata: Metadata = {
  title: "Todo — Basic React App",
  description: "A simple Todo application built with React and shadcn/ui.",
}

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Basic Todo Application</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add tasks, mark them complete, filter your list, and your progress is saved locally.
        </p>
      </header>
      <TodoApp />
    </main>
  )
}
