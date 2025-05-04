import type React from "react"
import "../styles/globals.css"

export const metadata = {
  title: "To Do Módulo 2 y 3",
  description: "Aplicación de lista de tareas moderna",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
