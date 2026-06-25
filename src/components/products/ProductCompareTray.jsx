import React from "react";
import { Scale, X, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import { useCompare } from "../../context/CompareContext";

export const ProductCompareTray = () => {
  const {
    comparedProducts,
    removeFromCompare,
    clearCompare,
    setCompareModalOpen,
  } = useCompare();

  if (comparedProducts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-24 right-6 left-6 md:left-auto md:w-[480px] bg-white dark:bg-gray-950 rounded-2xl shadow-3xl border border-blue-100 dark:border-blue-900/40 p-4 z-40 animate-fade-in font-sans flex flex-col space-y-3"
      id="product-compare-tray"
    >
      {/* Header of the compare strip */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-2">
        <div className="flex items-center gap-2 text-left">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
            📊
          </div>
          <div>
            <h4 className="font-extrabold text-[11px] text-gray-900 dark:text-white uppercase tracking-tight">
              Compare Queue ({comparedProducts.length}/4)
            </h4>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
              Select at least 2 items to view matrix
            </p>
          </div>
        </div>

        <button
          onClick={clearCompare}
          className="text-[8px] font-black text-red-500 hover:text-red-600 dark:hover:text-red-400 uppercase tracking-widest bg-transparent border-0 cursor-pointer select-none py-1 px-1.5 rounded-lg active:scale-95 duration-150"
        >
          Reset
        </button>
      </div>

      {/* Selected Items Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[70%]">
          {comparedProducts.map((p) => (
            <div 
              key={p.id}
              className="relative w-12 h-12 rounded-xl bg-gray-55 dark:bg-gray-900 p-1 flex items-center justify-center border border-gray-150 dark:border-gray-800 shrink-0 group hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200"
            >
              <img 
                src={p.image || '/placeholder.svg'} 
                alt={p.name} 
                onError={(e) => { e.target.src = '/placeholder.svg'; }}
                className="max-h-full max-w-full object-contain rounded-lg select-none"
              />
              {/* Hover active removal trigger */}
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 hover:bg-red-500 text-white flex items-center justify-center font-bold text-[8px] shadow-sm cursor-pointer duration-150 border-0"
                title="Remove Selection"
              >
                <X size={8} />
              </button>
            </div>
          ))}

          {/* Prompt slot for adding more devices */}
          {comparedProducts.length < 4 && (
            <div className="w-12 h-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shrink-0 bg-transparent text-gray-300 dark:text-gray-800 text-[10px]">
              <span>+{4 - comparedProducts.length}</span>
            </div>
          )}
        </div>

        {/* Action compare trigger button */}
        <button
          onClick={() => setCompareModalOpen(true)}
          disabled={comparedProducts.length < 2}
          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-0 select-none cursor-pointer duration-200 shadow-sm ${
            comparedProducts.length < 2
              ? "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-500/10"
          }`}
        >
          <Scale size={11} />
          Compare Menu
        </button>
      </div>
    </div>
  );
};

export default ProductCompareTray;
