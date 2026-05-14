const weeklyPlan = [
  {
    day: 'Monday',
    lunch: 'Grilled Chicken + Rice',
    dinner: 'Pumpkin Soup',
  },
  {
    day: 'Tuesday',
    lunch: 'Fish + Vegetables',
    dinner: 'Pasta Bolognese',
  },
  {
    day: 'Wednesday',
    lunch: 'Beef + Sweet Potato',
    dinner: 'Lentil Stew',
  },
  {
    day: 'Thursday',
    lunch: 'Chicken Salad',
    dinner: 'Vegetable Omelette',
  },
  {
    day: 'Friday',
    lunch: 'Rice Bowl',
    dinner: 'Homemade Pizza',
  },
]

export default function PlanPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>📅 Weekly Meal Plan</h1>

      <p>Weekly organization of meals.</p>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 30,
          backgroundColor: 'white',
        }}
      >
        <thead>
          <tr>
            <th style={styles.th}>Day</th>
            <th style={styles.th}>Lunch</th>
            <th style={styles.th}>Dinner</th>
          </tr>
        </thead>

        <tbody>
          {weeklyPlan.map((item) => (
            <tr key={item.day}>
              <td style={styles.td}>{item.day}</td>

              <td style={styles.td}>{item.lunch}</td>

              <td style={styles.td}>{item.dinner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  th: {
    border: '1px solid #ddd',
    padding: 12,
    backgroundColor: '#f0f0f0',
    textAlign: 'left',
  },

  td: {
    border: '1px solid #ddd',
    padding: 12,
  },
}
