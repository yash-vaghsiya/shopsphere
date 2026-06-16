import React from "react";
import { useWishlist } from "../../hooks/useWishlist";
import { WishlistGrid } from "../../components/wishlist/WishlistComponents";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Heart } from "lucide-react";

export const Wishlist = () => {
  const { items: wishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <Breadcrumb items={[{ label: "Liked Collections", path: "/wishlist" }]} />

      <div className="text-center sm:text-left pb-4 border-b border-gray-150 dark:border-gray-850">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          <Heart className="text-red-500 fill-red-500 animate-pulse" size={20} />
          Liked Likelist ({wishlist.length})
        </h1>
        <p className="text-xs text-gray-450 font-bold">
          Your saved luxury products, gadgets, and apparel
        </p>
      </div>

      {/* Wishlist listings wrapper */}
      <WishlistGrid products={wishlist} />
    </div>
  );
};

export default Wishlist;
