export const APP_NAME = "ShopSphere";
export const APP_VERSION = "1.0.0";
export const DEFAULT_PAGE_SIZE = 12;
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const SUPPORT_EMAIL = "support@shopsphere.com";
export const SUPPORT_PHONE = "+91 9999999999";

export const ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
};

export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  PRODUCT: "/product/:id",
  LOGIN: "/login",
  REGISTER: "/register",
  CART: "/cart",
  WISHLIST: "/wishlist",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  ORDERS: "/orders",
  ADMIN: "/admin",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    PROFILE: "/api/auth/me",
  },
  PRODUCTS: {
    ALL: "/api/products",
    DETAIL: (id) => `/api/products/${id}`,
    FEATURED: "/api/products/featured",
    TRENDING: "/api/products/trending",
  },
  CATEGORIES: {
    ALL: "/api/categories",
  },
  CART: {
    ALL: "/api/cart",
  },
  ORDERS: {
    ALL: "/api/orders",
    DETAIL: (id) => `/api/orders/${id}`,
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
    CHART: "/api/dashboard/chart",
  }
};
