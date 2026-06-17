import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/products/productSlice";
import cartReducer from "../features/cart/cartSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";
import orderReducer from "../features/orders/orderSlice";
import currencyReducer from "../features/currency/currencySlice";

const rootReducer = {
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer,
  currency: currencyReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export const AppDispatch = store.dispatch;
export const RootState = store.getState();

