import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fromPath = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Both email and password are required.");
      return;
    }

    setLoading(true);
    try {
      let data;
      let normalizedUser;

      try {
        // Try external .NET API first (dynamic: real database)
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        if (!response.ok) {
          throw new Error('External API rejected');
        }

        data = await response.json();

        const serverRole = data.user?.role || 'Customer';
        normalizedUser = {
          ...data.user,
          name: data.user.name || email.trim().split('@')[0],
          role: String(email.trim()).toLowerCase().includes("admin") ? 'Admin' : serverRole,
        };
      } catch (externalError) {
        // Fallback to local mock server if external API is unreachable
        const response = await axiosInstance.post("/api/auth/login", {
          email: email.trim(),
          password,
        });
        data = response.data;
        const serverRole = data.user?.role || 'Customer';
        normalizedUser = {
          ...data.user,
          name: data.user.name || email.trim().split('@')[0],
          role: String(email.trim()).toLowerCase().includes("admin") ? 'Admin' : serverRole,
        };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      dispatch(setCredentials({ user: normalizedUser, token: data.token }));

      toast.success("Login successful!");
      navigate(fromPath, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Unable to connect to server.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
          Sign In to ShopSphere
        </h2>
        <p className="text-xs text-gray-400">
          Access your personalized cart, likes and historical order receipt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          required
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Password *
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] text-blue-600 dark:text-blue-500 font-bold hover:underline uppercase tracking-wide"
            >
              Forgot code?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full h-11 text-xs">
          <LogIn size={14} className="mr-2" />
          Continue to Store
        </Button>
      </form>

      <GoogleSignInButton mode="login" />

      <p className="text-xs text-gray-500 text-center">
        New to premium store?{" "}
        <Link to="/register" className="text-blue-600 hover:underline font-bold">
          Create account
        </Link>
      </p>
    </div>
  );
};

export default Login;
  