import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) return;

    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/api/newsletter/subscribe", { email: targetEmail });
      setEmail("");
      setSubscribed(true);
      toast.success(response.data?.message || "Subscribed successfully!");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register subscription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 transition-all pt-12 md:pt-16 pb-8">
      
      {/* Advantage Features Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-gray-800 rounded-xl text-blue-500">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Free Shipping</h4>
            <p className="text-xs text-gray-400 mt-1">On all orders above ₹4,999</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-gray-800 rounded-xl text-blue-500">
            <RotateCcw size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">30 Days Return</h4>
            <p className="text-xs text-gray-400 mt-1">Easy return, exchange or refund</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-gray-800 rounded-xl text-blue-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">Secure Payments</h4>
            <p className="text-xs text-gray-400 mt-1">PCI-DSS encrypted gateways</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="md:col-span-1.5 space-y-4">
          <h3 className="text-xl font-black text-white tracking-tight">
            ShopSphere<span className="text-blue-500">.</span>
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            Discover a handpicked collection of luxury gadgets, premium electronics, fashion statements, and refined accessories, delivered directly with ultimate care.
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home Page</Link>
            </li>
            <li>
              <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Shop Catalog</Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">Our Story</Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Get In Touch</Link>
            </li>
          </ul>
        </div>

        {/* Customer Support Column */}
        <div>
          <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">Customer Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">My Profile</Link>
            </li>
            <li>
              <Link to="/cart" state={{ activeTab: "track" }} className="text-gray-400 hover:text-white transition-colors">Track Orders</Link>
            </li>
            <li>
              <Link to="/wishlist" className="text-gray-400 hover:text-white transition-colors">Wishlists</Link>
            </li>
            <li>
              <Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Shopping Cart</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Get exclusive notifications on weekly new arrivals, hot discounts, and product launches.
          </p>
          <form onSubmit={handleSubscribe} className="relative w-full">
            <input
              type="email"
              required
              disabled={submitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email..."
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="absolute right-2.5 top-2.5 text-blue-500 hover:text-blue-400 disabled:opacity-40 transition-opacity cursor-pointer border-0 bg-transparent flex items-center justify-center"
              aria-label="Subscribe email"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
          {subscribed && (
            <p className="mt-1.5 text-xs text-emerald-500 font-medium">
              Subscribed successfully! Thank you.
            </p>
          )}
        </div>

      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-8 text-center text-xs text-gray-550 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-medium text-gray-450">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </span>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-gray-800">•</span>
          <a href="#" className="hover:text-white transition-colors">Terms of Usage</a>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
