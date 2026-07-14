import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ClipboardCheck, ShoppingBag, Eye, Download, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import { axiosInstance } from "../../services/api";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";
import { toast } from "react-hot-toast";

export const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const stateData = location.state || null;
  const orderId = stateData?.orderId || "MOCK-532152";
  const total = stateData?.total || 12450;

  const buildFallbackOrder = () => ({
    id: orderId,
    customerName: stateData?.customerName || "Valued ShopSphere Customer",
    email: stateData?.email || "customer@shopsphere.com",
    items: stateData?.items || [
      {
        productId: 101,
        name: "Aether Aura SoundPod Earbuds",
        price: 129,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      },
    ],
    subtotal: stateData?.subtotal ?? total * 0.82,
    shipping: stateData?.shipping ?? 199,
    tax: stateData?.tax ?? total * 0.18,
    discount: stateData?.discount ?? 0,
    discountPercent: stateData?.discountPercent ?? 0,
    couponCode: stateData?.couponCode ?? '',
    total,
    status: "Processing",
    createdAt: new Date().toISOString(),
    paymentMethod: "Card",
    shippingAddress: stateData?.shippingAddress || {
      fullName: "Valued ShopSphere Customer",
      phone: "+91 98765 43210",
      address: "Silicon Tech Ring Road",
      city: "Bengaluru",
      state: "KA",
      zipCode: "560100",
    },
  });

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [autoDownloaded, setAutoDownloaded] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (stateData?.orderId) {
      setLoading(true);
      resolvedRef.current = false;
      axiosInstance.get(`/api/orders/${stateData.orderId}`)
        .then((res) => {
          if (res.data) {
            resolvedRef.current = true;
            setOrder(res.data);
            try {
              if (res.data.id && res.data.ownerToken) {
                const existing = JSON.parse(localStorage.getItem('orderTokens') || '{}');
                existing[String(res.data.id)] = res.data.ownerToken;
                localStorage.setItem('orderTokens', JSON.stringify(existing));
              }
            } catch (e) {}
            try {
              downloadInvoicePDF(res.data);
              setAutoDownloaded(true);
              toast.success("Automated PDF Invoice compiled & downloaded successfully!");
            } catch (err) {
              console.error("Auto invoice download failed, waiting for user trigger:", err);
            }
          }
        })
        .catch((err) => {
          console.error("Error retrieving detailed invoice information:", err);
        })
        .finally(() => {
          if (!resolvedRef.current) {
            const fb = buildFallbackOrder();
            setOrder(fb);
            try { downloadInvoicePDF(fb); setAutoDownloaded(true); } catch {}
          }
          setLoading(false);
        });
    } else {
      const mockOrderObj = buildFallbackOrder();
      setOrder(mockOrderObj);
    }
  }, [stateData, orderId, total]);

  const triggerDownload = () => {
    if (order) {
      downloadInvoicePDF(order);
      toast.success("Invoice PDF generated successfully!");
    } else {
      toast.error("Waiting for invoice generation pipeline...");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
      
      {/* Animation Success Icon */}
      <div className="flex justify-center">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-500 animate-pulse border border-emerald-150 relative">
          <CheckCircle size={52} className="stroke-[3]" />
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white dark:border-gray-950 shadow-md">
            <FileText size={14} className="stroke-[2.5]" />
          </span>
        </div>
      </div>

      {/* Hero Typography */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Receipt Authorized!
        </h1>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
          <CheckCircle2 size={13} />
          Invoice Bill Compiled Automatically
        </p>
      </div>

      {/* Specifications Block Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl text-left space-y-5 shadow-lg relative overflow-hidden">
        {/* Header Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <ClipboardCheck size={14} className="text-blue-500" />
            Tax Invoice Bill Preview
          </h3>
          <span className="text-[10px] font-bold text-gray-400">
            GST Invoice Receipt
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-gray-400 font-medium">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            Compiling tax invoice breakdown...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Core parameters list */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">Transaction ID</span>
                <span className="text-gray-900 dark:text-white font-mono font-black truncate block">#{orderId}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">Payment Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-[#10b981]">
                  Paid ({order?.paymentMethod || "Prepaid Card"})
                </span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">Billed Customer</span>
                <span className="text-gray-900 dark:text-white font-bold block">{order?.customerName || "Customer"}</span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">Destination Address</span>
                <span className="text-gray-900 dark:text-white font-medium block truncate max-w-[250px]" title={order?.shippingAddress?.address}>
                  {order?.shippingAddress?.address ? `${order.shippingAddress.address}, ${order.shippingAddress.city}` : "Karnataka, India"}
                </span>
              </div>
            </div>

            {/* Line Items Box */}
            {order && order.items && order.items.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pb-1 border-b border-gray-150/40 dark:border-gray-800/45">Purchased Products ({order.items.length})</span>
                <div className="divide-y divide-gray-150/30 dark:divide-gray-800/30 max-h-32 overflow-y-auto pr-1 space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pt-2 first:pt-0">
                      <span className="text-gray-900 dark:text-white font-bold truncate max-w-[220px] sm:max-w-[340px]">
                        {it.name} <span className="text-blue-500 font-black">×{it.quantity}</span>
                      </span>
                      <span className="text-gray-500 font-semibold">{formatCurrency(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoicing mathematics tally */}
            <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-400">Taxable Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order?.subtotal || total * 0.82)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Postage & Delivery Fee</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order?.shipping || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Estimated CGST + SGST (18%)</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order?.tax || total * 0.18)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t text-sm font-black">
                <span className="text-gray-950 dark:text-white">Grand Total Invoice</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(order?.total || total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Download Action Indicator */}
        <div className="pt-2">
          <button
            onClick={triggerDownload}
            type="button"
            className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border-0"
          >
            <Download size={14} className="animate-bounce" />
            Download PDF Invoice Bill
          </button>
        </div>

        {autoDownloaded && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-2 animate-fade-in flex items-center justify-center gap-1">
            <CheckCircle2 size={10} />
            Auto-generated invoice downloaded directly to your device downloads folder!
          </p>
        )}
      </div>

      {/* Helper guide */}
      <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
        A dispatch dispatchment email has been compiled with tracking metrics. Feel free to download your tax invoice receipt above at any time.
      </p>

      {/* Navigation action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          to="/cart"
          state={{ activeTab: "track", orderId }}
          className="px-5 py-3 border border-gray-250 dark:border-gray-750 text-gray-750 dark:text-gray-300 font-black text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none"
        >
          <Eye size={13} />
          Track Live Delivery
        </Link>
        <Link
          to="/shop"
          className="px-5 py-3 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none"
        >
          <ShoppingBag size={13} />
          Keep Navigating Shop
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
