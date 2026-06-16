import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { addCategory, removeCategory } from "../../features/products/productSlice";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Trash2, Plus, Box, FolderPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminCategories = () => {
  const dispatch = useDispatch();
  const categoriesList = useSelector((state) => state.products.categories);
  const products = useSelector((state) => state.products.products);
  const [newCategory, setNewCategory] = useState("");

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (categoriesList.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists in stock catalog");
      return;
    }

    dispatch(addCategory(trimmed));
    setNewCategory("");
    toast.success(`Category "${trimmed}" successfully cataloged!`);
  };

  const handleDeleteCategory = (cat) => {
    // Prevent deletion of categories with attached products
    const hasProducts = products.some(p => p.category.toLowerCase() === cat.toLowerCase());
    if (hasProducts) {
      toast.error(`Cannot delete category "${cat}" because active catalog products still belong to it!`);
      return;
    }

    if (window.confirm(`Are you sure you want to deallocate category "${cat}"?`)) {
      dispatch(removeCategory(cat));
      toast.success(`Category "${cat}" removed from active listing!`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* 1. Add Category Form */}
      <div className="md:col-span-1 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Log New Collection
          </h2>
          <p className="text-xs text-gray-400">
            Define secondary collection categories
          </p>
        </div>

        <form onSubmit={handleCreateCategory} className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <Input
            label="Category Name *"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Smart Watches"
          />
          <Button type="submit" className="w-full flex items-center justify-center gap-1.5">
            <Plus size={14} />
            Authorize Category
          </Button>
        </form>
      </div>

      {/* 2. Categories List table */}
      <div className="md:col-span-2 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderPlus size={18} className="text-blue-500" />
            Active Collection Categories
          </h2>
          <p className="text-xs text-gray-400">
            Current filter tags registered in Shop index
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-gray-850">
          {categoriesList.map((cat) => (
            <div key={cat} className="p-4 flex items-center justify-between hover:bg-gray-50/30 dark:hover:bg-gray-955/20 transition-all font-semibold text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-lg">
                  <Box size={14} />
                </div>
                <span className="text-gray-900 dark:text-white">{cat}</span>
              </div>
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/45 rounded-md transition-colors"
                title="Remove Category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminCategories;
