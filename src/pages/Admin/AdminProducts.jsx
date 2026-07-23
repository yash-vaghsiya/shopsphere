import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchProductsThunk, deleteProductThunk } from "../../features/products/productSlice";
import { ProductsTable } from "../../components/admin/AdminComponents";
import { toast } from "react-hot-toast";
import { X, Save, Sparkles, AlertCircle, Plus, Play } from "lucide-react";

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
  const [editImages, setEditImages] = useState([]);
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const editFileInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

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
    setEditImages(prod.images && prod.images.length > 0 ? [...prod.images] : (prod.image ? [prod.image] : []));
    setEditVideoUrl(prod.videoUrl || "");
  };

  const handleEditFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleEditVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please select a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditVideoUrl(ev.target.result);
      toast.success("Video uploaded!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

      const uploadFile = async (base64Data) => {
        const r = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data }),
        });
        if (!r.ok) throw new Error('File upload failed');
        return (await r.json()).url;
      };

      const resolveMediaUrls = async (items) => {
        const out = [];
        for (const item of items) {
          if (!item || typeof item !== 'string') continue;
          if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('/uploads/')) {
            out.push(item);
          } else {
            out.push(await uploadFile(item));
          }
        }
        return out;
      };

      toast.loading("Uploading media files...", { id: 'edit-upload' });
      const resolvedImages = await resolveMediaUrls(editImages);
      let resolvedVideo = "";
      if (editVideoUrl) {
        if (editVideoUrl.startsWith('http://') || editVideoUrl.startsWith('https://') || editVideoUrl.startsWith('/uploads/')) {
          resolvedVideo = editVideoUrl;
        } else {
          resolvedVideo = await uploadFile(editVideoUrl);
        }
      }
      toast.dismiss('edit-upload');

      const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";
      const body = {
        name: editName.trim(),
        stock: parseInt(editStock),
        price: parseFloat(editPrice),
        category: editCategory.trim(),
        brand: editBrand.trim(),
        description: editDescription.trim(),
        image: (resolvedImages.length > 0 ? resolvedImages[0] : editImage.trim()) || undefined,
        images: resolvedImages,
        videoUrl: resolvedVideo,
      };

      let dotNetCategoryId = undefined;
      try {
        const catResp = await fetch(`${API_URL}/Categories`);
        if (catResp.ok) {
          const catData = await catResp.json();
          const catArr = Array.isArray(catData) ? catData : catData?.data ?? catData?.$values ?? [];
          const match = catArr.find(c => c.categoryName?.toLowerCase() === editCategory.trim().toLowerCase());
          if (match) dotNetCategoryId = match.categoryId;
        }
      } catch {}

      const dotNetBody = {
        name: editName.trim(),
        stockQuantity: parsedStock,
        price: parsedPrice,
        brand: editBrand.trim(),
        description: editDescription.trim(),
        imageUrl: (resolvedImages.length > 0 ? resolvedImages[0] : editImage.trim()) || undefined,
        images: resolvedImages,
        videoUrl: resolvedVideo,
        ...(dotNetCategoryId !== undefined ? { categoryId: dotNetCategoryId } : {}),
      };

      let res;
      try {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dotNetBody),
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

              {/* Image Assets */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">
                  Product Images ({editImages.length})
                </label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value=""
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        setEditImages(prev => [...prev, e.target.value.trim()]);
                        e.target.value = "";
                      }
                    }}
                    placeholder="Add image URL and press Enter"
                    className="flex-1 bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white transition-colors font-mono"
                  />
                  <input ref={editFileInputRef} type="file" accept="image/*" multiple onChange={handleEditFileUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {editImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-white dark:bg-gray-800 flex items-center justify-center group">
                        <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[7px] font-bold text-center py-0.5">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wide">Product Video (optional)</label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={editVideoUrl && !editVideoUrl.startsWith('data:') ? editVideoUrl : ''}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="flex-1 bg-gray-55 dark:bg-gray-990 border border-gray-200 dark:border-gray-750 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white transition-colors font-mono"
                  />
                  <input ref={editVideoInputRef} type="file" accept="video/*" onChange={handleEditVideoUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => editVideoInputRef.current?.click()}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 text-gray-400 hover:text-purple-500 transition-all cursor-pointer"
                  >
                    <Play size={16} />
                  </button>
                </div>
                {editVideoUrl && (
                  <div className="flex items-center gap-2 mt-1.5 p-2 bg-gray-50 dark:bg-gray-950 rounded-lg border text-[10px]">
                    <Play size={12} className="text-purple-500" />
                    <span className="truncate flex-1 font-mono text-gray-600 dark:text-gray-300">
                      {editVideoUrl.startsWith('data:') ? 'Uploaded video file' : editVideoUrl}
                    </span>
                    <button type="button" onClick={() => setEditVideoUrl("")} className="text-red-400 hover:text-red-600 font-bold cursor-pointer">Remove</button>
                  </div>
                )}
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
