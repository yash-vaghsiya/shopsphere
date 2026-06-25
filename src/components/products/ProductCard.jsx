import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Scale } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useCompare } from "../../context/CompareContext";
import { RatingStars } from "../common/RatingStars";
import { formatCurrency, calculateDiscount } from "../../utils/format";


export const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();


  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock <= 0) {
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const activeWish = isInWishlist(product.id);
  const activeCompare = isInCompare(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
    >
      
      {/* Product Image Panel */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-950/40 overflow-hidden flex items-center justify-center">
        
        {/* Discount / Out of Stock Badges */}
        {product.stock <= 0 ? (
          <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase tracking-wide rounded-md shadow-sm">
            Out of Stock
          </span>
        ) : (
          discount > 0 && (
            <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-[10px] uppercase tracking-wide rounded-md shadow-sm">
              {discount}% OFF
            </span>
          )
        )}

        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          onError={(e) => { e.target.src = '/placeholder.svg'; }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? "opacity-50 grayscale" : ""}`}
        />

        {/* Action Overlay Links */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            to={`/product/${product.id}`}
            className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl shadow-lg hover:scale-110 transition-all text-gray-700"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={handleCompareToggle}
            className={`p-3 rounded-xl shadow-lg hover:scale-110 transition-all ${
              activeCompare
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-blue-600 hover:text-white text-gray-700"
            }`}
            title={activeCompare ? "Remove from Compare matrix" : "Add to Compare matrix"}
          >
            <Scale size={18} />
          </button>
          <button
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className={`p-3 rounded-xl shadow-lg hover:scale-110 transition-all ${
              product.stock <= 0
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed opacity-50"
                : "bg-white hover:bg-blue-600 hover:text-white text-gray-700"
            }`}
            title={product.stock <= 0 ? "Out of Stock" : "Quick Add to Cart"}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Floating Heart / Like */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-xl shadow-md border transition-all active:scale-90 ${
            activeWish
              ? "bg-red-500 border-red-500 text-white"
              : "bg-white/95 dark:bg-gray-900/95 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500"
          }`}
          title="Save to Wishlist"
        >
          <Heart size={16} className={activeWish ? "fill-white" : ""} />
        </button>

      </div>

      {/* Product Information Footer */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
              {product.category}
            </span>
            <button
              onClick={handleCompareToggle}
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                activeCompare
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-400"
                  : "bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-800/40 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Scale size={10} />
              {activeCompare ? "Comparing" : "Compare"}
            </button>
          </div>
          <Link
            to={`/product/${product.id}`}
            className="block text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <div className="pt-1">
            <RatingStars rating={product.rating} size={12} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-850 pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-gray-900 dark:text-gray-100">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          
          <button
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className={`p-2 text-xs font-bold rounded-lg transition-colors border active:scale-95 flex items-center justify-center ${
              product.stock <= 0
                ? "bg-gray-50 text-gray-400 border-gray-150 dark:bg-gray-850 dark:text-gray-600 dark:border-gray-800 cursor-not-allowed"
                : "text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border-blue-100"
            }`}
            title={product.stock <= 0 ? "Out of Stock" : "Add To Cart"}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default ProductCard;
