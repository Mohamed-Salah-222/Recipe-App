import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AddReviewForm from "./AddReviewForm"; 

function ReviewsSection({ recipeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 


  useEffect(() => {
    
    const fetchReviews = async () => {
      try {
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews.");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchReviews();
    }
  }, [recipeId]); 

  
  const handleReviewPosted = () => {
   
    const refetch = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}/reviews`);
      const data = await response.json();
      setReviews(data);
    };
    refetch();
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-emerald-500 pb-2 mb-6 ">Reviews</h2>

    
      {user && <AddReviewForm recipeId={recipeId} onReviewPosted={handleReviewPosted} />}

      <div className="mt-8 space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex items-center mb-2">
                <p className="font-bold text-gray-900">{review.user?.username || "Anonymous"}</p>
                <div className="flex items-center ml-4">
                  <span className="text-yellow-400">{"★".repeat(review.rating)}</span>
                  <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2 text-right">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm border">
            <p className="text-gray-500">No reviews yet. Be the first to leave one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsSection;
