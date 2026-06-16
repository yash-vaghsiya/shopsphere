import React from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format";


export const CartDrawer = ({ isOpen, onClose }) => {
  const { items, totalAmount, totalItems, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto h-screen w-screen max-w-md bg-white dark:bg-gray-900 border-l border-gray-150 dark:border-gray-800 shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-600" />
                Shopping Bag ({totalItems})
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bag Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center space-y-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-850 rounded-full text-gray-400">
                    <ShoppingBag size={24} />
                  </div>
                  <h4 className="text-xs font-black uppercase text-gray-400">Your Bag is Empty</h4>
                  <p className="text-xs text-gray-500 max-w-[200px]">
                    Fill your bag with premium gadgets, fashion apparel, or accessories.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-850 hover:border-gray-200 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-950 p-1 flex-shrink-0 flex items-center justify-center border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity}</p>
                      <p className="text-xs text-blue-600 font-extrabold">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-red-500 font-bold hover:underline self-start mt-1"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary link actions */}
            <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-850 bg-gray-55/70 dark:bg-gray-950/25 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-black uppercase text-gray-450 tracking-wider">Subtotal</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-3 border border-gray-250 dark:border-gray-750 text-gray-750 dark:text-gray-300 rounded-xl text-center text-xs font-black hover:bg-gray-100 transition-all select-none active:scale-95"
                >
                  Keep Shopping
                </button>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-black shadow-md flex items-center justify-center gap-1 hover:gap-2 transition-all select-none active:scale-95"
                >
                  View Cart
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
