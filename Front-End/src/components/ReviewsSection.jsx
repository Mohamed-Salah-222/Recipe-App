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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reviews</h2>
          <p className="text-gray-600">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>


      {user && (
        <div className="mb-8">
          <AddReviewForm recipeId={recipeId} onReviewPosted={handleReviewPosted} />
        </div>
      )}


      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{(review.user?.username || "A")[0].toUpperCase()}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{review.user?.username || "Anonymous"}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

  
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 ml-2">{review.rating}/5</span>
                </div>
              </div>

   
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg">{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 text-lg mb-6">Be the first to share your thoughts about this recipe!</p>
            {!user && (
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Sign in</span> to leave a review
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsSection;
