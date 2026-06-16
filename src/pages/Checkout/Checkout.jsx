import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { createOrderThunk } from "../../features/orders/orderSlice";
import { ShippingForm, PaymentForm, BillingSummary } from "../../components/checkout/CheckoutComponents";
import { Button } from "../../components/common/Button";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { CreditCard, ArrowLeft, BadgeCheck } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";

export const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { items, totalAmount, clearAll } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [submitting, setSubmitting] = useState(false);

  // UPI Specific States
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [upiCountdown, setUpiCountdown] = useState(300); // 5 minutes (300s)
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Card Specific States
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardStep, setCardStep] = useState("details");
  const [cardOtp, setCardOtp] = useState("");
  const [authorizingCard, setAuthorizingCard] = useState(false);

  // Extract coupon discount passed from CartSummary state
  const stateData = location.state || null;
  const discountPercent = stateData?.discountPercent || 0;

  // Protect route
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your shopping bag is empty. Add products before checkout.");
      navigate("/cart");
    }
  }, [items.length, navigate]);

  // UPI countdown timer loop
  useEffect(() => {
    let interval;
    if (showUpiModal && upiCountdown > 0 && !paymentSuccess) {
      interval = setInterval(() => {
        setUpiCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showUpiModal && upiCountdown === 0) {
      toast.error("UPI Payment session expired. Please try again.");
      setShowUpiModal(false);
      setUpiCountdown(300);
    }
    return () => clearInterval(interval);
  }, [showUpiModal, upiCountdown, paymentSuccess]);

  // Set default initial values if user pre-configured profile address
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
    },
  });

  // Calculate pricing elements
  const subtotal = totalAmount;
  const discountAmount = subtotal * discountPercent;
  const shipping = subtotal > 4999 ? 0 : 250;
  const tax = (subtotal - discountAmount) * 0.18;
  const finalTotal = subtotal - discountAmount + shipping + tax;

  // Helper formatting for count
  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlaceOrder = async (data) => {
    setSubmitting(true);
    
    const customerOrderData = {
      customerName: data.fullName,
      email: user?.email || "guest@shopsphere.com",
      items: items.map((it) => ({
        productId: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      })),
      subtotal,
      shipping,
      tax,
      discount: discountAmount,
      discountPercent,
      total: finalTotal,
      status: "Pending",
      paymentMethod,
      couponCode: stateData?.appliedCoupon || undefined,
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    };

    try {
      // Dispatch creating orders action
      const resultAction = await dispatch(createOrderThunk(customerOrderData)).unwrap();
      
      // Clear shopping cart
      clearAll();
      
      toast.success("Order processed successfully!");
      // Redirect with order statistics passed to success page
      navigate("/checkout/success", { state: { orderId: resultAction.id, total: finalTotal } });
    } catch (err) {
      toast.error(err || "Failed to process e-commerce checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  const onFormSubmit = (data) => {
    setPendingFormData(data);
    if (paymentMethod === "UPI") {
      setUpiCountdown(300);
      setSimulatingPayment(false);
      setPaymentSuccess(false);
      setShowUpiModal(true);
    } else if (paymentMethod === "Card") {
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName(data.fullName || "");
      setCardStep("details");
      setCardOtp("");
      setAuthorizingCard(false);
      setShowCardModal(true);
    } else {
      handlePlaceOrder(data);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format into groups of 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handleCardPaySubmit = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Please enter a valid 16-digit card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Please enter expiry in MM/YY format.");
      return;
    }
    if (cardCvv.length < 3) {
      toast.error("Please enter a 3-digit CVV card validation code.");
      return;
    }
    if (!cardName.trim()) {
      toast.error("Please enter the cardholder's full name.");
      return;
    }

    setAuthorizingCard(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAuthorizingCard(false);
    setCardStep("otp");
    toast.success("Safe 3D Secure dynamic transaction PIN dispatched to your phone (SMS)!");
  };

  const handleCardOtpSubmit = async (e) => {
    e.preventDefault();
    if (cardOtp !== "123456" && cardOtp.length !== 6) {
      toast.error("Invalid transaction security PIN. Hint: Enter 123456.");
      return;
    }

    setAuthorizingCard(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAuthorizingCard(false);
    setCardStep("success");
    toast.success("Card payment successfully captured by ShopSphere Pay!");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowCardModal(false);
    if (pendingFormData) {
      handlePlaceOrder(pendingFormData);
    }
  };

  const handleSimulatePayment = async () => {
    if (!pendingFormData) return;
    setSimulatingPayment(true);
    
    // Simulate payment transaction validation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSimulatingPayment(false);
    setPaymentSuccess(true);
    
    toast.success("UPI Payment confirmed via merchant webhook!");
    
    // Smooth transition to placing order
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowUpiModal(false);
    handlePlaceOrder(pendingFormData);
  };

  // Generate real dynamic UPI String
  const upiString = `upi://pay?pa=shopsphere@okaxis&pn=ShopSphere%20Marketplace&am=${finalTotal.toFixed(2)}&cu=INR&tn=ShopSphere-Cart-Payment`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Cart Bag", path: "/cart" },
          { label: "Secure billing", path: "/checkout" },
        ]}
      />

      <div className="pb-4 border-b border-gray-150">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <CreditCard className="text-blue-600" size={22} />
          Encrypted Billing Gateway
        </h1>
        <p className="text-xs text-gray-450 font-bold">
          Input your details and finalize delivery placement parameters securely.
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Forms (takes 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Form Component */}
          <ShippingForm register={register} errors={errors} />

          {/* Payment selector Component */}
          <PaymentForm selectedMethod={paymentMethod} onChangeMethod={setPaymentMethod} />

          <div className="flex justify-start">
            <Link
              to="/cart"
              className="text-xs text-gray-400 hover:text-gray-900 inline-flex items-center gap-1 font-bold"
            >
              <ArrowLeft size={12} />
              Return and review shopping bag
            </Link>
          </div>
        </div>

        {/* Right Side: Billing summary items receipt (takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <BillingSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={finalTotal}
          />

          <Button type="submit" loading={submitting} className="w-full py-4 text-xs font-black shadow-lg">
            <BadgeCheck size={16} className="mr-2" />
            {paymentMethod === "UPI" 
              ? `Proceed to UPI Scan QR (${formatCurrency(finalTotal)})` 
              : `Place Encrypted Order Now (${formatCurrency(finalTotal)})`}
          </Button>
        </div>

      </form>

      {/* --- SPECTACULAR DYNAMIC UPI QR SCAN OVERLAY MODAL --- */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative text-center space-y-5">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-850">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                UPI Secure Gateway
              </span>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                title="Cancel Transaction"
              >
                <ArrowLeft size={16} />
              </button>
            </div>

            {/* Core Billing Parameters */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Transfer Recipient</span>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">ShopSphere Marketplace</h2>
              <p className="text-[11px] font-mono text-gray-500">PA: shopsphere@okaxis</p>
            </div>

            {/* Simulated Smartphone Viewport hosting the generated QR Code */}
            <div className="relative mx-auto w-52 h-52 bg-white p-3.5 border-4 border-blue-500 rounded-3xl shadow-inner flex items-center justify-center overflow-hidden">
              {/* Camera Scanning brackets animation overlay */}
              <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-4 border-l-4 border-blue-600 rounded-tl" />
              <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-4 border-r-4 border-blue-600 rounded-tr" />
              <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-4 border-l-4 border-blue-600 rounded-bl" />
              <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-4 border-r-4 border-blue-600 rounded-br" />

              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-emerald-500 animate-pulse duration-700">
                  <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <BadgeCheck size={48} className="text-[#10b981] animate-bounce" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">SUCCESS!</span>
                </div>
              ) : simulatingPayment ? (
                <div className="flex flex-col items-center justify-center space-y-3 text-blue-500">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-400 animate-pulse">Verifying...</span>
                </div>
              ) : (
                <img 
                  src={qrCodeUrl} 
                  alt="Dynamic UPI QR Code" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Amount details */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-3 rounded-2xl">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Amount to Scan & Pay</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(finalTotal)}</span>
            </div>

            {/* Timer and helper */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Listening for QR scan... Expires in <span className="text-red-500 font-mono">{formatCountdown(upiCountdown)}</span>
              </div>
              <p className="text-[10px] text-gray-400 px-4">
                Scan other phone's screen using your mobile app (GPay, PhonePe, Paytm, or BHIM) to execute a genuine test transfer pre-filled with this INR quantity!
              </p>
            </div>

            {/* Interaction buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={simulatingPayment || paymentSuccess}
                onClick={handleSimulatePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer border-0"
              >
                {simulatingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating Webhook Signature...
                  </>
                ) : paymentSuccess ? (
                  "Payment Captured!"
                ) : (
                  "Simulate Scanning & Payment Confirmation"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold block mx-auto underline cursor-pointer border-0 bg-transparent"
              >
                Cancel & return to billing method
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SPECTACULAR INTERACTIVE CREDIT/DEBIT CARD GATEWAY MODAL --- */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative text-left space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-850">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                <CreditCard size={12} />
                Secure Card Gateway (SSL)
              </span>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                title="Cancel Checkout"
              >
                <ArrowLeft size={16} />
              </button>
            </div>

            {/* Premium Card Face Display Mockup (updates interactively!) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-2xl p-5 shadow-lg space-y-5 relative overflow-hidden max-w-sm mx-auto border border-white/10 select-none">
              {/* Background abstract radial lights */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl" />

              {/* Card Brand Header / Chip */}
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest block">ShopSphere Black Platinum</span>
                  {/* EMV Microchip Graphic */}
                  <div className="w-8 h-6.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-md border border-amber-600/25 relative shadow-inner overflow-hidden flex flex-col justify-between p-1">
                    <div className="flex justify-between h-[30%]">
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                    </div>
                    <div className="h-[1px] bg-amber-800/15 w-full" />
                    <div className="flex justify-between h-[30%]">
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                      <div className="w-[1px] bg-amber-800/15 h-full" />
                    </div>
                  </div>
                </div>

                {/* Card Issuer Logo Indicator (Visa start 4, MC start 5, Amex start 3) */}
                <div className="text-right">
                  {cardNumber.startsWith("4") ? (
                    <span className="text-sm font-black italic tracking-tight text-blue-300">VISA</span>
                  ) : cardNumber.startsWith("5") ? (
                    <span className="text-sm font-black italic tracking-tight text-amber-400">Mastercard</span>
                  ) : cardNumber.startsWith("3") ? (
                    <span className="text-sm font-black italic tracking-tight text-emerald-300">AMEX</span>
                  ) : (
                    <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-0.5 rounded tracking-wide text-gray-300">SecurePay</span>
                  )}
                </div>
              </div>

              {/* Card Number */}
              <div className="py-2">
                <span className="font-mono text-base tracking-widest text-shadow font-extrabold block">
                  {cardNumber || "•••• •••• •••• ••••"}
                </span>
              </div>

              {/* Footer details */}
              <div className="flex justify-between items-end text-xs">
                <div className="space-y-0.5 max-w-[190px]">
                  <span className="text-[7px] text-gray-400 uppercase tracking-widest block font-bold">Cardholder</span>
                  <span className="font-bold truncate block tracking-wide uppercase text-[11px] h-4">
                    {cardName || "VALUED SHOPPER"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-gray-400 uppercase tracking-widest block font-bold">Expiry</span>
                    <span className="font-mono font-bold block text-[11px] h-4">
                      {cardExpiry || "MM/YY"}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-gray-400 uppercase tracking-widest block font-bold">CVV</span>
                    <span className="font-mono font-bold block text-[11px] text-yellow-300 h-4">
                      {cardCvv ? "•••" : "000"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Current Step UI rendering */}
            {cardStep === "details" && (
              <form onSubmit={handleCardPaySubmit} className="space-y-4">
                
                {/* Auto fill hint link */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wide">Enter Card Details</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber("4111 2222 3333 4444");
                      setCardExpiry("12/28");
                      setCardCvv("532");
                      toast.success("Safe practice Mastercard filled instantly!");
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-extrabold flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 select-none active:scale-95 transition-transform"
                    title="Quick Auto-Fill Card Parameters"
                  >
                    ⚡ Demo Auto-Fill (Visa Test Card)
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white font-bold uppercase transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                      placeholder="CARDHOLDER NAME"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">
                      Debit/Credit Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white font-mono font-bold tracking-widest transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                      placeholder="4111 2222 3333 4444"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white font-mono text-center font-bold transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">
                        Security Code (CVV)
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={handleCardCvvChange}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white font-mono text-center font-bold transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authorizingCard}
                  className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                >
                  {authorizingCard ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Establishing SECURE Handshake (SSL)...
                    </>
                  ) : (
                    `Proceed to Secure Verification • ${formatCurrency(finalTotal)}`
                  )}
                </button>
              </form>
            )}

            {cardStep === "otp" && (
              <form onSubmit={handleCardOtpSubmit} className="space-y-4">
                <div className="text-center space-y-2 py-3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full border border-amber-150 flex items-center justify-center mx-auto text-lg animate-pulse">
                    🔑
                  </div>
                  <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200 tracking-wider">
                    Complete 2-Factor OTP Code verification
                  </h3>
                  <p className="text-[10px] text-gray-400 px-6">
                    A dynamic verification token has been issued to cardholder's mobile. Enter the PIN to authorization.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider text-center mb-1.5">
                      6-Digit transaction Security OTP *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={cardOtp}
                      onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-40 mx-auto px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-center text-sm font-mono font-black tracking-[0.4em] transition-all focus:ring-2 focus:ring-blue-500 outline-none block"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCardOtp("123456");
                        toast.success("Hint OTP '123456' auto-entered!");
                      }}
                      className="text-[9px] text-blue-500 font-extrabold block text-center mx-auto mt-2 underline bg-transparent border-0 cursor-pointer"
                    >
                      💡 Use Demo One-Click OTP (Code)
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={authorizingCard}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  >
                    {authorizingCard ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Decrypting Code Packet...
                      </>
                    ) : (
                      "Conform OTP & Complete Purchase"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardStep("details")}
                    className="text-[10px] text-gray-400 hover:text-gray-600 block text-center mx-auto mt-1 bg-transparent border-0 cursor-pointer underline"
                  >
                    Return to back details card entry
                  </button>
                </div>
              </form>
            )}

            {cardStep === "success" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full border border-emerald-150 flex items-center justify-center mx-auto">
                  <BadgeCheck size={36} className="text-[#10b981] animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    PAYMENT CAPTURED!
                  </h3>
                  <p className="text-[10px] text-gray-400 px-6">
                    Credit card verification authorized successfully. Triggering merchant e-store transaction completion...
                  </p>
                </div>
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
