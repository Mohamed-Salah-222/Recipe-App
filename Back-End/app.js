//! Environment variables
require("dotenv").config();
require("./config/passport-setup");

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
const passport = require("passport");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./services/emailServices");

//!  MiddleWare + App + DataBase
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(passport.initialize());

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
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    let user = await User.findOne({ email: email });

    if (user && user.isVerified) {
      return res.status(409).json({ message: "This email is already registered and verified." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user && !user.isVerified) {
      user.password = await bcrypt.hash(password, 10);
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        email,
        username,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error(emailError);
      return res.status(500).json({ message: "User registered, but failed to send verification email. Please try verifying later." });
    }

    res.status(201).json({ message: "Registration successful! Please check your email for a verification code." });
  } catch (error) {
    console.error("Error during registration process:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please register again to get a new code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified successfully! You can now log in." });
  } catch (error) {
    console.error("Error during account verification:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;
    const payload = { email: user.email, id: user._id };

    const token = jwt.sign(payload, resetSecret, { expiresIn: "15m" });

    await sendPasswordResetEmail(user.email, user._id, token);

    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Error in forgot password process:", error);

    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

app.post("/api/auth/reset-password/:userId/:token", async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;

    jwt.verify(token, resetSecret);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired password reset link." });
  }
});

//&--Login API
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password are missing" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
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

    const imageUrl = `/images/${req.file.filename}`;

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { ingredients: { $regex: req.query.search, $options: "i" } }];
    }

    const totalRecipes = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", "username");

    res.status(200).json({
      recipes: recipes,
      currentPage: page,
      totalPages: Math.ceil(totalRecipes / limit),
    });
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

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
app.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), (req, res) => {
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Fixed: Use environment variable instead of hardcoded URL
  res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
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
