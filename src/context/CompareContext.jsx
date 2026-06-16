import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";


export const CompareContext = createContext(undefined);

export const CompareProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);

  // Restore from sessionStorage if exists to persist across page refreshes
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("compared_products");
      if (saved) {
        setComparedProducts(JSON.parse(saved));
      }
    } catch (e) {
      // Ignored in sandbox
    }
  }, []);

  const addToCompare = (product) => {
    // Check if already in list
    if (comparedProducts.some((p) => p.id === product.id)) {
      toast.error(`${product.name} is already added to comparison!`);
      return;
    }

    // Enforce limit of 4 items for layout readability
    if (comparedProducts.length >= 4) {
      toast.error("You can compare up to 4 products at once. Remove an item first!");
      return;
    }

    const updated = [...comparedProducts, product];
    setComparedProducts(updated);
    try {
      sessionStorage.setItem("compared_products", JSON.stringify(updated));
    } catch (e) {}

    toast.success(`Added ${product.name} to comparison!`, {
      icon: "📊",
    });
  };

  const removeFromCompare = (id) => {
    const updated = comparedProducts.filter((p) => p.id !== id);
    setComparedProducts(updated);
    try {
      sessionStorage.setItem("compared_products", JSON.stringify(updated));
    } catch (e) {}
    toast.success("Removed from comparison");
  };

  const clearCompare = () => {
    setComparedProducts([]);
    try {
      sessionStorage.removeItem("compared_products");
    } catch (e) {}
    setCompareModalOpen(false);
  };

  const isInCompare = (id) => {
    return comparedProducts.some((p) => p.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        setCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
