import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { toast } from "react-hot-toast";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pwd.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (pwd !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset compile completed! Please Sign In with your new credentials.");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <ShieldAlert className="text-blue-500 animate-pulse" size={20} />
          Reset Your Password
        </h2>
        <p className="text-xs text-gray-400">
          Input your new password below to update secure store parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            New Password *
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-955 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Confirm New Password *
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-955 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full py-3.5">
          <RefreshCw size={14} className="mr-2" />
          Update Password
        </Button>
      </form>

    </div>
  );
};

export default ResetPassword;
