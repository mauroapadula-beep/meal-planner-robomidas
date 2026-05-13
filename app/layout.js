export const metadata = {
  title: 'Meal Planner',
  description: 'Meal planning web app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
