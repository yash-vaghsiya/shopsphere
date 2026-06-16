import React from "react";
import { Product } from "../../types";
import { ProductCard } from "./ProductCard";


export const RelatedProducts = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <div className="space-y-6 border-t border-gray-150 dark:border-gray-850 pt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
          Suggested Products
        </h3>
        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-800 ml-4"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
