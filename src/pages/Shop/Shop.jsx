import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { usePagination } from "../../hooks/usePagination";
import { ProductFilters } from "../../components/products/ProductFilters";
import { ProductSort } from "../../components/products/ProductSort";
import { ProductGrid } from "../../components/products/ProductGrid";
import { SearchBar } from "../../components/common/SearchBar";
import { Pagination } from "../../components/common/Pagination";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ProductSkeleton } from "../../components/products/ProductSkeleton";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

export const Shop = () => {
  const { products, categories, loading, error, fetchProducts } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected filters in local state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Synchronize state filters with URL query parameters
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlQ = searchParams.get("q");

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory(null);
    }

    if (urlQ) {
      setSearchQuery(urlQ);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  // Extract unique brands from catalog to populate brand filters dynamically
  const uniqueBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean))
  );

  // Execute Search & Filtering & Sorting
  const filteredProducts = products.filter((p) => {
    // 1. Category check
    if (selectedCategory && p.category !== selectedCategory) {
      return false;
    }
    // 2. Brand check
    if (selectedBrand && p.brand !== selectedBrand) {
      return false;
    }
    // 3. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchName || matchBrand || matchDesc;
    }
    return true;
  });

  // Sort array
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    // Default (featured / ID order)
    return b.id - a.id;
  });

  // Paginated listings
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
  } = usePagination(sortedProducts, 8); // Display 8 per page inside Shop for clean balance

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
    goToPage(1);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    goToPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery("");
    setSortBy("");
    setSearchParams({});
    goToPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Breadcrumbs */}
      <Breadcrumb items={[{ label: "Shop Collection", path: "/shop" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Filters (Collapsible on mobile, takes 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between lg:hidden bg-gray-55/65 dark:bg-gray-850/50 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100/40 dark:hover:bg-gray-800/40 cursor-pointer transition-all select-none font-bold text-xs outline-none"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-blue-600" />
              <span className="font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Adjustment Panels</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-500 font-black">
              <span className="uppercase text-[10px] tracking-widest">{isFiltersOpen ? "Hide" : "Show"}</span>
              {isFiltersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          <div className={`lg:block ${isFiltersOpen ? "block" : "hidden"}`}>
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              brandList={uniqueBrands}
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Listings (Takes 9 columns) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-850">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {selectedCategory || "All Catalog Products"}
              </h2>
              <p className="text-xs text-gray-450 font-bold">
                Showing {sortedProducts.length === 0 ? 0 : (currentPage - 1) * 8 + 1}-
                {Math.min(currentPage * 8, sortedProducts.length)} of {sortedProducts.length} items
              </p>
            </div>
            
            {/* Sorting controls */}
            <ProductSort value={sortBy} onChange={setSortBy} />
          </div>

          {/* Search bar inside list */}
          <div className="flex justify-start">
            <SearchBar
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
                goToPage(1);
              }}
            />
          </div>

          {/* Catalog results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : (
            <div className="space-y-6">
              <ProductGrid products={paginatedData} />
              
              {/* Pagination indicators footer */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Shop;
