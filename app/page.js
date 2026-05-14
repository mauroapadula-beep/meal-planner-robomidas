import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>🍽️ Meal Planner</h1>

      <p>Your web app is now running 🚀</p>

      <div
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 30,
          marginBottom: 40,
        }}
      >
        <Link href="/">Home</Link>

        <Link href="/plan">Plan</Link>

        <Link href="/shopping">Shopping</Link>

        <Link href="/stock">Stock</Link>

        <Link href="/cook">Cook</Link>
      </div>

      <h2>Initial features:</h2>

      <ul>
        <li>✅ Weekly planning</li>
        <li>✅ Shopping list</li>
        <li>✅ Stock management</li>
        <li>✅ Cook mode</li>
      </ul>
    </div>
  )
}
