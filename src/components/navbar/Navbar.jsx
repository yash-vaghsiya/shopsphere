import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, Moon, Sun, Menu, X, Search, User, LogOut, 
  LayoutDashboard, Bell, Volume2, Award, CheckCircle, ShieldAlert,
  ChevronDown, Globe, ClipboardList, Check, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useTheme } from "../../hooks/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { SUPPORTED_CURRENCIES, setCurrency } from "../../features/currency/currencySlice";


const CURRENCY_DETAILS = {
  INR: { name: "Indian Rupee", nativeName: "रुपया" },
  USD: { name: "US Dollar", nativeName: "Dollar" },
  EUR: { name: "Euro", nativeName: "Euro" },
  GBP: { name: "British Pound", nativeName: "Pound" },
  JPY: { name: "Japanese Yen", nativeName: "円" },
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentCurrency = useSelector((state) => state.currency.current);

  // Popover refs and states
  const [showBroadcasts, setShowBroadcasts] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const broadcastPopoverRef = useRef(null);
  const currencyPopoverRef = useRef(null);
  const profilePopoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        broadcastPopoverRef.current &&
        !broadcastPopoverRef.current.contains(target)
      ) {
        setShowBroadcasts(false);
      }
      if (
        currencyPopoverRef.current &&
        !currencyPopoverRef.current.contains(target)
      ) {
        setShowCurrency(false);
      }
      if (
        profilePopoverRef.current &&
        !profilePopoverRef.current.contains(target)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // BROADCAST NOTIFICATION STATES
  const [broadcasts, setBroadcasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  
  const fetchNavbarBroadcasts = async () => {
    try {
      const res = await fetch("/api/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data);

        // Compute unread alert count from cached localStorage IDs
        let seenIds = [];
        try {
          const stored = localStorage.getItem("shop_seen_broadcasts");
          seenIds = stored ? JSON.parse(stored) : [];
        } catch (e) {}

        const unread = data.filter((b) => !seenIds.includes(b.id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn("Could not synchronize header announcements:", err);
    }
  };

  useEffect(() => {
    fetchNavbarBroadcasts();
    const interval = setInterval(fetchNavbarBroadcasts, 7000); // Poll every 7 seconds
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    try {
      const seenIds = broadcasts.map((b) => b.id);
      localStorage.setItem("shop_seen_broadcasts", JSON.stringify(seenIds));
      setUnreadCount(0);
      toastNavbarFeedback();
    } catch (e) {}
  };

  const toastNavbarFeedback = () => {
    toast.success("All broadcasts marked");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-150 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 max-w-full gap-4">
          
          {/* Logo Brand & Desktop Nav Links Section */}
          <div className="flex items-center gap-6 xl:gap-10 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl lg:text-2xl font-black tracking-tight text-blue-600">
                ShopSphere<span className="text-gray-400">.</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  state={link.state}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors hover:text-blue-600 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-500 font-bold"
                        : "text-gray-600 dark:text-gray-300"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Centered Desktop Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-xs xl:max-w-md mx-6"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl py-1.5 pl-3.5 pr-8 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white dark:focus:bg-gray-950 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-750 dark:hover:text-gray-250 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer transition-colors duration-200"
            >
              <Search size={14} />
            </button>
          </form>

          {/* Action Links & Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 shrink-0">
            
            {/* Wishlist Icon link */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors relative flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900"
              title="My Wishlist"
            >
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white dark:border-gray-900 animate-pulse shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* UNIVERSAL BROADCASTS POP-OVER BELL */}
            <div className="relative" id="navbar-broadcasts-popover" ref={broadcastPopoverRef}>
              <button
                onClick={() => {
                  setShowBroadcasts(!showBroadcasts);
                  if (!showBroadcasts) {
                    fetchNavbarBroadcasts();
                  }
                }}
                type="button"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative bg-transparent border-0 cursor-pointer outline-none flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900"
                title="Notifications bulletin"
              >
                <Bell size={18} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping pr-0" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white dark:border-gray-900 shadow-sm leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showBroadcasts && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden" 
                    id="notification-bell-dropdown"
                  >
                    <div className="p-3.5 bg-gray-55/65 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-850/80 flex items-center justify-between">
                      <span className="font-extrabold text-[10px] text-gray-950 dark:text-gray-100 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={11} className="text-blue-500 animate-pulse" /> Announcements
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          type="button"
                          className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-extrabold border-0 bg-transparent cursor-pointer outline-none"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-850/60">
                      {broadcasts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <span className="text-xl block mb-1">📯</span>
                          <p className="font-bold text-[11px] text-gray-400">No active announcements</p>
                        </div>
                      ) : (
                        broadcasts.map((b) => {
                          let icon = <Volume2 size={13} className="text-blue-500" />;
                          if (b.type === "success") icon = <CheckCircle size={13} className="text-emerald-500" />;
                          if (b.type === "warning") icon = <ShieldAlert size={13} className="text-amber-500" />;
                          if (b.type === "offer") icon = <Award size={13} className="text-purple-500" />;

                          return (
                            <div key={b.id} className="p-3.5 hover:bg-gray-50 dark:hover:bg-slate-850/40 flex gap-3 items-start transition-colors">
                              <div className="p-1.5 bg-gray-100 dark:bg-slate-950 rounded-lg shrink-0">
                                {icon}
                              </div>
                              <div className="space-y-0.5 min-w-0 flex-1 leading-normal text-left">
                                <h5 className="font-black text-gray-900 dark:text-white text-xs tracking-tight truncate leading-none">
                                  {b.title}
                                </h5>
                                <p className="text-[10px] text-gray-400 dark:text-gray-400 font-semibold leading-relaxed line-clamp-3">
                                  {b.message}
                                </p>
                                <span className="text-[8px] text-gray-400 dark:text-gray-500 font-bold block pt-0.5 uppercase tracking-wider">
                                    {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Cart Icon link */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative flex items-center justify-center rounded-xl hover:bg-gray-55 dark:hover:bg-gray-900"
              title="Shopping Bag"
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white dark:border-gray-900 animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-amber-400 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer border-0 bg-transparent flex items-center justify-center"
              title="Toggle theme appearance"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Dynamic Multi-Currency Custom Dropdown */}
            <div className="relative select-none" ref={currencyPopoverRef}>
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                type="button"
                className="flex items-center gap-1.5 bg-gray-55 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 focus:outline-none cursor-pointer outline-none transition-all group pr-2.5"
                title="Select store currency"
              >
                <Globe size={13} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-extrabold uppercase shrink-0 text-[10px] tracking-wider">
                  {SUPPORTED_CURRENCIES[currentCurrency]?.symbol} {currentCurrency}
                </span>
                <ChevronDown size={11} className={`text-gray-400 transition-transform duration-200 ${showCurrency ? "rotate-180 text-blue-500" : ""}`} />
              </button>

              <AnimatePresence>
                {showCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-900 pb-2 border-b border-gray-100 dark:border-gray-850">
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest block text-left">
                        Select Core Currency
                      </span>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
                        const isSelected = curr.code === currentCurrency;
                        const details = CURRENCY_DETAILS[curr.code] || { name: curr.code, nativeName: "" };
                        return (
                          <button
                            key={curr.code}
                            onClick={() => {
                              dispatch(setCurrency(curr.code));
                              setShowCurrency(false);
                            }}
                            type="button"
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left border-0 cursor-pointer outline-none transition-all ${
                              isSelected
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-50 dark:hover:bg-gray-905 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                isSelected
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400"
                              }`}>
                                {curr.symbol}
                              </span>
                              <div className="min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[12px]">{curr.code}</span>
                                  {details.nativeName && (
                                    <span className="text-[11px] text-gray-400">({details.nativeName})</span>
                                  )}
                                </div>
                                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold block truncate max-w-[130px]">
                                  {details.name}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom User Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 select-none" ref={profilePopoverRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  type="button"
                  className="flex items-center gap-2 group hover:text-blue-600 text-gray-700 dark:text-gray-300 bg-transparent border-0 cursor-pointer outline-none select-none pl-1"
                  title="My Account Dashboard"
                >
                  <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[11px] font-black shadow-sm ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all shrink-0">
                    {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "ME"}
                  </div>
                  <div className="flex flex-col items-start text-left leading-tight shrink-0 max-w-[90px]">
                    <span className="text-[11px] font-black truncate w-full group-hover:text-blue-500 transition-colors">
                      {user?.name}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 block truncate leading-none uppercase hidden sm:block">
                      {user?.role === "Admin" ? "Store Admin" : "Buyer Hub"}
                    </span>
                  </div>
                  <ChevronDown size={11} className={`hidden lg:block text-gray-400 transition-transform duration-200 ${showProfile ? "rotate-180 text-blue-500" : ""}`} />
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      {/* Dropdown Header User Info */}
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-850">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-9 h-9 rounded-full bg-blue-550 bg-blue-650 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-inner">
                            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "ME"}
                          </div>
                          <div className="min-w-0 flex-1 leading-normal">
                            <h5 className="font-black text-gray-900 dark:text-white text-xs truncate">
                              {user?.name}
                            </h5>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold truncate">
                              {user?.email}
                            </p>
                            <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg mt-1 tracking-wider">
                              {user?.role === "Admin" ? "Administrator" : "Verified Buyer"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu links list */}
                      <div className="p-1.5 space-y-0.5 text-left">
                        {user?.role === "Admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfile(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
                          >
                            <LayoutDashboard size={14} className="text-gray-400 shrink-0" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
                        >
                          <User size={14} className="text-gray-400 shrink-0" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
                        >
                          <ClipboardList size={14} className="text-gray-400 shrink-0" />
                          <span>Order Receipts</span>
                        </Link>
                      </div>

                      {/* Dropdown Footer Actions */}
                      <div className="p-1 border-t border-gray-100 dark:border-gray-850 bg-gray-50/20 dark:bg-gray-900/10">
                        <button
                          onClick={() => {
                            setShowProfile(false);
                            logout();
                          }}
                          type="button"
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left border-0 outline-none cursor-pointer bg-transparent"
                        >
                          <LogOut size={14} className="shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="border-l border-gray-200 dark:border-gray-800 pl-4 shrink-0">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-all hover:scale-103"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu toggle Button & Quick Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden shrink-0 select-none">
            
            {/* Quick Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-650 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-amber-400 transition-all rounded-xl cursor-pointer border-0 bg-transparent flex items-center justify-center active:scale-90"
              title="Toggle theme appearance"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Quick Mobile Search Toggle Button */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isOpen) setIsOpen(false); // Close mobile drawer if search is opened
              }}
              className={`p-2 transition-all rounded-xl cursor-pointer border-0 bg-transparent flex items-center justify-center active:scale-90 ${
                isMobileSearchOpen ? "text-blue-600 bg-blue-50/55 dark:bg-blue-950/30" : "text-gray-650 dark:text-gray-300 hover:text-blue-600"
              }`}
              title="Search products..."
            >
              <Search size={18} />
            </button>

            {/* Quick Mobile Wishlist link */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-650 dark:text-gray-300 hover:text-red-500 transition-colors relative flex items-center justify-center rounded-xl active:bg-gray-50 dark:active:bg-gray-900"
              title="My Wishlist"
            >
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-white dark:border-gray-950 shadow-sm leading-none">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Quick Mobile Cart Link */}
            <Link
              to="/cart"
              className="p-2 text-gray-650 dark:text-gray-300 hover:text-blue-600 transition-colors relative flex items-center justify-center rounded-xl active:bg-gray-55 dark:active:bg-gray-900"
              title="Shopping Bag"
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-white dark:border-gray-950 shadow-sm animate-bounce leading-none">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                if (isMobileSearchOpen) setIsMobileSearchOpen(false); // Close search if drawer is opened
              }}
              className="p-2 text-gray-650 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors outline-none cursor-pointer border-0 bg-transparent flex items-center justify-center"
              title="Toggle Navigation Menu"
            >
              {isOpen ? <X size={20} className="text-blue-600" /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sliding Search Bar */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-950 px-4 py-3 shadow-inner"
          >
            <form onSubmit={handleSearchSubmit} className="relative select-none max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2 pl-3.5 pr-9 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/60 outline-none transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-750 dark:hover:text-gray-250 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer transition-colors duration-200"
              >
                <Search size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden border-t border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-950 px-4 py-4 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto"
          >
            {/* Mobile search bar */}
            <form onSubmit={handleSearchSubmit} className="relative select-none">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-3.5 pr-9 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/60 outline-none transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-750 dark:hover:text-gray-250 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer transition-colors duration-200"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Navigation link stacks */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  state={link.state}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 font-bold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile Currency switches - beautiful buttons grid */}
            <div className="space-y-2.5 px-3 py-3 bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-850/65 select-none">
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block text-left">
                Market Currency
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
                  const isSelected = curr.code === currentCurrency;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => dispatch(setCurrency(curr.code))}
                      type="button"
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer outline-none ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white dark:bg-gray-950 border-gray-150 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xs font-black">{curr.symbol}</span>
                      <span className="text-[9px] font-bold uppercase">{curr.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick status alerts trigger accordion */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-850 pt-4 px-1.5 select-none">
              <button
                onClick={() => {
                  setShowBroadcasts(!showBroadcasts);
                  if (!showBroadcasts && unreadCount > 0) {
                    const seenIds = broadcasts.map((b) => b.id);
                    localStorage.setItem("shop_seen_broadcasts", JSON.stringify(seenIds));
                    setUnreadCount(0);
                  }
                }}
                type="button"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-650 bg-transparent border-0 cursor-pointer outline-none relative"
                title="View newsletters & sales alert"
              >
                <Bell size={16} />
                <span className="text-xs font-bold leading-none">
                  Notifications & Bulletins ({broadcasts.length})
                </span>
                {unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse block shrink-0" />
                )}
              </button>

              <button
                onClick={toggleTheme}
                type="button"
                className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                {theme === "light" ? (
                  <>
                    <Moon size={13} /> Appearance: Dark
                  </>
                ) : (
                  <>
                    <Sun size={13} /> Appearance: Light
                  </>
                )}
              </button>
            </div>

            {/* Mobile Broadcast Bulletins List expanded accordion */}
            {showBroadcasts && broadcasts.length > 0 && (
              <div className="bg-gray-50/60 dark:bg-slate-900/40 rounded-2xl p-3.5 space-y-2.5 border border-gray-100 dark:border-slate-800 text-left select-none animate-fade-in max-h-48 overflow-y-auto">
                <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block border-b border-gray-100 pb-1.5">
                  Store Bulletin Feed
                </span>
                {broadcasts.map((b) => (
                  <div key={b.id} className="text-[11px] space-y-1 pb-2 last:pb-0 border-b last:border-b-0 border-gray-100/50 dark:border-slate-850/30">
                    <div className="flex items-center gap-1.5 font-extrabold text-gray-950 dark:text-white leading-tight">
                      <span className="text-blue-500">•</span>
                      <span>{b.title}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 leading-normal font-semibold pl-2.5">
                      {b.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* User controls mobile card */}
            <div className="border-t border-gray-150 dark:border-gray-850 pt-4">
              {isAuthenticated ? (
                <div className="bg-gray-50/70 dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-850 space-y-3.5 select-none">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-inner shrink-0">
                      {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "ME"}
                    </div>
                    <div className="min-w-0 flex-1 leading-normal">
                      <h5 className="font-extrabold text-gray-950 dark:text-white text-xs truncate">
                        {user?.name}
                      </h5>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                        {user?.role === "Admin" ? "Administrator Hub" : "Verified Customer"}
                      </span>
                    </div>
                    {user?.role === "Admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                      >
                        Admin
                      </Link>
                    )}
                  </div>

                   <div className="grid grid-cols-2 gap-2 text-center border-t border-gray-100 dark:border-gray-800 pt-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      type="button"
                      className="col-span-2 bg-red-500/10 hover:bg-red-500/20 py-2.5 rounded-xl text-xs font-black text-red-600 transition-all cursor-pointer border-0"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-4 py-3 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-sm transition-all"
                >
                  Sign In to ShopSphere
                </Link>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;