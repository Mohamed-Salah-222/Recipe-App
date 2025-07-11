// frontend/src/components/HomePage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RecipeCard from "./RecipeCard";

function HomePage() {
  const params = useParams();
  console.log("HomePage is rendering with these URL params:", params);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // This is ONLY for the initial page load
  const [searchTerm, setSearchTerm] = useState("");
  // We have removed the 'sortOption' state

  useEffect(() => {
    // This is a performance optimization called "debouncing".
    // It waits for the user to stop typing for 300ms before making the API call.
    const delayDebounceFn = setTimeout(() => {
      const fetchRecipes = async () => {
        try {
          // The API URL now only includes the search term
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/recipes?search=${searchTerm}`;

          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setRecipes(data);
        } catch (error) {
          console.error("Error fetching recipes:", error);
        } finally {
          // This is crucial: it removes the "Loading..." message after the first fetch
          setLoading(false);
        }
      };

      fetchRecipes();
    }, 300); // 300ms delay

    // This is a cleanup function for the timer
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); // The effect now only re-runs when the searchTerm changes

  // This will only show on the very first page load
  if (loading) {
    return <div className="text-center p-10">Loading recipes...</div>;
  }

  return (
    <div>
      {/* --- Polished Header and Search Section --- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Find Your Next Favorite Recipe</h1>

        <div className="mt-8 max-w-2xl mx-auto">
          <input type="text" placeholder="Search by name or by an ingredient you have on hand." className="w-full p-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* --- Recipe List Section --- */}
      {loading ? (
        <div className="text-center p-10">Loading recipes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
