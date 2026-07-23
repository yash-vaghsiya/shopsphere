import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

const extractImage = (p) => {
  const knownKeys = ['image', 'Image', 'ImageUrl', 'imageUrl', 'img', 'img', 'Picture', 'picture', 'photo', 'Photo',
    'url', 'Url', 'ImageURL', 'ImagePath', 'imagePath', 'CoverImage', 'coverImage',
    'Thumbnail', 'thumbnail', 'ThumbnailUrl', 'thumbnailUrl', 'ProductImage', 'productImage',
    'MainImage', 'mainImage', 'ImgUrl', 'imgUrl', 'ImgURL', 'PhotoUrl', 'photoUrl',
    'PictureUrl', 'pictureUrl', 'Src', 'src', 'Source', 'source', 'ImageSrc', 'imageSrc',
    'ImageLink', 'imageLink'];
  for (const key of knownKeys) {
    const val = p[key];
    if (typeof val === 'string' && val.length > 0) return val;
    if (val && typeof val === 'object') {
      const nested = val.url ?? val.Url ?? val.src ?? val.Src ?? val.path ?? val.Path;
      if (typeof nested === 'string' && nested.length > 0) return nested;
    }
  }
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    if (typeof first === 'string') return first;
    return first.url ?? first.Url ?? first.src ?? first.Src ?? first.path ?? first.Path ?? '';
  }
  if (p.Images && Array.isArray(p.Images) && p.Images.length > 0) {
    const first = p.Images[0];
    if (typeof first === 'string') return first;
    return first.url ?? first.Url ?? first.src ?? first.Src ?? first.path ?? first.Path ?? '';
  }
  for (const key of Object.keys(p)) {
    const val = p[key];
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'))) return val;
  }
  return '';
};

const normalizeProduct = (p) => {
  const id = p.id ?? p.Id ?? p.ProductId ?? p.ID ?? p.productId ?? Date.now() + Math.random();
  const image = extractImage(p);

  const rawImages = p.images ?? p.Images ?? [];
  const images = Array.isArray(rawImages)
    ? rawImages.map(i => typeof i === 'string' ? i : i?.url ?? i?.src ?? i?.path ?? '').filter(Boolean)
    : [];
  if (images.length === 0 && typeof image === 'string' && image) images.push(image);

  const videoUrl = p.videoUrl ?? p.video ?? p.VideoUrl ?? p.Video ?? p.productVideo ?? '';

  if (typeof image !== 'string') return { id, name: p.name ?? p.Name ?? '', image: '', images: [], videoUrl: '', price: 0, stock: 0, category: 'General', description: '', brand: '', featured: false, trending: false, rating: 0, reviews: [], originalPrice: 0, createdAt: '' };
  return {
    id,
    name: p.name ?? p.Name ?? p.Title ?? p.productName ?? p.ProductName ?? '',
    description: p.description ?? p.Description ?? p.Desc ?? p.desc ?? '',
    price: p.price ?? p.Price ?? p.unitPrice ?? p.UnitPrice ?? 0,
    image,
    images,
    videoUrl,
    category: p.category ?? p.Category ?? p.cat ?? p.Cat ?? 'General',
    categoryId: p.categoryId ?? p.CategoryId ?? null,
    stock: p.stock ?? p.Stock ?? p.stockQuantity ?? p.StockQuantity ?? p.quantity ?? p.Quantity ?? 0,
    brand: p.brand ?? p.Brand ?? '',
    featured: p.featured ?? p.Featured ?? false,
    trending: p.trending ?? p.Trending ?? false,
    rating: p.rating ?? p.Rating ?? 0,
    reviews: p.reviews ?? p.Reviews ?? [],
    originalPrice: p.originalPrice ?? p.OriginalPrice ?? p.listPrice ?? p.ListPrice ?? p.price ?? p.Price ?? 0,
    createdAt: p.createdAt ?? p.CreatedAt ?? p.createdDate ?? p.CreatedDate ?? '',
  };
};

const getDeletedIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem('deletedProductIds') || '[]')); }
  catch { return new Set(); }
};

const addDeletedId = (id) => {
  try {
    const ids = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
    ids.push(String(id));
    localStorage.setItem('deletedProductIds', JSON.stringify([...new Set(ids)]));
  } catch {}
};

const filterDeleted = (products) => {
  const deleted = getDeletedIds();
  return products.filter((p) => !deleted.has(String(p.id)));
};

const initialState = {
  products: [],
  featuredProducts: [],
  trendingProducts: [],
  currentProduct: null,
  categories: ["Fashion", "Shoes", "Watches", "Gaming", "Accessories", "Phones"],
  loading: false,
  error: null,
};

// Async Thunks
const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.records)) return data.records;
    if (Array.isArray(data.result)) return data.result;
  }
  return null;
};

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchProducts",
  async (params, thunkAPI) => {
    let savedCategories, nameCategories;
    try { savedCategories = JSON.parse(localStorage.getItem('productCategoryMap') || '{}'); } catch { savedCategories = {}; }
    try { nameCategories = JSON.parse(localStorage.getItem('productNameCategoryMap') || '{}'); } catch { nameCategories = {}; }
    try {
      const [prodResp, catResp] = await Promise.all([
        fetch(`/api/products`),
        axiosInstance.get("/api/categories").catch(() => null),
      ]);
      if (prodResp.ok) {
        const data = await prodResp.json();
        const arr = unwrapArray(data);
        if (arr && arr.length > 0) {
          const mapped = arr.map(normalizeProduct);
          if (mapped.some((p) => p.image)) {
            const localCatMap = {};
            if (catResp && catResp.data) {
              const catArr = Array.isArray(catResp.data) ? catResp.data : catResp.data?.data ?? [];
              catArr.forEach(c => { if (c.id != null && c.name) localCatMap[String(c.id)] = c.name; });
            }
            const catNames = Object.values(localCatMap);
            mapped.forEach(p => {
              const key = String(p.id);
              if (savedCategories[key]) {
                p.category = savedCategories[key];
              } else if (nameCategories[p.name?.toLowerCase()]) {
                p.category = nameCategories[p.name.toLowerCase()];
              } else if (p.categoryId != null) {
                if (localCatMap[String(p.categoryId)]) {
                  p.category = localCatMap[String(p.categoryId)];
                } else if (p.category === 'General' && catNames.length === 1) {
                  p.category = catNames[0];
                }
              }
            });
            return filterDeleted(mapped);
          }
        }
      }
    } catch {}
    try {
      const response = await axiosInstance.get("/api/products", { params });
      const arr = Array.isArray(response.data) ? response.data : unwrapArray(response.data) ?? [];
      return filterDeleted(arr.map(normalizeProduct));
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load products"
      );
    }
  }
);

export const fetchProductByIdThunk = createAsyncThunk(
  "products/fetchProductById",
  async (id, thunkAPI) => {
    try {
      const prodResp = await fetch(`${API_URL}/Products/${id}`);
      if (prodResp.ok) {
        const data = await prodResp.json();
        const obj = data?.data ?? data?.value ?? data;
        const normalized = normalizeProduct(obj);
        try {
          const m = JSON.parse(localStorage.getItem('productCategoryMap') || '{}');
          if (m[String(normalized.id)]) { normalized.category = m[String(normalized.id)]; }
          else {
            const n = JSON.parse(localStorage.getItem('productNameCategoryMap') || '{}');
            if (n[normalized.name?.toLowerCase()]) normalized.category = n[normalized.name.toLowerCase()];
          }
        } catch {}
        return normalized;
      }
    } catch {}
    try {
      const response = await axiosInstance.get(`/api/products/${id}`);
      return normalizeProduct(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load product details"
      );
    }
  }
);

export const createProductThunk = createAsyncThunk(
  "products/createProduct",
  async (productData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }
        if (data) {
          const normalized = normalizeProduct(data);
          const cat = productData.category || normalized.category || 'General';
          const imgs = productData.images && productData.images.length > 0 ? productData.images : normalized.images;
          const vid = productData.videoUrl || normalized.videoUrl || '';
          const result = { ...normalized, category: cat, image: normalized.image || productData.image || '', images: imgs, videoUrl: vid };
          try { const m = JSON.parse(localStorage.getItem('productCategoryMap') || '{}'); m[String(result.id)] = cat; localStorage.setItem('productCategoryMap', JSON.stringify(m)); } catch {}
          try { if (productData.name) { const n = JSON.parse(localStorage.getItem('productNameCategoryMap') || '{}'); n[productData.name.trim().toLowerCase()] = cat; localStorage.setItem('productNameCategoryMap', JSON.stringify(n)); } } catch {}
          return result;
        }
        const tempId = Date.now();
        const cat = productData.category || 'General';
        try { const m = JSON.parse(localStorage.getItem('productCategoryMap') || '{}'); m[String(tempId)] = cat; localStorage.setItem('productCategoryMap', JSON.stringify(m)); } catch {}
        try { if (productData.name) { const n = JSON.parse(localStorage.getItem('productNameCategoryMap') || '{}'); n[productData.name.trim().toLowerCase()] = cat; localStorage.setItem('productNameCategoryMap', JSON.stringify(n)); } } catch {}
        return { ...productData, category: cat, id: tempId, image: productData.image || '', images: productData.images || [], videoUrl: productData.videoUrl || '' };
      }
      const errData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errData.message || `Server error ${response.status}`);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to add product");
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/deleteProduct",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) { addDeletedId(id); return id; }
    } catch {}
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      addDeletedId(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    addCategory: (state, action) => {
      const trimmed = action.payload.trim();
      if (trimmed && !state.categories.includes(trimmed)) {
        state.categories.push(trimmed);
      }
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter((cat) => cat !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.products = action.payload;
          state.featuredProducts = action.payload.filter((p) => p && p.featured);
          state.trendingProducts = action.payload.filter((p) => p && p.trending);
        } else {
          console.warn("fetchProductsThunk.fulfilled: action.payload is not a valid array:", action.payload);
          state.products = [];
          state.featuredProducts = [];
          state.trendingProducts = [];
          state.error = "Invalid API response structure: products must be an array.";
        }
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Specific Product Details
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product (Admin)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // Delete product (Admin)
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        const deletedId = Number(action.payload);
        state.products = state.products.filter((p) => Number(p.id) !== deletedId);
        state.featuredProducts = state.featuredProducts.filter((p) => Number(p.id) !== deletedId);
        state.trendingProducts = state.trendingProducts.filter((p) => Number(p.id) !== deletedId);
      });
  },
});

export const { clearCurrentProduct, addCategory, removeCategory } = productSlice.actions;
export default productSlice.reducer;
