import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart, syncCartToServer } from "../features/cart/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems, loading } = useSelector((state) => state.cart);

  const addItem = useCallback((product) => {
    dispatch(addToCart(product));
    // Sync to server asynchronously
    setTimeout(() => {
      const updated = JSON.parse(localStorage.getItem("cart") || "[]");
      syncCartToServer(updated);
    }, 0);
  }, [dispatch]);

  const removeItem = useCallback((id) => {
    dispatch(removeFromCart(id));
    setTimeout(() => {
      const updated = JSON.parse(localStorage.getItem("cart") || "[]");
      syncCartToServer(updated);
    }, 0);
  }, [dispatch]);

  const updateItemQuantity = useCallback((id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
    setTimeout(() => {
      const updated = JSON.parse(localStorage.getItem("cart") || "[]");
      syncCartToServer(updated);
    }, 0);
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearCart());
    syncCartToServer([]);
  }, [dispatch]);

  return {
    items,
    totalAmount,
    totalItems,
    loading,
    addItem,
    removeItem,
    updateItemQuantity,
    clearAll,
  };
};

export default useCart;
