import React from "react";
import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/format";
import { CreditCard, Wallet, Truck } from "lucide-react";

// SHIPPING FORM CONTAINER

export const ShippingForm = ({ register, errors }) => {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
        Shipping Address
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <input
            type="text"
            {...register("fullName", { required: "Full name is required" })}
            className={cn(
              "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
              errors.fullName && "border-red-500 focus:ring-red-500"
            )}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>


        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            {...register("phone", {
              required: "Contact number is required",
              pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit number" },
            })}
            className={cn(
              "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
              errors.phone && "border-red-500 focus:ring-red-500"
            )}
            placeholder="9876543210"
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
          Flat/Street Address *
        </label>
        <input
          type="text"
          {...register("address", { required: "Flat/street address is required" })}
          className={cn(
            "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
            errors.address && "border-red-500 focus:ring-red-500"
          )}
          placeholder="123 Luxury Avenue, Penthouse B"
        />
        {errors.address && (
          <p className="mt-1.5 text-xs text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            City *
          </label>
          <input
            type="text"
            {...register("city", { required: "City is required" })}
            className={cn(
              "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
              errors.city && "border-red-500 focus:ring-red-500"
            )}
            placeholder="Mumbai"
          />
          {errors.city && (
            <p className="mt-1.5 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            State *
          </label>
          <input
            type="text"
            {...register("state", { required: "State is required" })}
            className={cn(
              "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
              errors.state && "border-red-500 focus:ring-red-500"
            )}
            placeholder="Maharashtra"
          />
          {errors.state && (
            <p className="mt-1.5 text-xs text-red-500">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Pincode *
          </label>
          <input
            type="text"
            {...register("zipCode", {
              required: "Pincode is required",
              pattern: { value: /^\d{6}$/, message: "Enter valid 6-digit pincode" },
            })}
            className={cn(
              "w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-all",
              errors.zipCode && "border-red-500 focus:ring-red-500"
            )}
            placeholder="400001"
          />
          {errors.zipCode && (
            <p className="mt-1.5 text-xs text-red-500">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

    </div>
  );
};

// PAYMENT SELECTOR

export const PaymentForm = ({ selectedMethod, onChangeMethod }) => {
  const methods = [
    { id: "Card", label: "Credit/Debit Card", desc: "Pay with card", icon: <CreditCard size={18} /> },
    { id: "UPI", label: "UPI (PhonePe, GPay)", desc: "Seamless UPI Checkout", icon: <Wallet size={18} /> },
    { id: "COD", label: "Cash On Delivery (COD)", desc: "Pay when delivered", icon: <Truck size={18} /> },
  ];

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
        Payment Gateway Selector
      </h3>

      <div className="flex flex-col space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <button
              type="button"
              key={method.id}
              onClick={() => onChangeMethod(method.id)}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850"
              )}
            >
              <div className={cn("p-2.5 rounded-lg border", isSelected ? "bg-blue-105 border-blue-200 text-blue-600" : "bg-gray-50 dark:bg-gray-950 text-gray-400 border-gray-200")}>
                {method.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {method.label}
                </h4>
                <p className="text-xs text-gray-400">
                  {method.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// RECEIPT BILLING SUMMARY

export const BillingSummary = ({
  items,
  subtotal,
  shipping,
  tax,
  total,
}) => {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
        Review Your Order
      </h3>

      {/* Item list */}
      <div className="space-y-3.5 max-h-56 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs font-semibold gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                {item.quantity}x
              </span>
              <span className="text-gray-900 dark:text-gray-200 truncate">{item.name}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-extrabold flex-shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="space-y-3 border-t border-gray-100 dark:border-gray-850 pt-5 text-xs text-gray-500 font-semibold">
        <div className="flex items-center justify-between">
          <span>Items Subtotal</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Est. Shipping & Handling</span>
          <span className="text-gray-900 dark:text-white">
            {shipping === 0 ? "FREE" : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>GST Tax Inclusive (18%)</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
        </div>
      </div>

      {/* Total absolute */}
      <div className="flex items-baseline justify-between border-t border-gray-100 dark:border-gray-850 pt-5">
        <span className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
          Total Due
        </span>
        <span className="text-xl font-black text-blue-600 dark:text-blue-500">
          {formatCurrency(total)}
        </span>
      </div>

    </div>
  );
};
