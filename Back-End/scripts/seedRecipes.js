const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("../models/recipe"); // Adjust if path is different
const recipes = require("./recipesData"); // File from Step 2

dotenv.config();

async function seedRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Optional: Clear existing recipes first
    await Recipe.deleteMany();
    console.log("🗑 Existing recipes deleted");

    // Insert new recipes
    await Recipe.insertMany(recipes);
    console.log("🍽 Recipes inserted successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding recipes:", err);
    process.exit(1);
  }
}

seedRecipes();
