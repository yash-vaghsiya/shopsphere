import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../../features/products/productSlice";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email) headers["X-User-Email"] = user.email;
    if (user.role) headers["X-User-Role"] = user.role;
    if (user.id) headers["X-User-Id"] = String(user.id);
  } catch {}
  return headers;
};

// Discount API helper — route through local server (server proxies to external API)
const discountFetch = async (path, options = {}) => {
  const opts = {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  };
  return fetch(path, opts);
};

import { 
  Tag, 
  Percent, 
  Trash2, 
  Plus, 
  Calendar, 
  ShoppingBag, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Edit2,
  X,
  Sparkles
} from "lucide-react";


export const AdminDiscounts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  // Offers and Coupons status states
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("coupons");

  // New Coupon Form States
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minCartAmount, setMinCartAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleStartEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinCartAmount(coupon.minCartAmount ? coupon.minCartAmount.toString() : "");
    setExpiryDate(coupon.expiryDate || "");
    setDescription(coupon.description || "");
  };

  const handleCancelEditCoupon = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinCartAmount("");
    setExpiryDate("");
    setDescription("");
  };

  // Search & Filter state
  const [couponSearch, setCouponSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  // Product Discount Editor States
  const [editingProduct, setEditingProduct] = useState(null);
  const [promoPrice, setPromoPrice] = useState("");
  const [promoOriginalPrice, setPromoOriginalPrice] = useState("");
  const [updatingDiscountId, setUpdatingDiscountId] = useState(null);

  const normalizeId = (item) => {
    if (item.id != null) return item;
    const idKey = ["_id", "couponId", "discountId", "Id", "ID"].find((k) => item[k] != null);
    if (idKey) item.id = item[idKey];
    return item;
  };

  // Fetch Coupons Database info from both external API and local server
  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const res = await discountFetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data.map(normalizeId) : []);
      } else {
        setCoupons([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error establishing connection with coupon server");
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    dispatch(fetchProductsThunk({}));
  }, [dispatch]);

  // Handle adding or editing coupon promo code
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return toast.error("Coupon code cannot be empty");
    }
    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) {
      return toast.error("Please insert a valid positive discount amount");
    }
    if (discountType === "percentage" && val > 100) {
      return toast.error("Percentage discount cannot exceed 100%");
    }

    try {
      setFormSubmitting(true);
      const payload = {
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue),
        minCartAmount: minCartAmount ? Number(minCartAmount) : 0,
        expiryDate,
        description,
        isActive: editingCoupon ? editingCoupon.isActive : true
      };

      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const res = await discountFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingCoupon) {
          toast.success(`Coupon code ${cleanCode} has been updated successfully!`);
          setEditingCoupon(null);
        } else {
          toast.success(`Coupon code ${cleanCode} has been published live!`);
        }
        setCode("");
        setDiscountValue("");
        setMinCartAmount("");
        setExpiryDate("");
        setDescription("");
        fetchCoupons();
      } else {
        const errData = await res.json();
        toast.error(errData.message || (editingCoupon ? "Failed to update promo code" : "Failed to issue new promo code"));
      }
    } catch (err) {
      toast.error(editingCoupon ? "Failed to connect to backend to update coupon" : "Failed to connect to backend api to append coupon");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle active/inactive state of a promotion
  const handleToggleCoupon = async (coupon) => {
    try {
      const res = await discountFetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (res.ok) {
        toast.success(`Coupon ${coupon.code} updated successfully`);
        fetchCoupons();
      } else {
        toast.error("Failed to toggle coupon status");
      }
    } catch (err) {
      toast.error("Network error modifying coupon status");
    }
  };

  // Delete Promotional Coupon
  const handleDeleteCoupon = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently retire coupon ${name}?`)) return;

    try {
      const res = await discountFetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Coupon ${name} removed from system catalog`);
        fetchCoupons();
      } else {
        toast.error("Could not remove specified coupon code");
      }
    } catch (err) {
      toast.error("Error connecting to remove coupon");
    }
  };

  // Open Product discount editor helper
  const openProductDiscountEditor = (prod) => {
    setEditingProduct(prod);
    setPromoOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : prod.price.toString());
    setPromoPrice(prod.price.toString());
  };

  // Submit Product discounted pricing changes
  const handleSaveProductDiscount = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const origPriceStr = promoOriginalPrice.trim().toUpperCase();
    const priceStr = promoPrice.trim().toUpperCase();

    // Check if user specified NA or 0 or empty for removing the discount/offer
    const isNAOriginal = origPriceStr === "NA" || origPriceStr === "0" || origPriceStr === "";
    const isNAPrice = priceStr === "NA";

    if (isNAOriginal || isNAPrice) {
      try {
        setUpdatingDiscountId(editingProduct.id);
        const standardPrice = editingProduct.originalPrice || editingProduct.price;

        const res = await fetch(`/api/products/${editingProduct.id}/discount`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: standardPrice,
            originalPrice: null,
          })
        });

        if (res.ok) {
          toast.success(`Discount removed. Standard pricing of ${formatCurrency(standardPrice)} restored for ${editingProduct.name}.`);
          setEditingProduct(null);
          dispatch(fetchProductsThunk({}));
        } else {
          toast.error("Failed to update product discount values");
        }
      } catch (err) {
        toast.error("Server connection error when disabling the discount");
      } finally {
        setUpdatingDiscountId(null);
      }
      return;
    }

    const reqOrigPrice = Number(promoOriginalPrice);
    const reqPrice = Number(promoPrice);

    if (isNaN(reqPrice) || reqPrice <= 0) {
      return toast.error("Active price must be a valid positive amount");
    }
    if (reqOrigPrice > 0 && reqPrice >= reqOrigPrice) {
      return toast("Alert: Your discounted price equals or exceeds original price.", { icon: "⚠️" });
    }

    try {
      setUpdatingDiscountId(editingProduct.id);
      const res = await fetch(`/api/products/${editingProduct.id}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: reqPrice,
          originalPrice: reqOrigPrice > 0 ? reqOrigPrice : null
        })
      });

      if (res.ok) {
        toast.success(`Pricing configuration updated for ${editingProduct.name}!`);
        setEditingProduct(null);
        dispatch(fetchProductsThunk({}));
      } else {
        toast.error("Failed to update product discount values");
      }
    } catch (err) {
      toast.error("Server connection err saving product discount");
    } finally {
      setUpdatingDiscountId(null);
    }
  };

  // Reset a product's sale, returning it to standard price
  const handleRemoveProductDiscount = async (prod) => {
    if (!window.confirm(`Clear current discount values for ${prod.name}? This will restore standard pricing.`)) return;

    try {
      setUpdatingDiscountId(prod.id);
      // If it has an originalPrice, that represents standard price. Let's make it the active price, and clear originalPrice.
      const standardPrice = prod.originalPrice || prod.price;

      const res = await fetch(`/api/products/${prod.id}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: standardPrice,
          originalPrice: null,
        })
      });

      if (res.ok) {
        toast.success(`Discount removed and standard pricing restored for ${prod.name}!`);
        dispatch(fetchProductsThunk({}));
      } else {
        toast.error("Could not remove product discount");
      }
    } catch (err) {
      toast.error("Error setting pricing back to normal");
    } finally {
      setUpdatingDiscountId(null);
    }
  };

  // Filter lists based on inputs
  const filteredCoupons = coupons.filter(c => {
    const searchMatch = c.code.toLowerCase().includes(couponSearch.toLowerCase()) || 
                        (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase()));
    return searchMatch;
  });

  const filteredProducts = products.filter(p => {
    if (p.deleted) return false;
    const nameMatch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const catMatch = !productCategoryFilter || p.category === productCategoryFilter;
    return nameMatch && catMatch;
  });

  // Extract distinct categories from products catalog
  const categoriesList = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Helper code to calculate dynamic percentages active
  const getProductDiscountPercent = (orig, current) => {
    if (!orig || current >= orig) return 0;
    return Math.round(((orig - current) / orig) * 100);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Dynamic App Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-850 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-amber-500 animate-pulse" size={26} />
            Promotions & Stores Wide Discounts
          </h1>
          <p className="text-xs text-gray-400">
            Provision custom promo voucher codes, track redemptions, and schedule dynamic seasonal sale offers on items.
          </p>
        </div>

        {/* Dynamic Dual Tab Selector Toggle */}
        <div className="flex bg-gray-105 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1.5 rounded-xl self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeTab === "coupons"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Promo Coupon Codes
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeTab === "products"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Product Sale Campaign
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: COUPON CODES & VOUCHERS */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Add or Edit Promo Coupon Code Form (35% Width) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${editingCoupon ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" : "bg-blue-105 dark:bg-blue-950/40 text-blue-600"}`}>
                    {editingCoupon ? <Edit2 size={16} /> : <Plus size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                      {editingCoupon ? "Edit Promo Code" : "Create New Promo"}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {editingCoupon ? `Adjusting code "${editingCoupon.code}" attributes` : "Mint a new reactive checkout coupon"}
                    </p>
                  </div>
                </div>
                {editingCoupon && (
                  <button
                    type="button"
                    onClick={handleCancelEditCoupon}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors border-0 cursor-pointer text-gray-400 hover:text-gray-600"
                    title="Cancel edit"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-semibold">
                
                {/* PROMO CODE NAME */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Coupon Promo Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. FLASH40"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 pl-8 pr-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors"
                      required
                    />
                    <Tag size={12} className="absolute left-2.5 top-3.5 text-gray-400" />
                  </div>
                </div>

                {/* TYPE SELECTOR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">
                      Value {discountType === "percentage" ? "(%)" : "(₹)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={discountType === "percentage" ? "15" : "300"}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* MIN CART BASKET LEVEL LIMIT */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Minimum Cart Basket limit (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000 (0 for no limit)"
                    value={minCartAmount}
                    onChange={(e) => setMinCartAmount(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-3 focus:outline-none"
                  />
                </div>

                {/* EXPIRATION DATE */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Expiry Date (Optional)</label>
                  <div className="relative font-sans">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-3 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* DESCRIPTION SUMMARY */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Voucher Description</label>
                  <textarea
                    rows={2}
                    placeholder="Writers discount overview notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>

                {/* Submit Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className={`w-full py-3 font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95 border-0 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                      editingCoupon 
                        ? "bg-amber-600 hover:bg-amber-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {formSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={13} />
                        {editingCoupon ? "Save Coupon Changes" : "Publish Code"}
                      </>
                    )}
                  </button>

                  {editingCoupon && (
                    <button
                      type="button"
                      onClick={handleCancelEditCoupon}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-150 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider border-0 cursor-pointer transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT VIEWBLOCK: Active Coupons Visual Deck Dashboard (65% Width) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-850">
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                    Authorized Checkout Promo Cards
                  </h3>
                  <p className="text-[10px] text-gray-400">Search and configure client-facing redeemable items</p>
                </div>

                {/* Search Coupon Header BAR */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter codes..."
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    className="bg-gray-55 dark:bg-gray-995 border border-gray-150 dark:border-gray-850 rounded-lg py-1.5 pl-7 pr-3 text-xs w-48 outline-none text-gray-900 dark:text-white"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>

              {/* Coupons Loader status */}
              {couponsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Tag className="mx-auto mb-3 opacity-30 animate-bounce" size={32} />
                  <p className="text-sm font-bold">No authorization promo cards match search</p>
                  <p className="text-xs">Publish coupon cards on your left to fill logs</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCoupons.map((c) => {
                    const isExpired = c.expiryDate ? new Date() > new Date(c.expiryDate) : false;
                    return (
                      <div
                        key={c.id}
                        className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                          !c.isActive 
                            ? "bg-gray-55/60 dark:bg-gray-950/20 border-gray-200 dark:border-gray-850 opacity-60" 
                            : isExpired
                            ? "bg-red-50/10 dark:bg-red-950/10 border-red-100 dark:border-red-950/20"
                            : "bg-white dark:bg-gray-900/60 border-gray-150 dark:border-gray-800 shadow-sm hover:border-blue-500/30"
                        }`}
                      >
                        {/* Perforated side scissor ticket border design indicator */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50/50 dark:bg-gray-955 rounded-l-full border-y border-l border-gray-150 dark:border-gray-800" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50/50 dark:bg-gray-955 rounded-r-full border-y border-r border-gray-150 dark:border-gray-800" />

                        {/* Coupon Meta Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1 text-left">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/50 select-text">
                              {c.code}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1.5">{c.description}</p>
                          </div>
                          
                          {/* Badge Tag values */}
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded flex items-center gap-0.5">
                              {c.discountType === "percentage" ? (
                                <Percent size={11} />
                              ) : (
                                "₹"
                              )}
                              {c.discountValue} {c.discountType === "percentage" ? "OFF" : "OFF"}
                            </span>
                            
                            <span className={`text-[9px] font-bold uppercase px-1.5 rounded-full ${
                              isExpired 
                                ? "bg-red-50 text-red-650"
                                : c.isActive 
                                ? "bg-emerald-50 text-emerald-660" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {isExpired ? "Expired" : c.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                        </div>

                        {/* Mid Details */}
                        <div className="border-t border-dashed border-gray-150 dark:border-gray-800 pt-3.5 space-y-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          <div className="flex justify-between items-center">
                            <span>Minimum Cart Levels:</span>
                            <span className="text-gray-800 dark:text-gray-200">
                              {c.minCartAmount ? `₹${c.minCartAmount}` : "No Limit"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Expires On:</span>
                            <span className="text-gray-800 dark:text-gray-200 inline-flex items-center gap-0.5">
                              <Calendar size={10} />
                              {c.expiryDate ? c.expiryDate : "Permanent"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Aggregate Usages:</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold bg-gray-50 dark:bg-gray-850 px-1.5 py-0.5 rounded">
                              {c.usageCount} times redeemed
                            </span>
                          </div>
                        </div>

                        {/* Footer card operation toggles */}
                        <div className="border-t border-gray-100 dark:border-gray-850/60 pt-3.5 mt-3.5 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleCoupon(c)}
                            className="text-[10px] font-bold text-gray-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer border-0 bg-transparent py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-850 rounded"
                          >
                            {c.isActive ? (
                              <>
                                <ToggleRight className="text-emerald-500" size={16} />
                                Active
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={16} />
                                Paused
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditCoupon(c)}
                              className={`p-1.5 rounded transition-colors border-0 cursor-pointer ${
                                editingCoupon?.id === c.id
                                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              }`}
                              title="Edit Coupon Details"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteCoupon(c.id, c.code)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors border-0 cursor-pointer"
                              title="Discard Coupon Code"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: PRODUCT BULK sale PRICING CAMPAIGN */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT LIST: Products pricing table (65% Width) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-150 dark:border-gray-850">
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                    Configure Catalog Promotions
                  </h3>
                  <p className="text-[10px] text-gray-450">Filter product inventories and allocate dynamic campaign pricing</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Category dropdown filters */}
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-gray-55 dark:bg-gray-990 border border-gray-150 dark:border-gray-850 rounded-lg py-1.5 px-3 text-xs outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Search filter input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search specs..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="bg-gray-55 dark:bg-gray-995 border border-gray-150 dark:border-gray-850 rounded-lg py-1.5 pl-7 pr-3 text-xs w-40 outline-none text-gray-900 dark:text-white"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Table rendering list */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="mx-auto mb-3 opacity-30 animate-bounce" size={32} />
                  <p className="text-sm font-bold">No product catalogs match selection criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                        <th className="px-5 py-4">Product Inventory Item</th>
                        <th className="px-5 py-4 text-right">Standard Price</th>
                        <th className="px-5 py-4 text-center">Active Sale Price</th>
                        <th className="px-5 py-4 text-right">Active Offer Card</th>
                        <th className="px-5 py-4 text-center">Campaign Adjuster</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
                      {filteredProducts.map((prod) => {
                        const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
                        const discountPercent = hasDiscount 
                          ? getProductDiscountPercent(prod.originalPrice, prod.price) 
                          : 0;

                        return (
                          <tr key={prod.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/10 transition-colors">
                            <td className="px-5 py-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg border p-0.5 bg-white flex items-center justify-center shrink-0">
                                <img src={prod.image || '/placeholder.svg'} alt="" onError={(e) => { e.target.src = '/placeholder.svg'; }} className="w-full h-full object-contain" />
                              </div>
                              <div className="text-left leading-tight truncate max-w-[170px]">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{prod.name}</h4>
                                <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">{prod.category}</span>
                              </div>
                            </td>

                            <td className="px-5 py-3 text-right">
                              <span className={`font-semibold ${hasDiscount ? "line-through text-gray-400 text-[11px]" : "font-extrabold text-gray-950 dark:text-white"}`}>
                                  {formatCurrency(hasDiscount ? prod.originalPrice : prod.price)}
                              </span>
                            </td>

                            <td className="px-5 py-3 text-center">
                              {hasDiscount ? (
                                <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                                  {formatCurrency(prod.price)}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic font-medium">Standard</span>
                              )}
                            </td>

                            <td className="px-5 py-3 text-right">
                              {hasDiscount ? (
                                <span className="text-red-500 font-extrabold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-0.5">
                                  <TrendingDown size={11} />
                                  {discountPercent}% OFF
                                </span>
                              ) : (
                                <span className="text-gray-400 font-bold bg-gray-55 dark:bg-gray-850 px-1.5 py-0.5 rounded text-[9px]">Regular Value</span>
                              )}
                            </td>

                            <td className="px-5 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openProductDiscountEditor(prod)}
                                  className={`p-1.5 rounded-lg transition-all border-0 cursor-pointer ${
                                    editingProduct?.id === prod.id 
                                      ? "bg-blue-600 text-white" 
                                      : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  }`}
                                  title="Edit Campaign Discount"
                                >
                                  <Edit2 size={13} />
                                </button>
                                
                                {hasDiscount && (
                                  <button
                                    onClick={() => handleRemoveProductDiscount(prod)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded border-0 cursor-pointer"
                                    title="Cancel Promotion Offer"
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT VIEWBLOCK: Active Product Campaign pricing editor (35% Width) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100 dark:border-gray-850">
                <div className="p-2 bg-blue-105 dark:bg-blue-950/40 rounded-lg text-blue-600">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                    Discount Configurator
                  </h3>
                  <p className="text-[10px] text-gray-400">Configure catalog promotional pricing adjustments</p>
                </div>
              </div>

              {editingProduct ? (
                <form onSubmit={handleSaveProductDiscount} className="space-y-5 text-xs font-semibold text-left">
                  <div className="p-3 bg-gray-55 dark:bg-gray-990 rounded-xl space-y-2 flex items-center gap-3 border dark:border-gray-850">
                    <img src={editingProduct.image || '/placeholder.svg'} alt="" onError={(e) => { e.target.src = '/placeholder.svg'; }} className="w-10 h-10 object-contain bg-white rounded border flex-shrink-0" />
                    <div className="leading-tight truncate">
                      <h4 className="font-extrabold text-gray-950 dark:text-white truncate">{editingProduct.name}</h4>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{editingProduct.category}</span>
                    </div>
                  </div>

                  {/* STANDARD PRICE (originalPrice) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Standard Retail List Cost (INR)</label>
                      <span className="text-[10px] text-gray-400 italic">Pre-Sale regular value</span>
                    </div>
                    <input
                      type="text"
                      value={promoOriginalPrice}
                      onChange={(e) => setPromoOriginalPrice(e.target.value)}
                      placeholder="Enter NA or standard value"
                      className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-3 uppercase focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight mt-1">
                      To disable product discount completely, enter <span className="font-bold text-blue-600 dark:text-blue-400">NA</span>, 0, or leave empty.
                    </p>
                  </div>

                  {/* DISCOUNTED PRICE */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Active Sale Campaign Price (INR)</label>
                      <span className="text-[10px] text-red-500 font-black">Campaign Value</span>
                    </div>
                    <input
                      type="text"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value)}
                      placeholder="Enter active campaign price"
                      className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2.5 px-3 focus:outline-none font-bold text-emerald-600 dark:text-emerald-500"
                      required
                    />
                  </div>

                  {/* Instant Dynamic Savings Indicator Calculation Box */}
                  {Number(promoPrice) > 0 && Number(promoOriginalPrice) > Number(promoPrice) ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/30 text-emerald-600 rounded-xl space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle size={12} />
                        Promo Discount Validated
                      </p>
                      <div className="text-[10px] font-semibold text-emerald-555 leading-snug">
                        Customers save{" "}
                        <span className="font-black text-emerald-800 dark:text-emerald-400">
                          {getProductDiscountPercent(Number(promoOriginalPrice), Number(promoPrice))}% OFF
                        </span>{" "}
                        (₹{Number(promoOriginalPrice) - Number(promoPrice)} discount) on the checkout catalog!
                      </div>
                    </div>
                  ) : Number(promoPrice) > 0 && Number(promoOriginalPrice) > 0 && Number(promoPrice) >= Number(promoOriginalPrice) ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/30 text-amber-600 rounded-xl">
                      <p className="font-bold flex items-center gap-1 text-[11px]">
                        <HelpCircle size={12} />
                        Regular Price Matches
                      </p>
                      <p className="text-[10px] text-amber-550 leading-snug mt-1">
                        Active pricing equals or exceeds standard. Standard pricing is recommended to be higher than active promotion cost.
                      </p>
                    </div>
                  ) : null }
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 py-2.5 bg-gray-105 hover:bg-gray-150 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750 dark:text-gray-300 rounded-lg text-xs font-black uppercase tracking-wider border-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={updatingDiscountId !== null}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all border-0 cursor-pointer disabled:opacity-50"
                    >
                      {updatingDiscountId !== null ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        "Save Offers"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <HelpCircle className="mx-auto mb-3 opacity-30 animate-pulse" size={32} />
                  <p className="text-xs font-bold leading-relaxed px-4">
                    Click the edit icon <span className="inline-block p-1 bg-gray-50 border rounded"><Edit2 size={10} /></span> next to any product list to customize dynamic campaign sale rates
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
