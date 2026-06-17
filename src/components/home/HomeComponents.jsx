import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Heart, Flame, ShieldAlert, Award, Copy, Check, Tag } from "lucide-react";

// CATEGORIES SECTION
export const CategorySection = () => {
  const categories = [
    { name: "Electronics", desc: "Premium Gadgets & Devices", icon: "📱", color: "from-blue-500/10 to-blue-600/10 text-blue-600" },
    { name: "Fashion", desc: "Designer Clothing & Apparel", icon: "👔", color: "from-pink-500/10 to-pink-600/10 text-pink-600" },
    { name: "Shoes", desc: "Athletic & Designer Footwear", icon: "👟", color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600" },
    { name: "Watches", desc: "Chronographs & Smart Wear", icon: "⌚", color: "from-amber-500/10 to-amber-600/10 text-amber-600" },
    { name: "Gaming", desc: "High Refresh Gear & Consoles", icon: "🎮", color: "from-purple-500/10 to-purple-600/10 text-purple-600" },
    { name: "Accessories", desc: "Curated Bags & Everyday Essentials", icon: "👜", color: "from-teal-500/10 to-teal-600/10 text-teal-600" },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Shop By Category
          </h2>
          <div className="w-12 h-1.5 bg-blue-600 rounded-full mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-150 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cat.desc}
                </p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${cat.color} text-2xl group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// PROMO BANNER SECTION
export const OfferBanner = () => {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          setCoupons(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load discount coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  const activeCoupons = coupons.filter(c => {
    if (!c.isActive) return false;
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) return false;
    return true;
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <section className="py-12 bg-gray-55 dark:bg-gray-955 transition-colors" id="offer-banner-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 py-12 px-6 md:p-16 shadow-2xl flex flex-col gap-10 border border-white/10">
          
          {/* Ambient Glowing Background Orb */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-550/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Row: Title & Action */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10 w-full">
            <div className="space-y-4 max-w-2xl text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                <Flame size={12} className="animate-pulse text-amber-400" />
                Storewide Promotion Active
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                Active Promo Offers
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unlock extraordinary savings across our luxury catalog! Copy any verified coupon code below and apply it inside your cart or bag for an instant discount.
              </p>
            </div>
            <div className="shrink-0 text-left">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-100 dark:bg-white dark:hover:bg-slate-100 text-indigo-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all select-none whitespace-nowrap active:scale-95"
              >
                Go to Shop Catalog
                <ArrowRight size={13} className="ml-2" />
              </Link>
            </div>
          </div>

          {/* Grid Area: Shows 3 Coupon Vouchers per Row */}
          <div className="w-full relative z-10">
            {activeCoupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    id={`home-coupon-card-${coupon.code.toLowerCase()}`}
                    className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300 shadow-md group hover:-translate-y-1"
                  >
                    {/* Interactive Ticket Notch Left */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-950 rounded-full border-r border-white/10 hidden sm:block" />
                    
                    {/* Interactive Ticket Notch Right */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-950 rounded-full border-l border-white/10 hidden sm:block" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Tag size={13} className="text-emerald-400 shrink-0" />
                          <span className="font-mono text-xs font-black text-white tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                            {coupon.code}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[8px] font-black text-[#10b981] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                          Verified
                        </span>
                      </div>
                      
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {coupon.discountType === "percentage" ? (
                          <span className="text-amber-400">{coupon.discountValue}% OFF</span>
                        ) : (
                          <span className="text-amber-400">₹{coupon.discountValue} OFF</span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-300 font-semibold leading-relaxed line-clamp-2">
                        {coupon.description || "Unlock special storewide savings on your order tonight!"}
                      </p>

                      {coupon.minCartAmount ? (
                        <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[9px] text-[#2ebd85] font-black uppercase tracking-wider">
                          <span>Min Spend Trigger</span>
                          <span>₹{coupon.minCartAmount}</span>
                        </div>
                      ) : (
                        <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>Trigger Limits</span>
                          <span>No Limit</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      type="button"
                      id={`copy-home-coupon-${coupon.code.toLowerCase()}`}
                      className="mt-5 flex items-center justify-center gap-1.5 w-full py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all border-0 cursor-pointer shadow-md select-none hover:scale-[1.02] active:scale-95 duration-200"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={12} className="text-emerald-600 animate-bounce" />
                          <span className="text-emerald-600 font-extrabold">Copied Code</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Grab Promo Discount</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white space-y-3 backdrop-blur-sm">
                <span className="text-3xl block">⏳</span>
                <p className="text-xs text-blue-300 font-extrabold uppercase tracking-wider">Dynamic Vouchers Loading</p>
                <p className="text-[11px] text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Our live store campaigns and discount events are loading. Check back soon for exclusive vouchers!
                </p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
};

// TESTIMONIALS SECTION
export const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Ayesha Patel",
      role: "Verified Shopper",
      stars: 5,
      text: "The delivery arrived in pristine packaging. Getting true customer profile panels and state synced is a game-changer! Absolute luxury service, thank you ShopSphere.",
    },
    {
      id: 2,
      name: "Rohan Singh",
      role: "Frequent Buyer",
      stars: 5,
      text: "Sleek dark mode interfaces and flawless cart responsiveness! I managed my checkouts with total security and zero lag. Unquestionably premium design.",
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Tech Enthusiast",
      stars: 4,
      text: "The high-fidelity product imagery is incredibly realistic! I could examine my devices in ultra high definition before buying them. A perfect full-stack online product experience.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50/50 dark:bg-gray-950/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Loved By Shoppers
          </h2>
          <div className="w-12 h-1.5 bg-blue-600 rounded-full mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center text-yellow-500 gap-0.5">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "{rev.text}"
                </p>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-850 pt-4 mt-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {rev.name}
                </h4>
                <p className="text-xs text-gray-400 font-medium">
                  {rev.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// BRANDS SECTION
export const BrandsSection = () => {
  const brands = ["Apple", "Samsung", "Nike", "Sony", "Adidas", "Puma"];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-2">
            Trusted Partners
          </h2>
          <h3 className="text-base font-bold text-gray-600 dark:text-gray-300">
            Official Brand Distribution
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
          {brands.map((brand) => (
            <div
              key={brand}
              className="p-6 text-center text-base font-black tracking-widest uppercase text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border border-gray-150 dark:border-gray-850 select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
