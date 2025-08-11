import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import RecipeCard from "./RecipeCard";

function UserProfilePage() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("created");

  const isOwnProfile = user && user.username === username;

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${username}/recipes`);
        if (!response.ok) {
          throw new Error("User not found or has no recipes.");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching user recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, [username]);

  const fetchFavorites = async () => {
    if (!isOwnProfile || !token) return;

    try {
      setFavoritesLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();
      setFavoriteRecipes(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      alert("Failed to load favorite recipes");
    } finally {
      setFavoritesLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === "favorites" && isOwnProfile && favoriteRecipes.length === 0) {
      fetchFavorites();
    }
  }, [activeTab, isOwnProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
    
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="text-emerald-600">{username}</span>'s Kitchen
              </h1>
              <p className="text-gray-600 text-lg">{isOwnProfile ? "Your culinary journey" : "Discover amazing recipes"}</p>
            </div>
          </div>

      
          <div className="flex gap-4 border-b border-gray-200">
            <button onClick={() => setActiveTab("created")} className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === "created" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Created Recipes ({recipes.length})
              </div>
            </button>

     
            {isOwnProfile && (
              <button onClick={() => setActiveTab("favorites")} className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === "favorites" ? "text-red-600 border-b-2 border-red-600" : "text-gray-600 hover:text-red-600"}`}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorite Recipes ({favoriteRecipes.length})
                </div>
              </button>
            )}
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-lg p-8">

          {activeTab === "created" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{isOwnProfile ? "Your Created Recipes" : `Recipes by ${username}`}</h2>
              </div>

              {recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes yet</h3>
                  <p className="text-gray-600">{isOwnProfile ? "Start sharing your culinary creations!" : "This user hasn't posted any recipes yet."}</p>
                </div>
              )}
            </div>
          )}


          {activeTab === "favorites" && isOwnProfile && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Favorite Recipes</h2>
                {!favoritesLoading && (
                  <button onClick={fetchFavorites} className="ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                )}
              </div>

              {favoritesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <p className="text-gray-600">Loading your favorite recipes...</p>
                </div>
              ) : favoriteRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoriteRecipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorite recipes yet</h3>
                  <p className="text-gray-600">Start exploring and hearting recipes you love!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
