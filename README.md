# Full-Stack Recipe Sharing Platform

This is a complete, feature-rich recipe sharing platform built from scratch with a modern MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS. The project features a secure RESTful API backend and a dynamic, responsive React frontend.

---

## ✨ Key Features

### Backend (Node.js & Express)

- **Secure User Authentication:** Full user registration and login system using JWTs and `bcrypt` for password hashing.
- **Full CRUD for Recipes:** Authenticated users can create, edit, and delete their own recipes.
- **Image Uploads:** Handles `multipart/form-data` using `multer` to allow users to upload a main photo for their recipe.
- **Review & Rating System:** Logged-in users can post comments and a 1-5 star rating on any recipe.
- **Data Aggregation:** The backend automatically calculates and stores the average rating and total number of reviews for each recipe.
- **User Profiles:** An endpoint to fetch all recipes created by a specific user.

### Frontend (React)

- **Dynamic UI:** A responsive interface built with React and styled with Tailwind CSS.
- **Client-Side Routing:** Seamless navigation between pages using React Router.
- **Global State Management:** Uses React Context to manage the user's authentication status across the entire application.
- **Protected Routes:** Key pages like "Share Recipe" and "Edit Recipe" are only accessible to logged-in users.
- **Full User Flow:** Users can register, log in, create new recipes with image uploads, edit their own recipes, and post reviews with star ratings on others' recipes.
- **Advanced Search:** A live search bar that queries the backend to filter recipes by name or ingredients.

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt.js
- **File Handling:** Multer
- **Tools:** Git, Postman

---

## 🚀 Running the Project Locally

This project contains two separate applications: the `backend` server and the `frontend` client. **You will need to run them in two separate terminals.**

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your MONGODB_URI and JWT_SECRET

# Start the server
node app.js
```
