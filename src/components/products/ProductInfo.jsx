import React, { useState } from "react";
import { Heart, ShoppingBag, Truck, RotateCcw, AlertTriangle, Scale } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useCompare } from "../../context/CompareContext";
import { RatingStars } from "../common/RatingStars";
import { Button } from "../common/Button";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";



export const ProductInfo = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const [quantity, setQuantity] = useState(1);

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    } else {
      toast.error(`Only ${product.stock} items available in stock!`);
    }
  };

  const decrementQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const isLiked = isInWishlist(product.id);

  return (
    <div className="space-y-6">
      
      {/* Brand & Category Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span>{product.brand || "Generics"}</span>
          <span>•</span>
          <span>{product.category}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">
          {product.name}
        </h1>
      </div>

      {/* Ratings Row */}
      <div className="flex items-center gap-3">
        <RatingStars rating={product.rating} size={15} />
        <span className="text-sm text-gray-500">({product.reviews?.length || 0} customer reviews)</span>
      </div>

      {/* Pricing block */}
      <div className="flex items-baseline gap-3 border-y border-gray-100 dark:border-gray-850 py-4.5">
        <span className="text-3xl font-black text-blue-600 dark:text-blue-500">
          {formatCurrency(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-sm font-semibold text-gray-400 line-through">
            {formatCurrency(product.originalPrice)}
          </span>
        )}
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
          TAX Inclusive
        </span>
      </div>

      {/* Description */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">
          Product Details
        </h3>
        <p className="text-sm text-gray-650 dark:text-gray-350 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Stock indicators */}
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
        <span className="text-xs font-semibold text-gray-650 dark:text-gray-350">
          {product.stock > 0 ? `In Stock (${product.stock} items left)` : "Out of stock"}
        </span>
      </div>

      {/* Quantity adjustment & Actions */}
      {product.stock > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 dark:border-gray-850 pt-5">
          {/* Adjusted */}
          <div className="flex items-center border border-gray-250 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-950 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={decrementQty}
              className="px-4 py-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-bold"
            >
              -
            </button>
            <span className="px-4 py-2.5 text-xs font-bold text-gray-950 dark:text-white select-none">
              {quantity}
            </span>
            <button
              onClick={incrementQty}
              className="px-4 py-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-bold"
            >
              +
            </button>
          </div>

          {/* Cart add button */}
          <Button
            onClick={handleAddToCart}
            className="w-full sm:flex-1 py-3.5"
          >
            <ShoppingBag size={16} className="mr-2" />
            Add To Bag
          </Button>

          {/* Compare specifications button */}
          <button
            onClick={() => {
              if (isInCompare(product.id)) {
                removeFromCompare(product.id);
              } else {
                addToCompare(product);
              }
            }}
            className={`p-3 rounded-xl border transition-all active:scale-90 shadow-sm ${
              isInCompare(product.id)
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-400 hover:text-blue-600 hover:border-blue-500"
            }`}
            title={isInCompare(product.id) ? "Remove from comparison specs" : "Compare Specifications"}
          >
            <Scale size={18} />
          </button>

          {/* Wish button */}
          <button
            onClick={() => {
              toggleWishlist(product);
              toast.success(isLiked ? "Removed brand selection" : "Liked Brand highlight!");
            }}
            className={`p-3 rounded-xl border transition-all active:scale-90 shadow-sm ${
              isLiked
                ? "bg-red-500 border-red-500 text-white"
                : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-white" : ""} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 dark:border-gray-850 pt-5">
          {/* Out of Stock Button */}
          <button
            disabled
            className="w-full sm:flex-1 py-3.5 bg-gray-100 dark:bg-gray-850 text-gray-400 dark:text-gray-600 font-black text-xs uppercase tracking-wider rounded-xl cursor-not-allowed border-0 text-center flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} />
            Temporarily Out of Stock
          </button>

          {/* Compare specifications button even if out of stock */}
          <button
            onClick={() => {
              if (isInCompare(product.id)) {
                removeFromCompare(product.id);
              } else {
                addToCompare(product);
              }
            }}
            className={`p-3 rounded-xl border transition-all active:scale-90 shadow-sm ${
              isInCompare(product.id)
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-400 hover:text-blue-600 hover:border-blue-500"
            }`}
            title={isInCompare(product.id) ? "Remove from comparison specs" : "Compare Specifications"}
          >
            <Scale size={18} />
          </button>

          {/* Wish button remains active even if out of stock */}
          <button
            onClick={() => {
              toggleWishlist(product);
              toast.success(isLiked ? "Removed brand selection" : "Liked Brand highlight!");
            }}
            className={`p-3 rounded-xl border transition-all active:scale-90 shadow-sm ${
              isLiked
                ? "bg-red-500 border-red-500 text-white"
                : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-white" : ""} />
          </button>
        </div>
      )}

      {/* Features sidebar highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-850">
        <div className="flex items-center gap-3">
          <Truck size={18} className="text-blue-500" />
          <span className="text-xs font-bold text-gray-650 dark:text-gray-350">
            Express Delivery In 2-3 Days
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw size={18} className="text-blue-500" />
          <span className="text-xs font-bold text-gray-650 dark:text-gray-350">
            Hassle-Free 30 Days Refund policy
          </span>
        </div>
      </div>

    </div>
  );
};

export default ProductInfo;
