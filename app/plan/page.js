'use client'

import { useState } from 'react'

export default function PlanPage() {
  const [weeklyPlan, setWeeklyPlan] = useState([
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
  ])

  const updateMeal = (index, field, value) => {
    const updatedPlan = [...weeklyPlan]

    updatedPlan[index][field] = value

    setWeeklyPlan(updatedPlan)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>📅 Weekly Meal Plan</h1>

      <p>Edit meals directly in the planner.</p>

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
          {weeklyPlan.map((item, index) => (
            <tr key={item.day}>
              <td style={styles.td}>{item.day}</td>

              <td style={styles.td}>
                <input
                  value={item.lunch}
                  onChange={(e) =>
                    updateMeal(index, 'lunch', e.target.value)
                  }
                  style={styles.input}
                />
              </td>

              <td style={styles.td}>
                <input
                  value={item.dinner}
                  onChange={(e) =>
                    updateMeal(index, 'dinner', e.target.value)
                  }
                  style={styles.input}
                />
              </td>
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

  input: {
    width: '100%',
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 4,
  },
}
