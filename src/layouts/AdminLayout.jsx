import React, { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar, Topbar } from "../components/admin/AdminComponents";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";

export const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const currentCurrency = useSelector((state) => state.currency.current);
  const location = useLocation();

  // Route security shield
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div key={currentCurrency} className="flex h-screen bg-gray-55/70 dark:bg-gray-950 overflow-hidden transition-colors">
      
      {/* Admin Sidebar Navigation (responsive drawer overlay on smaller screens) */}
      <Sidebar isOpenMobile={isOpenMobile} onCloseMobile={() => setIsOpenMobile(false)} />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header metadata */}
        <Topbar onToggleMobileSidebar={() => setIsOpenMobile(true)} />

        {/* Scroll child view */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-gray-955 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
