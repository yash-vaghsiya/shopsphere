import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      
      {/* Return to Store Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Back To Store
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-block text-2xl font-black text-blue-600">
          ShopSphere<span className="text-gray-400">.</span>
        </Link>
        <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
          Authorized Secure Entry
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 sm:px-10 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-6 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
