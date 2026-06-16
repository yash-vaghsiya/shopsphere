import React, { useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { HeroSection } from "../../components/home/HeroSection";
import { CategorySection, OfferBanner, Testimonials, BrandsSection } from "../../components/home/HomeComponents";
import { ProductGrid } from "../../components/products/ProductGrid";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { Sparkles, TrendingUp } from "lucide-react";

export const Home = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const trending = products.filter((p) => p.trending).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* 1. Landing Hero Banner */}
      <HeroSection />

      {/* 2. Collections Categories Grid */}
      <CategorySection />

      {/* 3. New Featured Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1 text-center sm:text-left mx-auto sm:mx-0">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="text-blue-500 animate-pulse" size={20} />
              New Hot Arrivals
            </h2>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Handpicked luxury electronics & wearables
            </p>
          </div>
          <div className="hidden sm:block flex-1 border-t border-dashed border-gray-200 dark:border-gray-800 ml-6"></div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : (
          <ProductGrid products={featured.length > 0 ? featured : products.slice(0, 4)} />
        )}
      </section>

      {/* 4. Special Marketing Promo Banner */}
      <OfferBanner />

      {/* 5. Trending Hot Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1 text-center sm:text-left mx-auto sm:mx-0">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Best Sellers
            </h2>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Our customers' highest-rated active catalog favorites
            </p>
          </div>
          <div className="hidden sm:block flex-1 border-t border-dashed border-gray-200 dark:border-gray-800 ml-6"></div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : (
          <ProductGrid products={trending.length > 0 ? trending : products.slice(4, 8)} />
        )}
      </section>

      {/* 6. Client Feedback Stories */}
      <Testimonials />

      {/* 7. Distribution Brands logo grid */}
      <BrandsSection />
    </div>
  );
};

export default Home;
