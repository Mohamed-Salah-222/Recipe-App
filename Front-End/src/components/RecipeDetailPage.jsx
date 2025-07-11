import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReviewsSection from "./ReviewsSection";

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`);
        if (!response.ok) throw new Error("Recipe not found");
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this recipe?");

    if (isConfirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete recipe.");
        }

        console.log("Recipe deleted successfully.");
        navigate("/");
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  if (loading) return <div className="text-center p-10">Loading recipe...</div>;
  if (!recipe) return <div className="text-center p-10">Recipe not found.</div>;

  const isAuthor = user && user.userId === recipe.author?._id;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <img src={recipe.imageUrl || "https://placehold.co/1200x600?text=Recipe+Image"} alt={recipe.name} className="w-full h-64 md:h-96 object-cover" />
        <div className="p-6 md:p-8">
        
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{recipe.name}</h1>
              <p className="text-md text-gray-500 mt-2">
                By:
                <Link to={`/profile/${recipe.author?.username}`} className="font-semibold text-emerald-600 hover:underline ml-1">
                  {recipe.author?.username || "Unknown"}
                </Link>
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center text-yellow-400">
                <span className="text-2xl">{"★".repeat(Math.round(recipe.averageRating))}</span>
                <span className="text-2xl text-gray-300">{"★".repeat(5 - Math.round(recipe.averageRating))}</span>
              </div>
              <p className="text-sm text-gray-500 text-right mt-1">{recipe.numReviews} reviews</p>
            </div>
          </div>

          <div className="flex items-center text-gray-600 border-y py-4 mb-8">
            <span className="mr-6">
              Cooking Time: <strong>{recipe.cookingTime} minutes</strong>
            </span>
            
          </div>

          <p className="text-gray-700 text-lg mb-8">{recipe.description}</p>

         
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-emerald-500 pb-2 mb-4">Ingredients</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-emerald-500 pb-2 mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-4 text-gray-700 leading-relaxed">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

         
          {isAuthor && (
            <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
              <Link to={`/recipes/${recipe._id}/edit`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Edit
              </Link>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>

        
        <div className="mt-12">
          <ReviewsSection recipeId={id} />
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
