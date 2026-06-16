import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Percent } from "lucide-react";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";
import { Coupon } from "../../types";

export const CartSummary = () => {
  const { totalAmount } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [validating, setValidating] = useState(false);
  const [allCoupons, setAllCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setCouponsLoading(true);
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          setAllCoupons(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading coupons:", err);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const activeCoupons = allCoupons.filter(c => {
    if (!c.isActive) return false;
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) return false;
    return true;
  });

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const formatted = couponCode.trim().toUpperCase();
    if (!formatted) return;

    try {
      setValidating(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formatted, amount: totalAmount })
      });

      if (res.ok) {
        const coupon = await res.json();
        let computedPercent = 0;
        if (coupon.discountType === "percentage") {
          computedPercent = coupon.discountValue / 100;
        } else {
          computedPercent = totalAmount > 0 ? coupon.discountValue / totalAmount : 0;
        }
        
        // Prevent discount from exceeding total amount
        if (computedPercent > 1) computedPercent = 1;

        setDiscountPercent(computedPercent);
        setAppliedCoupon(coupon.code);
        setCouponCode("");
        
        const savingText = coupon.discountType === "percentage" 
          ? `${coupon.discountValue}% Off` 
          : `₹${coupon.discountValue} Off`;
        toast.success(`Coupon code "${coupon.code}" applied successfully! (${savingText})`);
      } else {
        const err = await res.json();
        toast.error(err.message || "Voucher validation failed!");
      }
    } catch (err) {
      toast.error("Voucher validation service could not be reached.");
    } finally {
      setValidating(false);
    }
  };

  const shipping = totalAmount > 4999 ? 0 : 250;
  const discountAmount = totalAmount * discountPercent;
  const tax = (totalAmount - discountAmount) * 0.18; // 18% GST typical IN
  const finalTotal = totalAmount - discountAmount + shipping + tax;

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-4 border-b border-gray-105">
        Order Summary
      </h3>

      {/* Pricing specifications list */}
      <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-850 pb-5">
        <div className="flex items-center justify-between">
          <span>Bag Subtotal</span>
          <span className="text-gray-900 dark:text-white font-extrabold">{formatCurrency(totalAmount)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-red-500">
            <span className="flex items-center gap-1">
              <Percent size={12} />
              Discount Coupon ({appliedCoupon})
            </span>
            <span className="font-extrabold">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Estimated Shipping</span>
          <span className="text-gray-900 dark:text-white font-extrabold">
            {shipping === 0 ? "FREE" : formatCurrency(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Estimated Taxes (GST 18%)</span>
          <span className="text-gray-900 dark:text-white font-extrabold">{formatCurrency(tax)}</span>
        </div>
      </div>

      {/* Form coupon code */}
      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="DISCOUNT50"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-lg py-2 pl-8 pr-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors h-10 outline-none"
          />
          <Tag size={12} className="absolute left-2.5 top-3.5 text-gray-400" />
        </div>
        <Button type="submit" variant="secondary" className="h-10 text-xs">
          Apply
        </Button>
      </form>

      {/* Dynamic Available Active Coupons list */}
      {activeCoupons.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-dashed border-gray-150 dark:border-gray-800" id="active-available-coupons-container">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
              <Tag size={10} className="text-blue-500" />
              Available Offers
            </span>
            <span className="text-[9px] bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded">
              {activeCoupons.length} Active
            </span>
          </div>
          
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1" id="active-coupons-scroller">
            {activeCoupons.map((coupon) => {
              const isEligible = !coupon.minCartAmount || totalAmount >= coupon.minCartAmount;
              return (
                <button
                  key={coupon.id}
                  id={`coupon-pill-${coupon.code.toLowerCase()}`}
                  type="button"
                  onClick={() => {
                    if (isEligible) {
                      setCouponCode(coupon.code);
                    } else {
                      toast.error(`Add ${formatCurrency(coupon.minCartAmount - totalAmount)} more to bag to unlock this coupon!`);
                    }
                  }}
                  className={`w-full text-left p-2 rounded-xl border transition-all text-xs flex items-center justify-between gap-1.5 cursor-pointer select-none outline-none ${
                    isEligible
                      ? "bg-blue-50/25 hover:bg-blue-50/60 dark:bg-blue-950/5 dark:hover:bg-blue-950/15 border-blue-100/40 dark:border-blue-950/20 text-gray-850 dark:text-gray-250 hover:scale-[1.01]"
                      : "bg-gray-50/50 dark:bg-gray-950/10 border-gray-100 dark:border-gray-900 text-gray-400 opacity-75 cursor-not-allowed"
                  }`}
                  title={isEligible ? "Click to use code" : `Needs ₹${coupon.minCartAmount} minimum order`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded text-[9px]">
                        {coupon.code}
                      </span>
                      <span className="font-bold text-[10px] text-emerald-600 dark:text-emerald-450 whitespace-nowrap">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium truncate">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-[9px] font-bold shrink-0">
                    {isEligible ? (
                      <span className="text-blue-600 dark:text-blue-400 uppercase">Apply</span>
                    ) : (
                      <span className="text-gray-450">Min ₹{coupon.minCartAmount}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* final absolute total */}
      <div className="flex items-baseline justify-between border-t border-gray-100 dark:border-gray-850 pt-5">
        <span className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
          Total Amount
        </span>
        <span className="text-2xl font-black text-gray-900 dark:text-white">
          {formatCurrency(finalTotal)}
        </span>
      </div>

      {/* checkout CTAs */}
      <div className="pt-2">
        <Link
          to="/checkout"
          state={{ discountPercent, appliedCoupon }}
          className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          Proceed To Checkout
          <ArrowRight size={14} className="ml-2" />
        </Link>
      </div>

    </div>
  );
};

export default CartSummary;
