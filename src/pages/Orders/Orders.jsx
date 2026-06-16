import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchOrdersThunk } from "../../features/orders/orderSlice";
import { useAuth } from "../../hooks/useAuth";
import { ChevronDown, ChevronUp, Clock, MapPin, CreditCard, ShoppingBag, Search, ExternalLink, Calendar, Download } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import { Link } from "react-router-dom";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";
import { OrderStatusTracker } from "../../components/orders/OrderStatusTracker";
import { addToCart } from "../../features/cart/cartSlice";
import { toast } from "react-hot-toast";

export const Orders = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDownloadInvoice = (order) => {
    downloadInvoicePDF(order);
  };

  const handleBuyAgain = (order) => {
    order.items.forEach((item) => {
      dispatch(
        addToCart({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        })
      );
    });
    toast.success(`Restocked! All items from order #${order.id} are in your cart.`, {
      icon: "🛒",
      style: {
        fontSize: "12px",
        fontWeight: "700",
      },
    });
  };

  useEffect(() => {
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50";
      case "Processing":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50";
      case "Shipped":
        return "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50";
      case "Delivered":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50";
      case "Cancelled":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/50";
      default:
        return "bg-gray-55 dark:bg-gray-900 text-gray-500 border border-gray-100";
    }
  };

  const visibleOrders = user?.role === "Admin"
    ? orders
    : orders.filter((order) => String(order.userId) === String(user?.id) || order.email === user?.email);

  const filteredOrders = visibleOrders.filter((order) =>
    String(order.id).toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 min-h-[60vh]">
      
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-1.5 pb-4 border-b border-gray-105 dark:border-gray-850">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Your Invoiced Orders
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Trace transactional metrics, shipment states, and invoices
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Syncing Transactions...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-955/30 border border-rose-100 dark:border-rose-950/50 rounded-2xl space-y-4">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{error}</p>
          <button
            onClick={() => dispatch(fetchOrdersThunk())}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 select-none"
          >
            Retry Fetch
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-full text-gray-400">
              <ShoppingBag size={40} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-gray-900 dark:text-white">No Transactions Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              There are no orders associated with this account yet. Place an order to track invoices and shipments.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all select-none"
          >
            Start Shipping List
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Search HUD utility */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-gray-400 dark:text-gray-500">
              No matching logged transactions for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                  >
                    {/* Collapsed Header Summary bar */}
                    <div
                      onClick={() => toggleOrderExpand(order.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-850/30 cursor-pointer select-none"
                    >
                      <div className="grid grid-cols-2 md:flex md:items-center gap-x-4 gap-y-2 md:gap-8">
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Transaction ID</span>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px] mt-0.5">
                            #{order.id}
                          </h4>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                            <Clock size={10} /> Invoiced Date
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5 block whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Net Amount</span>
                          <span className="text-xs font-black text-blue-600 block mt-0.5">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyAgain(order);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-xs hover:shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          title="Reorder all items in this purchase instantly"
                        >
                          <ShoppingBag size={11} className="shrink-0" />
                          Buy Again
                        </button>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Order Details Panel */}
                    {isExpanded && (
                      <div className="p-5 border-t border-gray-100 dark:border-gray-850 bg-gray-50/30 dark:bg-gray-955/20 space-y-6">
                        
                        {/* Action controllers row */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-200 dark:border-gray-800 gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                              Order Management Actions
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                              Download a high-contrast billing invoice PDF or add all items back to shopping bag.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyAgain(order);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-sm hover:shadow active:scale-95 transition-all select-none cursor-pointer"
                            >
                              <ShoppingBag size={13} className="shrink-0" />
                              Buy Items Again
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadInvoice(order);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-sm hover:shadow active:scale-95 transition-all select-none cursor-pointer"
                            >
                              <Download size={13} className="shrink-0" />
                              Download Invoice
                            </button>
                          </div>
                        </div>

                        {/* Real-time Order Live Delivery Tracker HUD */}
                        <OrderStatusTracker order={order} />

                        {/* 1. Items ordered List */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-gray-450 dark:text-gray-500 tracking-widest pb-1 border-b">
                            Procured Items ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
                          </h5>
                          <div className="divide-y divide-gray-100 dark:divide-gray-850">
                            {order.items.map((item) => (
                              <div key={item.productId} className="py-3 flex items-center gap-4 text-xs font-semibold">
                                <div className="w-12 h-12 rounded-lg border bg-white p-1 flex items-center justify-center shrink-0">
                                  <img src={item.image} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-bold text-gray-900 dark:text-white truncate">
                                    {item.name}
                                  </h6>
                                  <span className="text-xs text-gray-450">
                                    {formatCurrency(item.price)} × {item.quantity}
                                  </span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white shrink-0">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Grid split details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          
                          {/* Shipping address info */}
                          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-xl space-y-3 shadow-2xs">
                            <h6 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                              <MapPin size={11} className="text-blue-500" />
                              Delivery Destination
                            </h6>
                            <div className="text-xs text-gray-600 dark:text-gray-350 space-y-1 font-semibold leading-relaxed">
                              <p className="font-extrabold text-gray-800 dark:text-white">{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                              <p className="text-[10px] text-gray-400 mt-1">Tel: {order.shippingAddress.phone}</p>
                            </div>
                          </div>

                          {/* Order costing calculations */}
                          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-xl space-y-2 shadow-2xs text-xs font-semibold">
                            <h6 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 pb-1 border-b">
                              <CreditCard size={11} className="text-emerald-500" />
                              Billing parameters
                            </h6>
                            
                            <div className="flex justify-between text-gray-400">
                              <span>Subtotal</span>
                              <span className="text-gray-700 dark:text-gray-250 font-bold">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Postage & Handling</span>
                              <span className="text-gray-700 dark:text-gray-250 font-bold">{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Tax (GST)</span>
                              <span className="text-gray-700 dark:text-gray-250 font-bold">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between border-t dark:border-gray-850 pt-2 font-black text-xs">
                              <span className="text-gray-900 dark:text-white">Amount Charged</span>
                              <span className="text-blue-600">{formatCurrency(order.total)}</span>
                            </div>

                            <div className="pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                              <span>Method</span>
                              <span>{order.paymentMethod || "Digital Prepaid Card"}</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Orders;
