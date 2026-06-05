"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    difficulty: "",
    calories: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    ingredients: "",
  });

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setRecipes(data);
    }
  }

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("recipes").insert([
      {
        name: form.name,
        difficulty: form.difficulty,
        calories: Number(form.calories),
        prep_time: Number(form.prep_time),
        cook_time: Number(form.cook_time),
        servings: Number(form.servings),
        ingredients: form.ingredients,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Recipe created successfully");

      setForm({
        name: "",
        difficulty: "",
        calories: "",
        prep_time: "",
        cook_time: "",
        servings: "",
        ingredients: "",
      });

      fetchRecipes();
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px" }}>
      <h1>Create Recipe</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "50px",
        }}
      >
        <input
          placeholder="Recipe name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Difficulty"
          value={form.difficulty}
          onChange={(e) =>
            setForm({ ...form, difficulty: e.target.value })
          }
        />

        <input
          placeholder="Calories"
          value={form.calories}
          onChange={(e) =>
            setForm({ ...form, calories: e.target.value })
          }
        />

        <input
          placeholder="Prep time"
          value={form.prep_time}
          onChange={(e) =>
            setForm({ ...form, prep_time: e.target.value })
          }
        />

        <input
          placeholder="Cook time"
          value={form.cook_time}
          onChange={(e) =>
            setForm({ ...form, cook_time: e.target.value })
          }
        />

        <input
          placeholder="Servings"
          value={form.servings}
          onChange={(e) =>
            setForm({ ...form, servings: e.target.value })
          }
        />

        <textarea
          placeholder="Ingredients"
          value={form.ingredients}
          onChange={(e) =>
            setForm({ ...form, ingredients: e.target.value })
          }
        />

        <button type="submit">
          Save Recipe
        </button>
      </form>

      <h2>Saved Recipes</h2>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3>{recipe.name}</h3>

            <p>
              <strong>Difficulty:</strong>{" "}
              {recipe.difficulty}
            </p>

            <p>
              <strong>Calories:</strong>{" "}
              {recipe.calories}
            </p>

            <p>
              <strong>Prep Time:</strong>{" "}
              {recipe.prep_time} min
            </p>

            <p>
              <strong>Cook Time:</strong>{" "}
              {recipe.cook_time} min
            </p>

            <p>
              <strong>Servings:</strong>{" "}
              {recipe.servings}
            </p>

            <p>
              <strong>Ingredients:</strong>{" "}
              {recipe.ingredients}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
