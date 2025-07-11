// models/review.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.statics.calculateAverageRating = async function (recipeId) {
  // 'this' refers to the Review model
  const stats = await this.aggregate([
    {
      $match: { recipe: recipeId }, // Find all reviews for the given recipeId
    },
    {
      $group: {
        _id: "$recipe",
        numReviews: { $sum: 1 }, // Count the number of reviews
        averageRating: { $avg: "$rating" }, // Calculate the average of the 'rating' field
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      // If there are reviews, update the corresponding recipe document
      await mongoose.model("Recipe").findByIdAndUpdate(recipeId, {
        numReviews: stats[0].numReviews,
        averageRating: stats[0].averageRating,
      });
    } else {
      // If there are no reviews left, reset the recipe's rating stats
      await mongoose.model("Recipe").findByIdAndUpdate(recipeId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// --- IMPORTANT: Call the calculation method after saving a review ---
reviewSchema.post("save", function () {
  // 'this.constructor' refers to the model (Review)
  // 'this.recipe' is the ID of the recipe this review belongs to
  this.constructor.calculateAverageRating(this.recipe);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
