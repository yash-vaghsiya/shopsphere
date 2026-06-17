import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { CartItem } from "../../components/cart/CartItem";
import { CartSummary } from "../../components/cart/CartSummary";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { 
  ShoppingBag, 
  ChevronLeft, 
  Trash2, 
  Radio, 
  Compass, 
  Search, 
  ArrowRight,
  AlertCircle,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../services/api";
import { OrderStatusTracker } from "../../components/orders/OrderStatusTracker";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency, formatDate } from "../../utils/format";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";

export const Cart = () => {
  const { items, totalItems, clearAll } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Tab controller state
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("cart");

  // Telemetry track states
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const { isAuthenticated, user } = useAuth();

  const handleClearCart = () => {
    clearAll();
    toast.success("All items removed from your shopping bag.");
    setShowClearConfirm(false);
  };

  const selectOrderToTrack = (id) => {
    setOrderId(id);
    setLoading(true);
    setTrackedOrder(null);
    axiosInstance.get(`/api/orders/${id}`)
      .then((response) => {
        if (response.data) {
          setTrackedOrder(response.data);
          toast.success("Downlink established! Active tracking loaded.");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Could not retrieve order details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Sync state if routing with dynamic location state parameter
  useEffect(() => {
    const routeState = location.state || null;
    if (routeState?.activeTab) {
      setActiveTab(routeState.activeTab);
    }
    if (routeState?.orderId) {
      setActiveTab("track");
      selectOrderToTrack(routeState.orderId);
    }
  }, [location.state]);

  // Load user order registry history for fast select
  useEffect(() => {
    if (isAuthenticated) {
      axiosInstance.get("/api/orders")
        .then((response) => {
          if (Array.isArray(response.data)) {
            setMyOrders(response.data);
          }
        })
        .catch(() => {
          // Fail silently
        });
    }
  }, [isAuthenticated, activeTab]);

  const visibleMyOrders = user?.role === "Admin"
    ? myOrders
    : myOrders.filter((order) => String(order.userId) === String(user?.id) || order.email === user?.email);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    setLoading(true);
    setTrackedOrder(null);
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId.trim()}`);
      if (response.data) {
        setTrackedOrder(response.data);
        toast.success("Order telemetry successfully retrieved.");
      } else {
        toast.error("Order ID not found in registry.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. Check the ID and try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <Breadcrumb items={[{ label: "Shopping Terminal", path: "/cart" }]} />

      {/* Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-150 dark:border-gray-850">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 leading-none">
            {activeTab === "cart" ? (
              <>
                <ShoppingBag className="text-blue-600" size={24} />
                Shopping Bag ({totalItems})
              </>
            ) : (
              <>
                <Radio className="text-blue-600 animate-pulse" size={24} />
                Live Telemetry Tracking
              </>
            )}
          </h1>
          <p className="text-xs text-gray-450 font-bold">
            {activeTab === "cart" 
              ? "Premium tech gadgets and custom orders waiting for billing checkout"
              : "Locate and fetch real-time carrier status updates, GPS coords, and logs"}
          </p>
        </div>

        {/* The elegant Tabs Button Group */}
        <div className="flex p-0.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider select-none cursor-pointer border-0 transition-all outline-none ${
              activeTab === "cart"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <ShoppingBag size={13} />
            Bag Items ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider select-none cursor-pointer border-0 transition-all outline-none ${
              activeTab === "track"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Radio size={13} className={activeTab === "track" ? "animate-pulse text-blue-600" : ""} />
            Track Package
          </button>
        </div>
      </div>

      {/* Render selected active state tab */}
      {activeTab === "cart" ? (
        /* SHOPPING BAG VIEW TAB */
        items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border border-gray-150 dark:border-gray-850">
            <div className="p-4 bg-gray-100 dark:bg-gray-850 rounded-full text-gray-400">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Your Bag is Empty</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              There are no products added to your cart yet. Head back to our collections shelf to explore top gadgets.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center select-none shadow-blue-500/10 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          /* Grid Display list items + summary panel */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items list array (takes 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 px-5 py-3.5 rounded-xl">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Selected Cargo Items</span>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-wider font-black uppercase text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-150 dark:border-red-900/30 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 size={11} />
                  Empty Bag
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="pt-3">
                <Link
                  to="/shop"
                  className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Pricing calculations summary (takes 4 cols) */}
            <div className="lg:col-span-4">
              <CartSummary />
            </div>

          </div>
        )
      ) : (
        /* ORDER TRACKER TELEMETRY VIEW TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left search terminal forms (takes 4 cols) */}
          <div className="lg:col-span-4 space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b pb-3">
                <Compass size={14} className="text-blue-500" />
                Registry Search Terminal
              </h3>

              <form onSubmit={handleSearch} className="space-y-4">
                <Input
                  label="Enter Order ID *"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-1002"
                  required
                  className="font-mono text-xs uppercase"
                />

                <Button type="submit" loading={loading} className="w-full py-3">
                  <Search size={14} className="mr-2" />
                  Request TrackOrder 
                </Button>
              </form>

              <div className="text-[10px] text-gray-400 leading-relaxed font-semibold bg-gray-50/50 dark:bg-gray-950/40 p-3 rounded-xl border border-dashed border-gray-200">
                A custom reference transaction identifier can be extracted from checkout receipts, invoice receipts or register alerts.
              </div>
            </div>

            {/* Local recent order list if authenticated */}
            {isAuthenticated && visibleMyOrders.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Select Order from Registry
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-850 max-h-60 overflow-y-auto pr-1">
                  {visibleMyOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="w-full py-2.5 flex items-center justify-between border-b last:border-b-0 border-gray-100 dark:border-gray-850 text-xs font-semibold group"
                    >
                      <button
                        type="button"
                        onClick={() => selectOrderToTrack(order.id)}
                        className="text-left flex-1 min-w-0 bg-transparent border-0 cursor-pointer p-0 select-none hover:text-blue-600 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-gray-900 dark:text-white uppercase">
                            {order.id}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {formatDate(order.createdAt)} • {formatCurrency(order.total)}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            downloadInvoicePDF(order);
                            toast.success(`Invoice for order #${order.id} downloaded!`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all border-0 cursor-pointer bg-transparent"
                          title="Instant Search Invoice Download"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => selectOrderToTrack(order.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all border-0 cursor-pointer bg-transparent"
                          title="Track Package Details"
                        >
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Live HUD graphics display panel (takes 8 cols) */}
          <div className="lg:col-span-8">
            {trackedOrder ? (
              <div className="space-y-6">
                
                {/* Meta details banner */}
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-sm text-xs font-bold leading-none">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Carrier Link</span>
                    <span className="text-gray-950 dark:text-white uppercase tracking-wider font-extrabold text-sm">ShopSphere SAT</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Declared Value</span>
                    <span className="text-blue-650 dark:text-blue-400 text-sm font-black">{formatCurrency(trackedOrder.total)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Subscriber E-Mail</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold truncate max-w-[150px] sm:max-w-[190px] block">{trackedOrder.email}</span>
                  </div>
                  <div className="w-full sm:w-auto">
                    <button
                      onClick={() => {
                        downloadInvoicePDF(trackedOrder);
                        toast.success(`Invoice for order #${trackedOrder.id} downloaded successfully!`);
                      }}
                      type="button"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all border-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer w-full text-center"
                    >
                      <Download size={12} className="stroke-[2.5]" />
                      Download Invoice
                    </button>
                  </div>
                </div>

                {/* Main status component viewer logic */}
                <OrderStatusTracker order={trackedOrder} />

              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-950/55 text-gray-400 dark:text-gray-600 rounded-full">
                  <Compass size={32} className="animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <p className="font-extrabold text-gray-800 dark:text-white tracking-tight">Telemetry Offline</p>
                  <p className="text-xs text-gray-500 leading-normal">
                    Enter an active transaction reference code in the search registry terminal to initiate standard satellite carrier tracking.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Clear Bag Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Empty Shopping Bag"
        message="Are you sure you want to remove all items from your shopping bag? This cannot be undone."
        confirmText="Empty Bag"
        cancelText="Cancel"
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};

export default Cart;
