import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, HeartCrack } from "lucide-react";
 
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";

// WISHLIST ITEM CARD

export const WishlistCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist } = useWishlist();

  const handleMoveToCart = (e) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toggleWishlist(product); // Remove from likes
    toast.success(`Moved ${product.name} to bag!`);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    toast.success(`Removed ${product.name} from likes`);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-950 p-4 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          onError={(e) => { e.target.src = '/placeholder.svg'; }}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Delete Like button float */}
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 border border-gray-150 dark:border-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm"
          title="Remove from Liked items"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info labels */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <Link
            to={`/product/${product.id}`}
            className="block text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:underline"
          >
            {product.category}
          </Link>
          <Link
            to={`/product/${product.id}`}
            className="block text-sm font-bold text-gray-900 dark:text-white truncate"
          >
            {product.name}
          </Link>
          <p className="text-sm font-black text-blue-600 dark:text-blue-500 pt-1">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 border-t border-gray-50 dark:border-gray-850 pt-3 flex-shrink-0">
          <button
            onClick={handleMoveToCart}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors active:scale-95 select-none"
          >
            <ShoppingCart size={12} />
            Move To Bag
          </button>
        </div>
      </div>

    </div>
  );
};

// WISHLIST GRID WRAPPER

export const WishlistGrid = ({ products = [] }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border">
        <div className="p-4 bg-gray-100 dark:bg-gray-850 rounded-full text-gray-400">
          <HeartCrack size={28} />
        </div>
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Empty Likelist</h4>
        <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
          You haven't liked any items yet. Explore the shop and tap the heart icon on any product to save them here!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <WishlistCard key={p.id} product={p} />
      ))}
    </div>
  );
};
