const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("../models/recipe"); 
const recipes = require("./recipesData"); 

dotenv.config();

async function seedRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    await Recipe.deleteMany();
    console.log("🗑 Existing recipes deleted");

    await Recipe.insertMany(recipes);
    console.log("🍽 Recipes inserted successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding recipes:", err);
    process.exit(1);
  }
}

seedRecipes();
