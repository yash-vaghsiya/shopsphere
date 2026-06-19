import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleSignInButton = ({ mode = "login" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/";

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      let data;

      // Dynamic dual-flow: try external .NET API first, fall back to local Express
      try {
        const res = await fetch(API_URL + "/Auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });
        if (!res.ok) throw new Error("External API rejected");
        data = await res.json();
      } catch (externalError) {
        const res = await axiosInstance.post("/api/auth/google", {
          credential: credentialResponse.credential,
        });
        data = res.data;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(
        mode === "login" ? "Signed in with Google!" : "Account created with Google!"
      );
      navigate(fromPath, { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Google authentication failed"
      );
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full">
        <div className="relative flex items-center gap-3 my-3">
          <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">or continue with</span>
          <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 select-none">
          Google Sign-In requires VITE_GOOGLE_CLIENT_ID in .env
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-3 my-3">
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">or continue with</span>
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      <GoogleLogin
        theme="outline"
        size="large"
        text={mode === "login" ? "signin_with" : "signup_with"}
        shape="rectangular"
        width="100%"
        logo_alignment="left"
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
      />
    </div>
  );
};
