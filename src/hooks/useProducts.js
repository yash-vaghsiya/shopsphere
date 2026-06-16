import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  createProductThunk,
  deleteProductThunk,
  clearCurrentProduct,
} from "../features/products/productSlice";

export const useProducts = () => {
  const dispatch = useDispatch();
  const {
    products,
    featuredProducts,
    trendingProducts,
    currentProduct,
    categories,
    loading,
    error,
  } = useSelector((state) => state.products);

  const fetchProducts = (params) => {
    dispatch(fetchProductsThunk(params));
  };

  const fetchProductById = (id) => {
    dispatch(fetchProductByIdThunk(id));
  };

  const createProduct = (productData) => {
    return dispatch(createProductThunk(productData)).unwrap();
  };

  const deleteProduct = (id) => {
    return dispatch(deleteProductThunk(id)).unwrap();
  };

  const clearSelectedProduct = () => {
    dispatch(clearCurrentProduct());
  };

  return {
    products,
    featuredProducts,
    trendingProducts,
    currentProduct,
    categories,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    deleteProduct,
    clearSelectedProduct,
  };
};

export default useProducts;
