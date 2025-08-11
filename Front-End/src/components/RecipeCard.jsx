import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
const BASE_URL = import.meta.env.VITE_API_URL;

function RecipeCard({ recipe }) {
  const { user, token } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const authorUsername = recipe.author ? recipe.author.username : "Unknown";


  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorited(user.favorites.includes(recipe._id));
    }
  }, [user, recipe._id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user || !token) {
      alert("Please login to add favorites");
      return;
    }

    setIsLoading(true);
    try {
      const url = `${BASE_URL}/api/favorites/${recipe._id}`;
      const method = isFavorited ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      const data = await response.json();
      setIsFavorited(!isFavorited);


      console.log(data.message);
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    const recipeUrl = `${window.location.origin}/recipes/${recipe._id}`;
    const shareData = {
      title: recipe.name,
      text: `Check out this amazing recipe: ${recipe.name}`,
      url: recipeUrl,
    };

    try {
 
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {

        await navigator.clipboard.writeText(recipeUrl);
        alert("Recipe link copied to clipboard!");
      }
    } catch (error) {

      try {
        await navigator.clipboard.writeText(recipeUrl);
        alert("Recipe link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Share failed:", error);
        alert(`Share this recipe: ${recipeUrl}`);
      }
    }
  };

  return (
    <Link to={`/recipes/${recipe._id}`} className="group block bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border border-gray-100 hover:border-emerald-200">
  
      <div className="relative h-56 overflow-hidden">
        <img src={recipe.imageUrl ? `${BASE_URL}${recipe.imageUrl}` : "https://placehold.co/600x400?text=No+Image"} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">{recipe.cookingTime} mins</span>
        </div>

    
        <div className="absolute top-4 left-4 bg-emerald-600/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-semibold text-white">{recipe.author?.username || "Anonymous"}</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 font-semibold py-2.5 px-4 rounded-full shadow-lg text-center border-2 border-transparent hover:border-emerald-500 transition-colors duration-200">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Recipe
            </span>
          </div>
        </div>
      </div>


      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 leading-tight">{recipe.name}</h3>


        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-4 h-4 ${i < Math.round(recipe.averageRating || 0) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-700 font-medium">{recipe.averageRating || 0}</span>
          <span className="text-xs text-gray-500">({recipe.numReviews || 0} reviews)</span>
        </div>


        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">

            <button onClick={handleFavoriteClick} disabled={isLoading} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorited ? "bg-red-100 hover:bg-red-200" : "bg-emerald-100 hover:bg-emerald-200"} ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`} title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
              <svg className={`w-4 h-4 transition-colors ${isFavorited ? "text-red-600" : "text-emerald-600"}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>


            <button onClick={handleShareClick} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 hover:scale-110 transition-all duration-200" title="Share recipe">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>

  
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="mt-4 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </Link>
  );
}

export default RecipeCard;
