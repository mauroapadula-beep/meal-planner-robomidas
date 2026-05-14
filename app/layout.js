import Link from 'next/link'

export const metadata = {
  title: 'Meal Planner',
  description: 'Meal planning web app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'Arial',
          backgroundColor: '#f5f5f5',
        }}
      >
        <nav
          style={{
            display: 'flex',
            gap: 20,
            padding: 20,
            backgroundColor: 'white',
            borderBottom: '1px solid #ddd',
          }}
        >
          <Link href="/">Home</Link>

          <Link href="/plan">Plan</Link>

          <Link href="/shopping">Shopping</Link>

          <Link href="/stock">Stock</Link>

          <Link href="/cook">Cook</Link>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  )
}
