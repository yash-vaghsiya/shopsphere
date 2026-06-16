import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import ThemeProvider from "./context/ThemeContext";
import { CompareProvider } from "./context/CompareContext";
import GlobalBroadcastListener from "./components/common/GlobalBroadcastListener";
import AISphereButler from "./components/common/AISphereButler";
import ProductCompareTray from "./components/products/ProductCompareTray";
import ProductCompareModal from "./components/products/ProductCompareModal";

// Layout Imports
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

// Security Guards
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import GuestRoute from "./routes/GuestRoute";

// Page Imports
import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import ProductDetails from "./pages/Shop/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/Wishlist/Wishlist";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/Checkout/OrderSuccess";
import Orders from "./pages/Orders/Orders";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";

// Auth Page Imports
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Profile Page Imports
import Profile from "./pages/Profile/Profile";

// Admin Page Imports
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminDiscounts from "./pages/Admin/AdminDiscounts";
import AdminBroadcasts from "./pages/Admin/AdminBroadcasts";
import AdminSubscribers from "./pages/Admin/AdminSubscribers";
import AdminQueries from "./pages/Admin/AdminQueries";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <CompareProvider>
          <BrowserRouter>
            <Routes>
              
              {/* 1. Main Storefront Pages & Layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />

                {/* Secure Private Customer Pages */}
                <Route element={<PrivateRoute />}>
                  <Route path="profile" element={<Profile />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="checkout/success" element={<OrderSuccess />} />
                  <Route path="orders" element={<Orders />} />
                </Route>
              </Route>

              {/* 2. Authentication Pages (Guests only) */}
              <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                </Route>
              </Route>

              {/* 3. Administrative Dashboard Panel (Admin status only) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AdminAddProduct />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="discounts" element={<AdminDiscounts />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="broadcasts" element={<AdminBroadcasts />} />
                  <Route path="queries" element={<AdminQueries />} />
                </Route>
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
            
            {/* Global Hot Notifications Stack */}
            <GlobalBroadcastListener />
            <AISphereButler />
            <ProductCompareTray />
            <ProductCompareModal />
          </BrowserRouter>
        </CompareProvider>
      </ThemeProvider>
    </Provider>
  );
}
