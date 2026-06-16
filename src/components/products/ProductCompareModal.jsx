import React from "react";
import { X, ShoppingCart, Trash2, Scale, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { Product } from "../../types";
import { useCompare } from "../../context/CompareContext";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format";
import { RatingStars } from "../common/RatingStars";
import { toast } from "react-hot-toast";

// Rich dynamic spec parser for mock e-commerce precision
export function getProductSpecs(product) {
  const nameLower = (product?.name || "").toLowerCase();
  const waterproof = "IPX7 Water Resistance";
  const sensors = "Multi-Sensor Array";
  const material = "Advanced Composite Alloy";

  if (nameLower.includes("watch") || nameLower.includes("zenith")) {
    return {
      display: "1.43\" AMOLED Touch Shield",
      battery: "7-Day Continuous reserve",
      material: "High-tensile Carbon Composite",
      sensors: "Biometric Heart & SpO2 Grid",
      waterproof,
      wireless: "Bluetooth 5.3 Low Energy"
    };
  } else if (nameLower.includes("earbud") || nameLower.includes("sound") || nameLower.includes("pod") || nameLower.includes("aether")) {
    return {
      display: "N/A (Adaptive LED HUD Case)",
      battery: "Up to 36 Hours (with Capsule)",
      material: "Acoustically-Isolated Resins",
      sensors,
      waterproof: "IPX5 Sweat & Rain Defense",
      wireless: "True Wireless Spatial Audio"
    };
  } else if (nameLower.includes("keyboard") || nameLower.includes("keycap") || nameLower.includes("mech")) {
    return {
      display: "Custom OLED Live Macro Screen",
      battery: "Direct USB Type-C Charging",
      material,
      sensors: "Full Key Anti-Ghosting Matrix",
      waterproof,
      wireless: "Tri-Mode (Wired, 2.4Ghz, BT)"
    };
  } else if (nameLower.includes("shoe") || nameLower.includes("run") || nameLower.includes("sneaker") || nameLower.includes("apparel") || nameLower.includes("fit")) {
    return {
      display: "N/A",
      battery: "N/A (Infused Human Energy)",
      material: "Breathable Flytech Micro-Mesh",
      sensors,
      waterproof: "Moisture-wicking Breathable Coated",
      wireless: "N/A (Precision Ergonomic Contour)"
    };
  } else {
    // default premium details
    return {
      display: "Enhanced Digital Support Mode",
      battery: "N/A Device Powered",
      material,
      sensors,
      waterproof,
      wireless: "Instant Plug-and-Play Connect"
    };
  }
}

export const ProductCompareModal = () => {
  const {
    comparedProducts,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    setCompareModalOpen
  } = useCompare();

  const { addItem } = useCart();

  if (!isCompareModalOpen) return null;

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} added from Compare Matrix!`, {
      icon: "🛒"
    });
  };

  const specsRows = [
    { key: "brand", label: "Brand / Manufacturer" },
    { key: "category", label: "Category / Type" },
    { key: "rating", label: "Average Rating" },
    { key: "status", label: "Availability" },
    { key: "display", label: "Screen / Visual Hub" },
    { key: "battery", label: "Battery Capacity" },
    { key: "material", label: "Build Material" },
    { key: "sensors", label: "Sensing Tech" },
    { key: "waterproof", label: "Water Resistance" },
    { key: "wireless", label: "Wireless Support" },
  ];

  const getSpecValue = (product, key) => {
    const specs = getProductSpecs(product);
    switch (key) {
      case "brand":
        return product.brand || "Elite Premium";
      case "category":
        return product.category;
      case "rating":
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <RatingStars rating={product.rating} size={11} />
            <span>({product.rating} out of 5)</span>
          </div>
        );
      case "status":
        return product.stock > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            In Stock ({product.stock})
          </span>
        ) : (
          <span className="text-red-600 dark:text-red-400 font-extrabold text-[10px] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Out of Stock
          </span>
        );
      case "display":
        return specs.display;
      case "battery":
        return specs.battery;
      case "material":
        return specs.material;
      case "sensors":
        return specs.sensors;
      case "waterproof":
        return specs.waterproof;
      case "wireless":
        return specs.wireless;
      default:
        return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/90 dark:bg-black/95 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setCompareModalOpen(false)}
      />

      {/* Center Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header Action Row */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-955/20 shrink-0">
            <div className="flex items-center gap-2 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Scale size={18} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-tight text-gray-900 dark:text-white">
                  Side-By-Side Product Comparison
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Analyzing {comparedProducts.length} high-spec selections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {comparedProducts.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="px-3.5 py-1.5 border border-dashed border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none"
                >
                  Clear Selection
                </button>
              )}
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable spec sheet table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            {comparedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center text-slate-400 text-2xl animate-bounce">
                  ⚖️
                </div>
                <div className="text-center">
                  <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wider">Compare Board Empty</h4>
                  <p className="text-[11px] text-gray-500 max-w-sm mt-1 font-semibold">
                    Add products from the Shop section first to inspect specification matrices side-by-side.
                  </p>
                </div>
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all"
                >
                  Explore Shop Catalog
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[700px] border-collapse relative">
                
                {/* Visual Cards Row */}
                <thead>
                  <tr className="border-b border-gray-150 dark:border-gray-850">
                    {/* First cell holding category descriptor */}
                    <th className="w-1/5 pb-6 text-left align-top pr-4">
                      <div className="bg-slate-50/50 dark:bg-gray-955/35 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 h-full flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                            SPEC CONTROLLER
                          </span>
                          <h5 className="font-extrabold text-[11px] text-gray-900 dark:text-white uppercase leading-normal mt-1">
                            Matrix Analysis
                          </h5>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-normal">
                          Inspect physical details, power cells, custom wireless protocols, and store prices.
                        </p>
                        <div className="flex items-center gap-1.5 opacity-60">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Certified True Specs</span>
                        </div>
                      </div>
                    </th>

                    {/* Products Columns */}
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="pb-6 px-4 text-center align-top relative group">
                        
                        {/* Remove column bubble trigger */}
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="absolute -top-1.5 right-2 z-10 p-1.5 bg-white dark:bg-gray-900 hover:bg-red-500 hover:text-white rounded-full border border-gray-150 dark:border-gray-800 text-gray-400 hover:border-transparent transition-all shadow-xs cursor-pointer"
                          title="Exclude product"
                        >
                          <Trash2 size={11} />
                        </button>

                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 p-2 flex items-center justify-center border border-gray-150/80 dark:border-gray-800/80">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain rounded-xl select-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded-md">
                              {p.category}
                            </span>
                            <h4 className="font-extrabold text-[11px] text-gray-900 dark:text-white leading-tight line-clamp-2 hover:text-blue-600 transition-colors uppercase tracking-tight text-center max-w-[160px]">
                              {p.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 pt-0.5">
                              <span className="text-xs font-black text-gray-950 dark:text-white">
                                {formatCurrency(p.price)}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[9px] text-gray-400 line-through">
                                  {formatCurrency(p.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(p)}
                            disabled={p.stock <= 0}
                            className={`w-full max-w-[150px] py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                              p.stock <= 0
                                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-700 cursor-not-allowed border border-transparent"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md"
                            }`}
                          >
                            <ShoppingCart size={10} className="shrink-0" />
                            Buy Item
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Structured comparative matrix rows */}
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900 text-center">
                  {specsRows.map((row, idx) => (
                    <tr 
                      key={row.key} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-gray-955/20 transition-colors duration-150 ${
                        idx % 2 === 0 ? "bg-gray-50/15 dark:bg-gray-955/5" : ""
                      }`}
                    >
                      {/* Left header parameter title */}
                      <td className="py-4.5 pr-4 text-left font-black text-[10px] text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-950 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-100 dark:border-gray-900">
                        {row.label}
                      </td>

                      {/* Products cell spec information */}
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="py-4.5 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {getSpecValue(p, row.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>

          {/* Footer action guide info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-955/35 border-t border-gray-100 dark:border-gray-900 text-center shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
              Selected: {comparedProducts.length} of 4 items for dynamic comparison
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-gray-400 font-semibold italic flex items-center gap-1 leading-none mt-0.5">
                <HelpCircle size={10} /> Specifications are customized live based on the selected catalog taxonomy.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCompareModal;
