import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart} from "../features/cart/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state) => state.cart);

  const addItem = (product) => {
    dispatch(addToCart(product));
  };

  const removeItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const updateItemQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const clearAll = () => {
    dispatch(clearCart());
  };

  return {
    items,
    totalAmount,
    totalItems,
    addItem,
    removeItem,
    updateItemQuantity,
    clearAll,
  };
};

export default useCart;
