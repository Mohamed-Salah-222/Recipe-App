import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreateRecipePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [cookingTime, setCookingTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeImage) {
      setError("Please upload a recipe image.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("cookingTime", cookingTime);

    formData.append("ingredients", ingredients.split("\n").join(","));
    formData.append("instructions", instructions.split("\n").join(","));

    formData.append("recipeImage", recipeImage);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create recipe.");
      }

      const newRecipe = await response.json();
      console.log("Recipe created successfully:", newRecipe);

      navigate(`/recipes/${newRecipe._id}`);
    } catch (err) {
      console.error("Recipe creation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-stone-50 py-10 px-4">
      <div className="max-w-3xl mx-auto p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          
          Share Your Recipe
        </h1>
        <p className="text-center text-gray-500">Fill out the details below to add your recipe to the platform.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Recipe Name
            </label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <div>
            <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
              Cooking Time (in minutes)
            </label>
            <input type="number" id="cookingTime" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <p className="text-xs text-gray-500">Enter each ingredient on a new line.</p>
            <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows="5" required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <p className="text-xs text-gray-500">Enter each step on a new line.</p>
            <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows="8" required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          
          <div>
            <label htmlFor="recipeImage" className="block text-sm font-medium text-gray-700">
              Recipe Image
            </label>
            <input
              type="file"
              id="recipeImage"
              onChange={(e) => setRecipeImage(e.target.files[0])}
              
              className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300 disabled:bg-emerald-300">
            
              {loading ? "Submitting..." : "Submit Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecipePage;
