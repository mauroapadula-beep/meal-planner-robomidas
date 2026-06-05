import { supabase } from '../lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('weekly_plan')
    .select('*')

  return (
    <div style={{ padding: 40 }}>
      <h1>🍽️ Meal Planner</h1>

      <h2>Supabase Connection Test</h2>

      {error ? (
        <div>
          <p>❌ Connection failed</p>

          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div>
          <p>✅ Database connected successfully</p>

          <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
