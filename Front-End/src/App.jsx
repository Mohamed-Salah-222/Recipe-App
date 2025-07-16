import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import CreateRecipePage from "./components/CreateRecipePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RecipeDetailPage from "./components/RecipeDetailPage";
import EditRecipePage from "./components/EditRecipePage";
import UserProfilePage from "./components/UserProfilePage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import GoogleAuthCallbackPage from "./components/GoogleAuthCallbackPage";

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                RecipeShare
              </Link>
              <div className="hidden md:flex items-baseline space-x-4">
                <Link to="/" className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                {user && (
                  <Link to="/recipes/new" className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    Share Recipe
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to={`/profile/${user.username}`} className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="bg-stone-100 hover:bg-stone-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                  <Link to="/login" className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
          <Route
            path="/recipes/new"
            element={
              <ProtectedRoute>
                <CreateRecipePage />
              </ProtectedRoute>
            }
          />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route
            path="/recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:username" element={<UserProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
