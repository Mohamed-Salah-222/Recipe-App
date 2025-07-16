
import { Link } from "react-router-dom";


function RecipeCard({ recipe }) {

  const authorUsername = recipe.author ? recipe.author.username : "Unknown";

  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-link group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="relative">
        <img src={recipe.imageUrl || "https://placehold.co/600x400?text=No+Image"} alt={recipe.name} className="w-full h-48 object-cover rounded-t-xl" />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700">{recipe.cookingTime} mins</div>
      </div>
      <div className="p-5">
        <p className="text-sm text-emerald-600 font-semibold">{recipe.author?.username || "Anonymous"}</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1 truncate group-hover:text-emerald-600 transition-colors">{recipe.name}</h2>

        <div className="flex items-center mt-2">
          <span className="text-yellow-400">{"★".repeat(Math.round(recipe.averageRating))}</span>
          <span className="text-gray-300">{"★".repeat(5 - Math.round(recipe.averageRating))}</span>
          <span className="text-xs text-gray-500 ml-2">({recipe.numReviews} reviews)</span>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
