
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RecipeCard from "./RecipeCard"; 

function UserProfilePage() {
  const { username } = useParams(); 
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Recipes by <span className="text-emerald-600">{username}</span>
      </h1>
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p>This user hasn't posted any recipes yet.</p>
      )}
    </div>
  );
}

export default UserProfilePage;
