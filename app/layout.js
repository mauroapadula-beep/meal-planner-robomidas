import NavBar from './components/NavBar'

export const metadata = {
  title: 'Meal Planner · Robomidas',
  description: 'Sistema de planificación de comidas y tareas del hogar',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
