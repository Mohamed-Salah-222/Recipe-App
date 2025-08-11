import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleAuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("=== FRONTEND CALLBACK DEBUG ===");
    console.log("Full URL:", window.location.href);
    console.log("Search params:", window.location.search);
    console.log("All search params:", Object.fromEntries(searchParams));

    const token = searchParams.get("token");
    console.log("Token found:", token);
    console.log("Token length:", token?.length);
    console.log("===========================");

    if (token) {
      console.log("Token found, logging in and redirecting...");

      try {
        login(token);
        console.log("Login successful, navigating to home");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Login error:", error);
        navigate("/login", { replace: true });
      }
    } else {
      console.error("No token found in URL, redirecting to login.");
      console.error("Available params:", Array.from(searchParams.keys()));
      navigate("/login", { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Finalizing your login...</p>
        <p className="text-sm text-gray-500 mt-2">URL: {window.location.href}</p>
      </div>
    </div>
  );
}

export default GoogleAuthCallbackPage;
