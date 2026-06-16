import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navbar } from "../components/navbar/Navbar";
import { Footer } from "../components/footer/Footer";
import { BackToTop } from "../components/common/BackToTop";
import { motion, AnimatePresence } from "motion/react";

export const MainLayout = () => {
  // Subscribing to currency state so any updates globally re-render the storefront pages
  const currentCurrency = useSelector((state) => state.currency.current);
  const location = useLocation();

  return (
    <div key={currentCurrency} className="min-h-screen flex flex-col bg-white dark:bg-gray-955 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 flex flex-col w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default MainLayout;
