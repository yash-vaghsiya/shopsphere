import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";

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
export const fetchProductsThunk = createAsyncThunk(
  "products/fetchProducts",
  async (params, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/api/products", { params });
      return response.data; // Expected: Product[]
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
      const response = await axiosInstance.get(`/api/products/${id}`);
      return response.data; // Expected: Product
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
      const response = await axiosInstance.post("/api/products", productData);
      return response.data;
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
