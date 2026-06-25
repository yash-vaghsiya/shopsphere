import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchProductsThunk, deleteProductThunk } from "../../features/products/productSlice";
import { ProductsTable } from "../../components/admin/AdminComponents";
import { toast } from "react-hot-toast";
import { X, Save, Sparkles, AlertCircle } from "lucide-react";

export const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading, categories } = useSelector((state) => state.products);

  // Editing state variables
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsThunk({}));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product from stock?")) {
      try {
        await dispatch(deleteProductThunk(id)).unwrap();
        toast.success("Product deleted from catalog!");
      } catch (err) {
        toast.error(err || "Failed to delete product.");
      }
    }
  };

  const handleEditInit = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditStock(prod.stock.toString());
    setEditPrice(prod.price.toString());
    setEditCategory(prod.category || "");
    setEditBrand(prod.brand || "");
    setEditDescription(prod.description || "");
    setEditImage(prod.image || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedStock = parseInt(editStock);
    const parsedPrice = parseFloat(editPrice);

    if (!editName.trim()) {
      return toast.error("Product name cannot be empty");
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return toast.error("Stock level must be a non-negative integer number");
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return toast.error("Individual product price must be a valid positive amount");
    }

    try {
      setSaving(true);
      const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";
      const body = {
        name: editName.trim(),
        stock: parseInt(editStock),
        price: parseFloat(editPrice),
        category: editCategory.trim(),
        brand: editBrand.trim(),
        description: editDescription.trim(),
        image: editImage.trim() || undefined,
      };

      let res;
      try {
        res = await fetch(`${API_URL}/Products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {
        res = null;
      }

      if (!res || !res.ok) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        toast.success(`Product stock and configurations updated for "${editName}"!`);
        setEditingProduct(null);
        dispatch(fetchProductsThunk({}));
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Could not update target product configurations");
      }
    } catch (err) {
      toast.error("Network communication error updating product catalog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Product Stocks Catalog
        </h1>
        <p className="text-xs text-gray-400">
          Deallocate existing warehouse models, filter stocks, and configure catalog listings
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <ProductsTable 
          products={products} 
          onDelete={handleDelete} 
          onEdit={handleEditInit}
        />
      )}

      {/* HIGHLINE: PREMIUM EDIT OVERLAY MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div 
            className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            id="product-edit-modal"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/40">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <h2 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                  Edit Warehouse Item Specs
                </h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-0 cursor-pointer transition-colors"
                title="Discard Changes"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Product General Alert banner if stock is low */}
              {editingProduct.stock < 10 && (
                <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/30 text-amber-800 dark:text-amber-450 rounded-xl text-xs font-semibold">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Critical Low Stocks Level</p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 mt-0.5">
                      This item is running low on stock ({editingProduct.stock} left). Fill up the allocation level to keep consumer sales uninterrupted.
                    </p>
                  </div>
                </div>
              )}

              {/* Product Title */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Product Title Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white transition-colors"
                />
              </div>

              {/* Specs Grid: Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Stock Qty Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Unit Retail Price (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-black text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Category & Brand input boxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Product Category</label>
                <select
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white transition-colors"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Brand Partner</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Image URL Input Box */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Display Image URL</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://example.com/item.png"
                  className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white transition-colors font-mono"
                />
              </div>

              {/* Product Specifications Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Extended Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Insert bullet points, dimensions, material information and usage instructions..."
                  className="w-full bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white transition-colors font-semibold"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-850 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-150 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider border-0 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 border-0 hover:shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={13} />
                      Commit Stock
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
