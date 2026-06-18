import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

// Cart API helpers – try external API first, fall back to local server
const cartRead = async () => {
  try {
    const res = await fetch(`${API_URL}/Cart`);
    if (res.ok) return res;
  } catch {}
  return fetch("/api/cart");
};

const cartWrite = async (items) => {
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  };
  try {
    const res = await fetch(`${API_URL}/Cart/sync`, opts);
    if (res.ok) return res;
  } catch {}
  return fetch("/api/cart/sync", opts);
};

// Persist cart helper
const getSavedCart = () => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const savedItems = getSavedCart();

const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalAmount };
};

const { totalItems, totalAmount } = calculateTotals(savedItems);

const initialState = {
  items: savedItems,
  totalAmount,
  totalItems,
  loading: false,
};

// Fetch cart from server on app load
export const fetchCartThunk = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartRead();
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          try { localStorage.setItem("cart", JSON.stringify(data)); } catch {}
          return data;
        }
      }
    } catch {}
    // Fall back to localStorage (already in initialState)
    return rejectWithValue("Server cart unavailable, using local");
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id);
      const quantityToAdd = Number.isFinite(Number(action.payload.quantity)) && Number(action.payload.quantity) > 0
        ? Number(action.payload.quantity)
        : 1;

      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity = Number(state.items[existingItemIndex].quantity) + quantityToAdd;
      } else {
        state.items.push({
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          image: action.payload.image || "",
          quantity: quantityToAdd,
        });
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try {
        localStorage.setItem("cart", JSON.stringify(state.items));
      } catch (e) {}
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try {
        localStorage.setItem("cart", JSON.stringify(state.items));
      } catch (e) {}
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        const parsedQuantity = Number(action.payload.quantity);
        item.quantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? Math.max(1, parsedQuantity) : 1;
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try {
        localStorage.setItem("cart", JSON.stringify(state.items));
      } catch (e) {}
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      try {
        localStorage.setItem("cart", JSON.stringify([]));
      } catch (e) {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.loading = false;
      })
      .addCase(fetchCartThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Sync cart to server (call after mutations)
export const syncCartToServer = (items) => {
  cartWrite(items).catch(() => {});
};
