"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/todo-service"
import type { Todo } from "@/lib/types"
import "../styles/todo-app.css"

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await getTodos()
        setTodos(data)
      } catch (error) {
        console.error("Error al cargar tareas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const todo = await createTodo(newTodo)
      setTodos([...todos, todo])
      setNewTodo("")
    } catch (error) {
      console.error("Error al añadir tarea:", error)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await updateTodo(id, { completed: !completed })
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
    } catch (error) {
      console.error("Error al actualizar tarea:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id)
      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error("Error al eliminar tarea:", error)
    }
  }

  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return

    try {
      const updatedTodo = await updateTodo(id, { text: editText })
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
      setEditingId(null)
    } catch (error) {
      console.error("Error al guardar tarea:", error)
    }
  }

  return (
    <div className="todo-container">
      <div className="todo-card">
        <h1 className="todo-title">Lista de Tareas - Módulo 2 y 3</h1>

        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Añadir nueva tarea..."
            className="todo-input"
          />
          <button type="submit" className="add-button">
            Añadir
          </button>
        </form>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.length === 0 ? (
              <li className="empty-message">No hay tareas. ¡Añade una para comenzar!</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                  <div className="todo-content">
                    <button onClick={() => handleToggleComplete(todo.id, todo.completed)} className="toggle-button">
                      {todo.completed ? "✓" : "○"}
                    </button>

                    {editingId === todo.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                    ) : (
                      <span className={`todo-text ${todo.completed ? "completed-text" : ""}`}>{todo.text}</span>
                    )}
                  </div>

                  <div className="todo-actions">
                    {editingId === todo.id ? (
                      <button onClick={() => handleSaveEdit(todo.id)} className="save-button">
                        Guardar
                      </button>
                    ) : (
                      <button onClick={() => startEditing(todo.id, todo.text)} className="edit-button">
                        Editar
                      </button>
                    )}
                    <button onClick={() => handleDelete(todo.id)} className="delete-button">
                      Eliminar
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
