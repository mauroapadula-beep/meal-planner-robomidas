"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    calories: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    protein_type: "",
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setRecipes(data);
    }
  }

  async function createRecipe() {
    const { error } = await supabase
      .from("recipes")
      .insert([form]);

    if (error) {
      alert("Error creating recipe");
      console.error(error);
      return;
    }

    setForm({
      name: "",
      category: "",
      calories: "",
      prep_time: "",
      cook_time: "",
      servings: "",
      protein_type: "",
    });

    fetchRecipes();
  }

  return (
    <main style={{ padding: 40, maxWidth: 800 }}>
      <h1>🍽 Recipes</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 10,
          marginBottom: 40,
        }}
      >
        <h2>Create Recipe</h2>

        <input
          placeholder="Recipe name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Calories"
          value={form.calories}
          onChange={(e) =>
            setForm({ ...form, calories: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Prep time"
          value={form.prep_time}
          onChange={(e) =>
            setForm({ ...form, prep_time: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Cook time"
          value={form.cook_time}
          onChange={(e) =>
            setForm({ ...form, cook_time: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Servings"
          value={form.servings}
          onChange={(e) =>
            setForm({ ...form, servings: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Protein type"
          value={form.protein_type}
          onChange={(e) =>
            setForm({
              ...form,
              protein_type: e.target.value,
            })
          }
          style={inputStyle}
        />

        <button
          onClick={createRecipe}
          style={{
            padding: 12,
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Save Recipe
        </button>
      </div>

      <h2>Recipe List</h2>

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
            <h3>{recipe.name}</h3>

            <p>Category: {recipe.category}</p>
            <p>Calories: {recipe.calories}</p>
            <p>Prep Time: {recipe.prep_time} min</p>
            <p>Cook Time: {recipe.cook_time} min</p>
            <p>Servings: {recipe.servings}</p>
            <p>Protein: {recipe.protein_type}</p>
          </div>
        ))
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};
