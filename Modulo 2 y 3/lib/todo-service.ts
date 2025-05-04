import type { Todo, TodoUpdate } from "./types"

let todos: Todo[] = [
  {
    id: "1",
    text: "Crear diseño de interfaz futurista",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "Implementar modo oscuro",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    text: "Añadir animaciones",
    completed: false,
    createdAt: new Date().toISOString(),
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getTodos(): Promise<Todo[]> {
  await delay(800)
  return [...todos]
}

export async function createTodo(text: string): Promise<Todo> {
  await delay(500)
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  }
  todos = [...todos, newTodo]
  return newTodo
}

export async function updateTodo(id: string, update: TodoUpdate): Promise<Todo> {
  await delay(500)
  const todoIndex = todos.findIndex((todo) => todo.id === id)

  if (todoIndex === -1) {
    throw new Error(`Tarea con id ${id} no encontrada`)
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...update,
  }

  todos = [...todos.slice(0, todoIndex), updatedTodo, ...todos.slice(todoIndex + 1)]

  return updatedTodo
}

export async function deleteTodo(id: string): Promise<void> {
  await delay(500)
  todos = todos.filter((todo) => todo.id !== id)
}
