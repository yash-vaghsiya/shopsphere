import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist, clearWishlist } from "../features/wishlist/wishlistSlice";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  const toggleWishlist = (product) => {
    const isWishlisted = items.some((item) => item.id === product.id);
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const isInWishlist = (productId) => {
    return items.some((item) => item.id === productId);
  };

  const clearAll = () => {
    dispatch(clearWishlist());
  };

  return {
    items,
    toggleWishlist,
    isInWishlist,
    clearAll,
  };
};

export default useWishlist;
