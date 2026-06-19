import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Cart API helpers — route through local server (server proxies to external API)
const cartRead = async () => fetch("/api/cart");

const cartWrite = async (items) => {
  return fetch("/api/cart/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
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

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantityToAdd;
      } else {
        const newItem = {
          id: action.payload.id,
          name: action.payload.name || "Product",
          price: Number(action.payload.price) || 0,
          image: action.payload.image || "",
          quantity: quantityToAdd,
        };
        state.items.push(newItem);
      }
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try { localStorage.setItem("cart", JSON.stringify(state.items)); } catch {}
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try { localStorage.setItem("cart", JSON.stringify(state.items)); } catch {}
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      try { localStorage.setItem("cart", JSON.stringify(state.items)); } catch {}
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      try { localStorage.removeItem("cart"); } catch {}
    },

    syncCartToServer: (state) => {
      if (state.items.length > 0) {
        cartWrite(state.items).catch(() => {});
      } else {
        cartWrite([]).catch(() => {});
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        const totals = calculateTotals(action.payload);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.loading = false;
      })
      .addCase(fetchCartThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, syncCartToServer } = cartSlice.actions;
export default cartSlice.reducer;
