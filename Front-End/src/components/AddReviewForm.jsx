import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AddReviewForm({ recipeId, onReviewPosted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to post review.");
      }
      setRating(5);
      setComment("");
      onReviewPosted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Leave a Review</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>

          <div className="flex items-center text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setRating(star)} className={`cursor-pointer transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}>
                ★
              </span>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Your Comment
          </label>
          <textarea id="comment" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Share your thoughts on this recipe..."></textarea>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="px-5 py-2 font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default AddReviewForm;
