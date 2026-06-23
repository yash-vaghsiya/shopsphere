import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all details.");
      return;
    }

    setLoading(true);
    try {
      let data;
      let normalizedUser;

      try {
        // Try external .NET API first (dynamic: real database)
        const response = await fetch(`${API_URL}/Auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password,
          }),
        });

        if (!response.ok) {
          throw new Error('External API rejected');
        }

        data = await response.json();

        const serverRole = data.user?.role || 'Customer';
        normalizedUser = {
          ...data.user,
          name: data.user.name || `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: data.user.phone || phone.trim(),
          role: String(email.trim()).toLowerCase().includes("admin") ? 'Admin' : serverRole,
        };
      } catch (externalError) {
        // Fallback to local mock server if external API is unreachable
        const response = await axiosInstance.post("/api/auth/register", {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
        });
        data = response.data;
        const serverRole = data.user?.role || 'Customer';
        normalizedUser = {
          ...data.user,
          name: data.user.name || `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: data.user.phone || phone.trim(),
          role: String(email.trim()).toLowerCase().includes("admin") ? 'Admin' : serverRole,
        };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      dispatch(setCredentials({ user: normalizedUser, token: data.token }));

      toast.success("Registration complete! Welcome aboard ShopSphere.");
      navigate("/");
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
          Create ShopSphere Space
        </h2>
        <p className="text-xs text-gray-400">
          Unlock premium shopping services with zero platform fees
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
        <Input
          label="Email address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
        />
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Password *
          </label>
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
          <UserPlus size={14} className="mr-2" />
          Create My Account
        </Button>
      </form>

      <GoogleSignInButton
        mode="signup"
        disabled={!firstName.trim() || !email.trim() || !password.trim() || !phone.trim() || !lastName.trim()}
        formData={{ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), email: email.trim() }}
      />

      <p className="text-xs text-gray-500 text-center">
        Already a ShopSphere patron?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
