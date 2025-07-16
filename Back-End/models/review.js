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
  const stats = await this.aggregate([
    {
      $match: { recipe: recipeId },
    },
    {
      $group: {
        _id: "$recipe",
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("Recipe").findByIdAndUpdate(recipeId, {
        numReviews: stats[0].numReviews,
        averageRating: stats[0].averageRating,
      });
    } else {
      await mongoose.model("Recipe").findByIdAndUpdate(recipeId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.recipe);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
