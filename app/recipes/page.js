"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setRecipes(data);
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🍽 Recipes</h1>

      {recipes.length === 0 ? (
        <p>No recipes yet</p>
      ) : (
        recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              marginBottom: 20,
              borderRadius: 10,
            }}
          >
            <h2>{recipe.name}</h2>

            <p>
              <strong>Category:</strong> {recipe.category}
            </p>

            <p>
              <strong>Calories:</strong> {recipe.calories}
            </p>

            <p>
              <strong>Prep Time:</strong> {recipe.prep_time} min
            </p>

            <p>
              <strong>Cook Time:</strong> {recipe.cook_time} min
            </p>

            <p>
              <strong>Servings:</strong> {recipe.servings}
            </p>

            <p>
              <strong>Protein:</strong> {recipe.protein_type}
            </p>
          </div>
        ))
      )}
    </main>
  );
}
