import { createSlice } from "@reduxjs/toolkit";

const getSavedWishlist = () => {
  try {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState = {
  items: getSavedWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        try {
          localStorage.setItem("wishlist", JSON.stringify(state.items));
        } catch (e) {}
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      try {
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      } catch (e) {}
    },
    clearWishlist: (state) => {
      state.items = [];
      try {
        localStorage.setItem("wishlist", JSON.stringify([]));
      } catch (e) {}
    }
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
