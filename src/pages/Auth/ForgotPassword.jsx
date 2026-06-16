import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Key } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { toast } from "react-hot-toast";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please provide your registered account email.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setComplete(true);
      toast.success("Security token sent to email address!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <Key className="text-blue-500 animate-spin" size={20} />
          Recover Security Code
        </h2>
        <p className="text-xs text-gray-400">
          Enter your registered email and we'll transmit a secure reset link.
        </p>
      </div>

      {complete ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 text-center space-y-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-450 font-semibold leading-relaxed">
            A temporary password recovery link was dispatched to <strong>{email}</strong>. Check your mail inbox to finalize updates.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-md select-none transition-colors"
          >
            Return To Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@gmail.com"
            required
          />

          <Button type="submit" loading={loading} className="w-full py-3.5">
            Send Secure Pin
          </Button>
        </form>
      )}

      {/* Back button */}
      <div className="text-center pt-2">
        <Link
          to="/login"
          className="text-xs text-gray-400 hover:text-gray-900 inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft size={12} />
          Back To Login
        </Link>
      </div>

    </div>
  );
};

export default ForgotPassword;
