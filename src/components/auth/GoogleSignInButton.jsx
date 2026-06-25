import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

// Suppress Google Identity Services internal diagnostic noise
['log','warn','error'].forEach(m => {
  const orig = console[m];
  console[m] = (...args) => {
    if (typeof args[0] === "string" && (args[0].includes("[GSI_LOGGER]") || args[0].includes("Cross-Origin-Opener-Policy"))) return;
    if (typeof args[0] === "string" && args[0].includes("Provided button width is invalid")) return;
    orig(...args);
  };
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleSignInButton = ({ mode = "login", disabled = false, formData = {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/";

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post("/api/auth/google", {
        credential: credentialResponse.credential,
        mode,
        ...(mode === "signup" && Object.values(formData).some(v => v) ? { formData } : {}),
      });
      const data = res.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(mode === "login" ? "Signed in with Google!" : "Account created with Google!");
      navigate(fromPath, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Google authentication failed");
    }
  };

  const label = mode === "login" ? "Sign in with Google" : "Sign up with Google";

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-3 my-3">
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">or continue with</span>
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {GOOGLE_CLIENT_ID ? (
        disabled && mode === "signup" ? (
          <button
            onClick={() => toast.error("Please fill in all fields before signing up with Google.")}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-sm font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed transition-all"
          >
            <GoogleIcon />
            <span>{label}</span>
          </button>
        ) : (
          <div className="w-full [&>div]:!w-full">
            <GoogleLogin
              theme="outline"
              size="large"
              text={mode === "login" ? "signin_with" : "signup_with"}
              shape="rectangular"
              logo_alignment="left"
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed. Please try again.")}
            />
          </div>
        )
      ) : (
        <button
          onClick={() => toast.error("Set VITE_GOOGLE_CLIENT_ID in .env to enable Google Sign-In")}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
        >
          <GoogleIcon />
          <span>{label}</span>
        </button>
      )}
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" fill="#4285F4"/>
    <path d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.4 5.4 0 0 1-8.08-2.84H.96v2.34A9 9 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.96 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3-2.34z" fill="#FBBC05"/>
    <path d="M9 3.6a4.9 4.9 0 0 1 3.46 1.36l2.6-2.6A8.7 8.7 0 0 0 9 0a9 9 0 0 0-8.04 4.94l3 2.34A5.36 5.36 0 0 1 9 3.6z" fill="#EA4335"/>
  </svg>
);
