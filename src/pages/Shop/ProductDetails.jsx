import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { ProductGallery } from "../../components/products/ProductGallery";
import { ProductInfo } from "../../components/products/ProductInfo";
import { ProductReviews } from "../../components/products/ProductReviews";
import { RelatedProducts } from "../../components/products/RelatedProducts";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { DetailSkeleton } from "../../components/products/DetailSkeleton";
import { ChevronLeft } from "lucide-react";

export const ProductDetails = () => {
  const { id } = useParams();
  const {
    products,
    currentProduct,
    loading,
    error,
    fetchProductById,
    clearSelectedProduct,
  } = useProducts();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
    return () => {
      clearSelectedProduct();
    };
  }, [id]);

  if (loading && !currentProduct) {
    return <DetailSkeleton />;
  }

  if (error || !currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          message={error || "The requested e-commerce product could not be found."}
          onRetry={() => id && fetchProductById(id)}
        />
        <div className="mt-6 text-center">
          <Link to="/shop" className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
            <ChevronLeft size={16} />
            Back to Shop Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Fetch related products belonging to the same category
  const relatedList = products
    .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  // Set high-end mock product specifications based on categories
  const specifications =
    currentProduct.category === "Electronics" || currentProduct.category === "Gaming"
      ? [
          { label: "Connectivity", value: "Bluetooth 5.3, Ultra-Wide Band, Wi-Fi 6E" },
          { label: "Hardware Core", value: "Liquid-Cooled Coprocessor Core" },
          { label: "Materials", value: "Surgical-grade Titanium Frame, Corning Glass" },
          { label: "Power & Battery", value: "Up to 48 hours, Fast Charge 65W" },
        ]
      : [
          { label: "Materials", value: "Premium cotton blends and recycled synthetics" },
          { label: "Country of Origin", value: "Assembled globally" },
          { label: "Safety Rating", value: "Eco-certified and hypoallergenic fabrics" },
          { label: "Model Code", value: `SHP-${currentProduct.id}X-2026` },
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Shop", path: "/shop" },
          { label: currentProduct.category, path: `/shop?category=${encodeURIComponent(currentProduct.category)}` },
          { label: currentProduct.name, path: `/product/${currentProduct.id}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        
        {/* Left Column: Product Imagery (Takes 6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Switched Thumbs Gallery */}
          <ProductGallery
            images={currentProduct.images}
            defaultImage={currentProduct.image}
            videoUrl={currentProduct.videoUrl}
          />

          {/* Specifications Box Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest pb-2 border-b">
              Specifications & Parameters
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
              {specifications.map((spec) => (
                <div key={spec.label} className="grid grid-cols-3 py-3 font-semibold">
                  <span className="text-gray-400 uppercase tracking-widest text-[9px]">{spec.label}</span>
                  <span className="col-span-2 text-gray-850 dark:text-gray-200">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Custom Info Card (Takes 6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm">
          <ProductInfo product={currentProduct} />
        </div>

      </div>

      {/* Product Reviews Lists and Submissions */}
      <ProductReviews initialReviews={currentProduct.reviews} />

      {/* Suggested Products matching category */}
      <RelatedProducts products={relatedList} />
    </div>
  );
};

export default ProductDetails;
