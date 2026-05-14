import { weeklyPlan, ingredientsMap } from '../../data/meals'

export default function ShoppingPage() {
  const shoppingItems = []

  weeklyPlan.forEach((day) => {
    const meals = [day.lunch, day.dinner]

    meals.forEach((meal) => {
      const ingredients = ingredientsMap[meal]

      if (ingredients) {
        ingredients.forEach((ingredient) => {
          if (!shoppingItems.includes(ingredient)) {
            shoppingItems.push(ingredient)
          }
        })
      }
    })
  })

  return (
    <div style={{ padding: 40 }}>
      <h1>🛒 Shopping List</h1>

      <p>Automatically generated from weekly meals.</p>

      <div
        style={{
          marginTop: 30,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
        }}
      >
        {shoppingItems.map((item) => (
          <div
            key={item}
            style={{
              padding: 12,
              borderBottom: '1px solid #eee',
            }}
          >
            ✅ {item}
          </div>
        ))}
      </div>
    </div>
  )
}
