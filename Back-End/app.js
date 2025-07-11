//! Environment variables
require("dotenv").config();

//! Importing
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const authMiddleware = require("./middleware/authMiddleware");
const User = require("./models/user");
const Review = require("./models/review");
const Recipe = require("./models/recipe");
const path = require("path");

//!  MiddleWare + App + DataBase

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbURI = process.env.MONGODB_URI;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//! APIs
//^-----------------------------------------------------------------------------------POST REQUESTS-----------------------------------------------------------------------------------
//&--Register API
app.post("/api/auth/register", async (req, res) => {
  try {
    //* get the email password username from the req.body
    const { email, password, username } = req.body;
    //* validate them
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //* check if the passowrd is too short
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    //* Check if the Email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }
    //* Hash the Password + Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email: email, password: hashedPassword, username: username });
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully!", userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error during registraion" });
  }
});
//&--Login API
app.post("/api/auth/login", async (req, res) => {
  try {
    //* get the email password  from the req.body
    const { email, password } = req.body;
    //* validate them
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password are missing" });
    }
    //* check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    //*Check if the passowrd is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    //*Log the user in
    const payload = { userId: user._id, email: user.email, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (err) {
    res.status(500).json({ message: "Server error during login." });
  }
});
//&--Recipe API

app.post("/api/recipes", authMiddleware, upload.single("recipeImage"), async (req, res) => {
  try {
    const { name, description, ingredients, instructions, cookingTime } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A recipe image is required." });
    }

    const authorId = req.user.userId;

    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ message: "Name, ingredients, and instructions are required." });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

    const ingredientsArray = ingredients.split(",").map((item) => item.trim());
    const instructionsArray = instructions.split(",").map((step) => step.trim());

    const newRecipe = new Recipe({
      name,
      description,
      ingredients: ingredientsArray,
      instructions: instructionsArray,
      imageUrl: imageUrl,
      cookingTime,
      author: authorId,
    });

    const savedRecipe = await newRecipe.save();

    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ message: "Server error while creating recipe." });
  }
});
//& Review API
app.post("/api/recipes/:id/reviews", authMiddleware, async (req, res) => {
  try {
    //* Get all the necessary IDs and data
    const recipeId = req.params.id;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    //* Validate input
    if (!rating) {
      return res.status(400).json({ message: "Rating is a required field." });
    }

    //* Check if the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    //* Create a new review
    const newReview = new Review({
      rating: rating,
      comment: comment,
      user: userId,
      recipe: recipeId,
    });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error while creating review." });
  }
});
//^-----------------------------------------------------------------------------------GET REQUESTS-----------------------------------------------------------------------------------
//& ALL Recipes API >> Updated with the search
app.get("/api/recipes", async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { ingredients: { $regex: req.query.search, $options: "i" } }];
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).populate("author", "username");

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Error fetching recipes" });
  }
});
//& Get a single Recipe
app.get("/api/recipes/:id", async (req, res) => {
  try {
    //* get the id
    const recipeId = req.params.id;
    //* Find the recipe in the database
    const recipe = await Recipe.findById(recipeId).populate("author", "username");
    //* Check if a recipe was found
    if (recipe) {
      res.status(200).json(recipe);
    } else {
      res.status(404).json({ message: "Recipe not found." });
    }
  } catch (error) {
    console.error("Error fetching single recipe:", error);
    res.status(500).json({ message: "Server error while fetching recipe." });
  }
});
//& Get all reviews for a single recipe
app.get("/api/recipes/:id/reviews", async (req, res) => {
  try {
    const recipeId = req.params.id;

    const reviews = await Review.find({ recipe: recipeId }).sort({ createdAt: -1 }).populate("user", "username");

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
});
//& Get a single user
app.get("/api/users/:username/recipes", async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipes = await Recipe.find({ author: user._id }).sort({ createdAt: -1 }).populate("author", "username");

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching user's recipes:", error);
    res.status(500).json({ message: "Server error while fetching recipes." });
  }
});
//^-----------------------------------------------------------------------------------PUT REQUESTS-----------------------------------------------------------------------------------
//& Update a recipe
app.put("/api/recipes/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, ingredients, instructions, cookingTime } = req.body;

    const recipeId = req.params.id;
    const userId = req.user.userId;

    const recipeToUpdate = await Recipe.findById(recipeId);

    if (!recipeToUpdate) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipeToUpdate.author.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this recipe." });
    }
    recipeToUpdate.name = name;
    recipeToUpdate.description = description;
    recipeToUpdate.ingredients = ingredients;
    recipeToUpdate.instructions = instructions;
    recipeToUpdate.cookingTime = cookingTime;

    const updatedRecipe = await recipeToUpdate.save();

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error Updating recipe:", error);
    res.status(500).json({ message: "Server error while updating recipe." });
  }
});
//^-----------------------------------------------------------------------------------Delete REQUESTS-----------------------------------------------------------------------------------
//& Delete a recipe
app.delete("/api/recipes/:id", authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    if (recipe.author.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this recipe." });
    }
    await Recipe.findByIdAndDelete(recipeId);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Server error while deleting recipe." });
  }
});

//! DataBase
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:", err);
    process.exit(1);
  });
