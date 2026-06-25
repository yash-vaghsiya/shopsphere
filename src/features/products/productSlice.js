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
  if (typeof image !== 'string') return { id, name: p.name ?? p.Name ?? '', image: '', price: 0, stock: 0, category: 'General', description: '', brand: '', featured: false, trending: false, rating: 0, reviews: [], originalPrice: 0, createdAt: '' };
  return {
    id,
    name: p.name ?? p.Name ?? p.Title ?? p.productName ?? p.ProductName ?? '',
    description: p.description ?? p.Description ?? p.Desc ?? p.desc ?? '',
    price: p.price ?? p.Price ?? p.unitPrice ?? p.UnitPrice ?? 0,
    image,
    category: p.category ?? p.Category ?? p.cat ?? p.Cat ?? 'General',
    stock: p.stock ?? p.Stock ?? p.quantity ?? p.Quantity ?? p.StockQuantity ?? 0,
    brand: p.brand ?? p.Brand ?? '',
    featured: p.featured ?? p.Featured ?? false,
    trending: p.trending ?? p.Trending ?? false,
    rating: p.rating ?? p.Rating ?? 0,
    reviews: p.reviews ?? p.Reviews ?? [],
    originalPrice: p.originalPrice ?? p.OriginalPrice ?? p.listPrice ?? p.ListPrice ?? (p.price ?? p.Price ?? 0) * 1.25,
    createdAt: p.createdAt ?? p.CreatedAt ?? p.createdDate ?? p.CreatedDate ?? '',
  };
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
    try {
      const response = await fetch(`${API_URL}/Products`);
      if (response.ok) {
        const data = await response.json();
        const arr = unwrapArray(data);
        if (arr && arr.length > 0) {
          const mapped = arr.map(normalizeProduct);
          if (mapped.some((p) => p.image)) return mapped;
        }
      }
    } catch {}
    try {
      const response = await axiosInstance.get("/api/products", { params });
      const arr = Array.isArray(response.data) ? response.data : unwrapArray(response.data) ?? [];
      return arr.map(normalizeProduct);
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
      const response = await fetch(`${API_URL}/Products/${id}`);
      if (response.ok) {
        const data = await response.json();
        const obj = data?.data ?? data?.value ?? data;
        return normalizeProduct(obj);
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
      const response = await fetch(`${API_URL}/Products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        const data = await response.json();
        const obj = data?.data ?? data?.value ?? data;
        const normalized = normalizeProduct(obj);
        return { ...normalized, image: normalized.image || productData.image || '' };
      }
    } catch {}
    try {
      const response = await axiosInstance.post("/api/products", productData);
      return normalizeProduct(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add product"
      );
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/deleteProduct",
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/Products/${id}`, { method: "DELETE" });
      if (response.ok) return id;
    } catch {}
    try {
      await axiosInstance.delete(`/api/products/${id}`);
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
