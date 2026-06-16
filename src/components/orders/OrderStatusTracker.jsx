import React, { useState, useEffect, useRef } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Radio, 
  Compass, 
  Navigation,
  Sparkles,
  RefreshCw,
  Zap,
  Bell,
  BellRing,
  BellOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";

const CITY_COORDINATES = {
  mumbai: { lat: 19.0760, lon: 72.8777 },
  delhi: { lat: 28.7041, lon: 77.1025 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  surat: { lat: 21.1702, lon: 72.8311 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  pune: { lat: 18.5204, lon: 73.8567 },
};

export const OrderStatusTracker = ({ order }) => {
  if (!order) {
    return (
      <div className="w-full bg-slate-50/50 dark:bg-gray-950/30 p-5 rounded-2xl border border-gray-150 dark:border-gray-850">
        <div className="text-center text-sm font-semibold text-gray-500">No order data available to track.</div>
      </div>
    );
  }

  const cityLower = (order.shippingAddress?.city || "").toString().trim().toLowerCase();
  const baseCoord = CITY_COORDINATES[cityLower] || { lat: 20.5937, lon: 78.9629 }; // Default India center

  // Real-time local state simulation values
  const [simStatus, setSimStatus] = useState(order.status);
  const [latOffset, setLatOffset] = useState(0);
  const [lonOffset, setLonOffset] = useState(0);
  const [countdown, setCountdown] = useState(340); // 5 mins 40 seconds initial ETA
  const [isSpeedMode, setIsSpeedMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const logContainerRef = useRef(null);

  // User notification subscription state
  const [isSubscribed, setIsSubscribed] = useState(() => {
    try {
      const saved = localStorage.getItem(`subscribed-order-${String(order.id || "")}`);
      return saved === "true";
    } catch {
      return false;
    }
  });

  // Track the previous status so we only notify on actual changes
  const prevStatusRef = useRef(order.status);

  // Dynamic selected interactive step tracking
  const [activeInteractiveStep, setActiveInteractiveStep] = useState("Placed");

  // Keep interactive step synchronized with simStatus updates
  useEffect(() => {
    if (simStatus === "Pending") setActiveInteractiveStep("Placed");
    else if (simStatus === "Processing") setActiveInteractiveStep("Processing");
    else if (simStatus === "Shipped") setActiveInteractiveStep("Shipped");
    else if (simStatus === "Delivered") setActiveInteractiveStep("Delivered");
  }, [simStatus]);

  const handleStepClick = (step) => {
    setActiveInteractiveStep(step);
    
    let targetStatus = "Pending";
    if (step === "Placed") targetStatus = "Pending";
    else if (step === "Processing") targetStatus = "Processing";
    else if (step === "Shipped") targetStatus = "Shipped";
    else if (step === "Delivered") targetStatus = "Delivered";

    setSimStatus(targetStatus);
    setLogs((prev) => [
      ...prev,
      `[Timeline Interactive Action] Overrode transaction state to [${step}] (${targetStatus === "Pending" ? "Placed" : targetStatus}).`
    ]);
    toast.success(`Active shipping tracking updated to: ${step}!`, { icon: "📍" });
  };

  // Sync state if order prop database status changes
  useEffect(() => {
    setSimStatus(order.status || "Pending");
    prevStatusRef.current = order.status || "Pending"; // Sync previous status ref so we don't notify immediately on load/switch
    const initialLog = `Tracking initiated for Transaction #${String(order.id || "unknown")}. Initial state: ${order.status || "Pending"}.`;
    setLogs([initialLog]);

    try {
      const saved = localStorage.getItem(`subscribed-order-${String(order.id || "")}`);
      setIsSubscribed(saved === "true");
    } catch {
      setIsSubscribed(false);
    }
  }, [order]);

  // Notify when simStatus updates
  useEffect(() => {
    // If status hasn't actually changed, return
    if (simStatus === prevStatusRef.current) return;

    const oldStatus = prevStatusRef.current;
    prevStatusRef.current = simStatus;

    if (isSubscribed) {
      const message = 
        simStatus === "Processing" ? "Warehouse confirmation complete. Materials sealed." :
        simStatus === "Shipped" ? "Couriers scanned package. Carrier dispatch active." :
        simStatus === "Delivered" ? "Arrived at destination foyer. Digital signature received." :
        simStatus === "Pending" ? "Simulation loop recycled to Pending." :
        "Order status updated.";

      // 1. Toast Notification (always nice, reliable and works inside sandboxed iframes)
      toast.success(`🔔 Order #${order.id} is now ${simStatus}!`, {
        duration: 5000,
        position: "top-center",
        icon: "🔔"
      });

      // 2. Native browser Notification if supported & granted
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification(`Order #${order.id} Updated`, {
              body: `Status is now: ${simStatus}. ${message}`,
              icon: "/favicon.ico"
            });
          } catch (err) {
            console.warn("Could not dispatch native notification:", err);
          }
        }
      }

      setLogs((prev) => [...prev, `[Notification Sent] Alerted subscriber of status alteration to: ${simStatus}.`]);
    }
  }, [simStatus, isSubscribed, order.id]);

  const handleToggleSubscription = async () => {
    const nextSubscribed = !isSubscribed;
    setIsSubscribed(nextSubscribed);
    
    try {
      localStorage.setItem(`subscribed-order-${order.id}`, String(nextSubscribed));
    } catch (err) {
      console.warn("Storage limits or sandboxing blocked writing subscription state:", err);
    }

    if (nextSubscribed) {
      toast.success("Subscribed to status update alerts!", { icon: "🔔" });
      
      // Request permission for native browser notifications
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              toast.success("Browser notification permission granted!");
              new Notification("Notifications Enabled", {
                body: `You are now subscribed to status alerts for Order #${order.id}!`,
                icon: "/favicon.ico"
              });
            } else if (permission === "denied") {
              toast.error("Browser notification permission denied. Using toast alerts instead.", { duration: 4000 });
            }
          } catch (err) {
            console.warn("Could not request notification permissions:", err);
          }
        } else if (Notification.permission === "denied") {
          toast.error("Browser notifications are blocked. Please unblock them in system settings for standard browser popups.", { duration: 5000 });
        }
      } else {
        toast.success("Standard toast alerts enabled. Desktop push alerts are not supported by this browser.", { duration: 4000 });
      }
    } else {
      toast.error("Unsubscribed from status notifications.");
    }
  };

  // Keep logs scrolled down
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Jitter coordinates to simulate active motion
  useEffect(() => {
    const interval = setInterval(() => {
      if (simStatus === "Shipped" || simStatus === "Processing") {
        setLatOffset((prev) => prev + (Math.random() - 0.5) * 0.00015);
        setLonOffset((prev) => prev + (Math.random() - 0.5) * 0.00015);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [simStatus]);

  // ETA Countdown live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (simStatus === "Delivered") return 0;
        if (simStatus === "Cancelled") return 0;
        if (prev <= 1) {
          // Wrap or reset countdown
          return 180 + Math.floor(Math.random() * 200);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [simStatus]);

  // Speed Mode timer: Advances steps every 8 seconds
  useEffect(() => {
    if (!isSpeedMode) return;

    const interval = setInterval(() => {
      setSimStatus((current) => {
        let nextStatus = current;
        let loggedAction = "";

        if (current === "Pending") {
          nextStatus = "Processing";
          loggedAction = "Warehouse confirmation complete. Materials sealed.";
        } else if (current === "Processing") {
          nextStatus = "Shipped";
          loggedAction = "Couriers scanned package. Carrier dispatch active.";
        } else if (current === "Shipped") {
          nextStatus = "Delivered";
          loggedAction = "Arrived at destination foyer. Digital signature received.";
        } else if (current === "Delivered") {
          nextStatus = "Pending";
          loggedAction = "Simulation loop recycled to Pending.";
        } else if (current === "Cancelled") {
          nextStatus = "Pending";
          loggedAction = "Simulation reset to Pending.";
        }

        if (loggedAction) {
          setLogs((prev) => [...prev, `[Live Event] Status updated: ${nextStatus}. ${loggedAction}`]);
        }
        return nextStatus;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isSpeedMode]);

  // Helper formatting for ETA Countdown
  const formatETA = (seconds) => {
    if (simStatus === "Delivered") return "Delivered";
    if (simStatus === "Cancelled") return "N/A (Revoked)";
    if (simStatus === "Pending") return "Calculating...";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
  };

  const getStepStatus = (stepName) => {
    if (simStatus === "Cancelled") {
      return "inactive";
    }

    const orderMap = {
      Pending: 1,
      Processing: 2,
      Shipped: 3,
      Delivered: 4,
      Cancelled: 5,
    };

    const currentIdx = orderMap[simStatus];
    
    const stepMap = {
      Placed: 1,
      Processing: 2,
      Shipped: 3,
      Delivered: 4,
    };

    const stepIdx = stepMap[stepName];

    if (currentIdx > stepIdx) return "completed";
    if (currentIdx === stepIdx) return "active";
    return "pending";
  };

  const getStepDetails = (step) => {
    switch (step) {
      case "Placed":
        return {
          title: "Order Logged & Audited",
          description: "Order has been logged and queued for fulfillment and auditing.",
          milestones: [
            { label: "Invoice recorded", done: true },
            { label: "Allocation queued", done: false },
            { label: "Accounting sync", done: false },
            { label: "Warehouse notify", done: false }
          ]
        };
      case "Processing":
        return {
          title: "Processing & Packing",
          description: "Warehouse pack-and-check processes are underway. Items are being prepared for dispatch.",
          milestones: [
            { label: "Item picked from shelf", done: true },
            { label: "Quality check", done: simStatus !== "Pending" },
            { label: "Packing & sealing", done: simStatus === "Shipped" },
            { label: "Labeling & manifesting", done: simStatus !== "Pending" }
          ]
        };
      case "Shipped":
        return {
          title: "In Transit",
          description: "The package is on the way via carrier and transmitting location updates.",
          milestones: [
            { label: "Carrier pickup", done: true },
            { label: "In transit to hub", done: simStatus === "Shipped" || simStatus === "Delivered" },
            { label: "Out for delivery", done: simStatus === "Delivered" },
            { label: "Final delivery ETA synced", done: simStatus === "Delivered" }
          ]
        };
      case "Delivered":
        return {
          title: "Delivered",
          description: "The package was delivered and receipt confirmed at the destination.",
          milestones: [
            { label: "Delivery completed", done: true },
            { label: "Signature/photo logged", done: true },
            { label: "Receipt token closed", done: true },
            { label: "Post-delivery feedback queued", done: true }
          ]
        };
      default:
        return {
          title: "Tracking",
          description: "Status information unavailable.",
          milestones: []
        };
    }
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-gray-950/30 p-5 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-6">
      
      {/* HUD Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-150 dark:border-gray-850">
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Radio size={18} className={simStatus === "Shipped" || simStatus === "Processing" ? "animate-pulse" : ""} />
            </div>
            {simStatus !== "Cancelled" && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-[11px] font-black uppercase text-gray-900 dark:text-white tracking-widest">
                SAT-Cargo Live Positioning
              </h5>
              <span className="text-[9px] font-mono bg-blue-105 dark:bg-blue-950/40 text-blue-600 px-1.5 py-0.5 rounded-md font-bold tracking-tight">
                ACTIVE
              </span>
            </div>
              <p className="text-[10px] text-gray-400 font-mono">
              Link Signal: Telemetry Transceiver #D3-O{String(order.id || "").substring(0, 4).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action / Trigger Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subscribe Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSubscription}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none cursor-pointer border transition-all ${
              isSubscribed
                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:text-emerald-500 hover:border-emerald-205"
            }`}
          >
            {isSubscribed ? (
              <BellRing size={11} className="animate-pulse text-emerald-100" />
            ) : (
              <Bell size={11} className="text-gray-400" />
            )}
            Status Alerts: {isSubscribed ? "Subscribed" : "Disabled"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSpeedMode(!isSpeedMode);
              setLogs((prev) => [
                ...prev,
                `[Control] Sim-Speed Mode toggled ${!isSpeedMode ? "ON" : "OFF"}.`
              ]);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none cursor-pointer border transition-all ${
              isSpeedMode 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:border-blue-200"
            }`}
          >
            <Zap size={11} className={isSpeedMode ? "animate-bounce" : ""} />
            Simulation Loop {isSpeedMode ? "Active (8s)" : "Disabled"}
          </button>
        </div>

      </div>

      {/* Main Track Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Stepper Timeline Vector */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-xl p-5 space-y-6">
          
          {simStatus === "Cancelled" ? (
            <div className="flex items-center gap-4 p-4 bg-rose-50/50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertCircle size={24} className="shrink-0" />
              <div className="text-xs font-semibold">
                <p className="font-bold uppercase tracking-wider text-[10px]">Transmission Revoked</p>
                <p className="mt-0.5 text-gray-500 dark:text-gray-400 leading-relaxed">
                  This transaction has been flagged. Cargo dispatch loops suspended.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-6 md:pl-0">
              
              {/* Horizontal line for desktop, vertical for mobile */}
              <div className="hidden md:block absolute left-4 right-12 top-4 h-[2px] bg-gray-100 dark:bg-gray-800 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-700" 
                  style={{
                    width: 
                      simStatus === "Pending" ? "0%" :
                      simStatus === "Processing" ? "33.3%" :
                      simStatus === "Shipped" ? "66.6%" :
                      "100%"
                  }}
                />
              </div>

              <div className="md:grid md:grid-cols-4 gap-4 flex flex-col space-y-6 md:space-y-0 relative z-10">
                
                {/* Step 1: Placed */}
                <button
                  type="button"
                  onClick={() => handleStepClick("Placed")}
                  className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 p-2 rounded-xl transition-all border border-transparent outline-none cursor-pointer group bg-transparent text-left ${
                    activeInteractiveStep === "Placed" 
                      ? "bg-slate-50 dark:bg-gray-850/50 border-slate-200 dark:border-gray-800 shadow-xs animate-pulse" 
                      : "hover:bg-slate-50/50 dark:hover:bg-gray-805/30"
                  }`}
                  title="Click to view details and override order to Logged Placed"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    getStepStatus("Placed") === "completed" ? "bg-emerald-500 border-emerald-500 text-white" :
                    getStepStatus("Placed") === "active" ? "bg-blue-600 border-blue-600 text-white animate-pulse shadow-sm shadow-blue-500/20" :
                    "bg-gray-100 dark:bg-gray-805 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-gray-300"
                  }`}>
                    {getStepStatus("Placed") === "completed" ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`font-extrabold text-xs leading-tight transition-colors ${
                      activeInteractiveStep === "Placed" ? "text-blue-600 dark:text-blue-405" : "text-gray-900 dark:text-white"
                    }`}>Order Logged</p>
                    <span className="text-[10px] text-gray-400 font-bold tracking-tight block">Fulfillment Base</span>
                  </div>
                </button>

                {/* Step 2: Processing */}
                <button
                  type="button"
                  onClick={() => handleStepClick("Processing")}
                  className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 p-2 rounded-xl transition-all border border-transparent outline-none cursor-pointer group bg-transparent text-left ${
                    activeInteractiveStep === "Processing" 
                      ? "bg-slate-50 dark:bg-gray-850/50 border-slate-200 dark:border-gray-800 shadow-xs animate-pulse" 
                      : "hover:bg-slate-50/50 dark:hover:bg-gray-805/30"
                  }`}
                  title="Click to view details and override order to Processing"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    getStepStatus("Processing") === "completed" ? "bg-emerald-500 border-emerald-500 text-white" :
                    getStepStatus("Processing") === "active" ? "bg-blue-600 border-blue-600 text-white animate-pulse shadow-sm shadow-blue-500/20" :
                    "bg-gray-100 dark:bg-gray-805 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-gray-300"
                  }`}>
                    <Package size={15} />
                  </div>
                  <div className="space-y-0.5 text-left md:text-center">
                    <p className={`font-extrabold text-xs leading-tight transition-colors ${
                      activeInteractiveStep === "Processing" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                    }`}>Walling & Sealing</p>
                    <span className="text-[10px] text-gray-400 font-bold tracking-tight block">Custom Quality Vet</span>
                  </div>
                </button>

                {/* Step 3: Shipped */}
                <button
                  type="button"
                  onClick={() => handleStepClick("Shipped")}
                  className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 p-2 rounded-xl transition-all border border-transparent outline-none cursor-pointer group bg-transparent text-left ${
                    activeInteractiveStep === "Shipped" 
                      ? "bg-slate-50 dark:bg-gray-850/50 border-slate-200 dark:border-gray-800 shadow-xs animate-pulse" 
                      : "hover:bg-slate-50/50 dark:hover:bg-gray-805/30"
                  }`}
                  title="Click to view details and override order to Shipped"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    getStepStatus("Shipped") === "completed" ? "bg-emerald-500 border-emerald-500 text-white" :
                    getStepStatus("Shipped") === "active" ? "bg-blue-600 border-blue-600 text-white animate-pulse shadow-sm shadow-blue-500/20" :
                    "bg-gray-100 dark:bg-gray-805 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-gray-300"
                  }`}>
                    <Truck size={15} />
                  </div>
                  <div className="space-y-0.5 text-left md:text-center">
                    <p className={`font-extrabold text-xs leading-tight transition-colors ${
                      activeInteractiveStep === "Shipped" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                    }`}>In Transit</p>
                    <span className="text-[10px] text-gray-400 font-bold tracking-tight block">Sat-Telemetry Active</span>
                  </div>
                </button>

                {/* Step 4: Delivered */}
                <button
                  type="button"
                  onClick={() => handleStepClick("Delivered")}
                  className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 p-2 rounded-xl transition-all border border-transparent outline-none cursor-pointer group bg-transparent text-left ${
                    activeInteractiveStep === "Delivered" 
                      ? "bg-slate-50 dark:bg-gray-850/50 border-slate-200 dark:border-gray-800 shadow-xs animate-pulse" 
                      : "hover:bg-slate-50/50 dark:hover:bg-gray-805/30"
                  }`}
                  title="Click to view details and override order to Delivered"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    getStepStatus("Delivered") === "completed" ? "bg-emerald-500 border-emerald-500 text-white animate-bounce" :
                    getStepStatus("Delivered") === "active" ? "bg-blue-600 border-blue-600 text-white animate-pulse shadow-sm shadow-blue-500/20" :
                    "bg-gray-100 dark:bg-gray-805 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-gray-300"
                  }`}>
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="space-y-0.5 text-left md:text-center">
                    <p className={`font-extrabold text-xs leading-tight transition-colors ${
                      activeInteractiveStep === "Delivered" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                    }`}>Arrived Foyer</p>
                    <span className="text-[10px] text-gray-400 font-bold tracking-tight block">Signed & Closed</span>
                  </div>
                </button>

              </div>

            </div>
          )}

          {/* Interactive Step Milestones checklist panel */}
          {simStatus !== "Cancelled" && (
            <div className="bg-slate-50/50 dark:bg-gray-955/35 border border-gray-150 dark:border-gray-850 rounded-xl p-4 space-y-3 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-90">
                  <Sparkles size={12} className="text-blue-600 animate-pulse text-xs shrink-0" />
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                    {activeInteractiveStep} Milestone Specifications
                  </span>
                </div>
                <span className="text-[8px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-bold select-none uppercase tracking-wider">
                  Interactive State Overrider
                </span>
              </div>
              
              <div className="space-y-1">
                <h6 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {getStepDetails(activeInteractiveStep)?.title}
                </h6>
                <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-normal font-medium">
                  {getStepDetails(activeInteractiveStep)?.description}
                </p>
              </div>

              {/* Milestones check grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-semibold">
                {getStepDetails(activeInteractiveStep)?.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-650 dark:text-gray-350">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border shrink-0 text-[8px] ${
                      milestone.done 
                        ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-300 text-emerald-600 dark:text-emerald-400" 
                        : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                    }`}>
                      {milestone.done ? "✓" : "◦"}
                    </div>
                    <span className="truncate">{milestone.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logistics Data Readout details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-850 text-xs font-semibold">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Estimated Window</span>
              <span className="text-gray-800 dark:text-white font-extrabold mt-1 block">
                {formatETA(countdown)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Current Station</span>
              <span className="text-gray-800 dark:text-white font-extrabold truncate max-w-[140px] mt-1 block">
                {simStatus === "Pending" ? "Processing Hub" :
                 simStatus === "Processing" ? "Fulfillment Terminal" :
                 simStatus === "Shipped" ? "Outbound Cargo" :
                 simStatus === "Delivered" ? "Target Residence" :
                 "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Carrier ID</span>
              <span className="text-blue-650 dark:text-blue-400 font-mono font-bold mt-1 block">
                SPH-TRUCK-{String(order.id || "").slice(-4).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Secured Link</span>
              <span className="text-emerald-500 flex items-center gap-1 font-bold mt-1">
                <span>●</span> Encrypted
              </span>
            </div>
          </div>

        </div>

        {/* Satellite Map Telemetry (Col 3) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-xl p-5 flex flex-col justify-between space-y-4">
          
          <div className="space-y-2">
            <h6 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <Compass size={11} className="text-blue-600 animate-spin" style={{ animationDuration: "8s" }} />
              Live Coordinate Feed
            </h6>
            
            {/* Holographic Radar Display Block */}
            <div className="relative h-24 bg-gray-955/5 dark:bg-black/40 rounded-lg overflow-hidden border border-gray-150 dark:border-gray-800 flex items-center justify-center font-mono">
              
              {/* Spinning scanning sweep */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-blue-500/5 select-none pointer-events-none"></div>
              
              {/* Simple radar concentric grid */}
              <div className="absolute w-20 h-20 rounded-full border border-dashed border-blue-500/10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-dashed border-blue-500/15"></div>
              </div>

              {/* Pulsing signal coordinate marker */}
              <motion.div 
                animate={{ scale: [1, 1.4, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute text-blue-600 flex flex-col items-center gap-1"
              >
                <Navigation size={14} className="rotate-45" />
                <span className="text-[8px] tracking-tighter opacity-80 select-none">CARGO</span>
              </motion.div>

              <div className="absolute top-2 left-2 text-[8px] font-bold text-gray-400 tracking-wider">
                SYS: GRD-GPS
              </div>

              <div className="absolute bottom-2 right-2 text-[8px] text-blue-500 font-bold opacity-60">
                P-FREQ: 433 MHz
              </div>
            </div>

            <div className="space-y-1 text-xs font-semibold">
              <div className="flex justify-between text-gray-450">
                <span>Latitude</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-300">
                  {(baseCoord.lat + latOffset).toFixed(5)}° N
                </span>
              </div>
              <div className="flex justify-between text-gray-450">
                <span>Longitude</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-300">
                  {(baseCoord.lon + lonOffset).toFixed(5)}° E
                </span>
              </div>
              <div className="flex justify-between text-gray-450">
                <span>Target City</span>
                <span className="font-extrabold text-blue-600 capitalize">
                  {order.shippingAddress?.city || "Unknown"}
                </span>
              </div>
            </div>

          </div>

          <div className="bg-gray-55 dark:bg-gray-955/40 p-2.5 border border-gray-100 dark:border-gray-850 rounded-lg text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-0.5">
              Current Address:
            </span>
            <p className="line-clamp-2 truncate">
              {(order.shippingAddress?.address || "") + (order.shippingAddress?.zipCode ? `, ${order.shippingAddress.zipCode}` : "")}
            </p>
          </div>

        </div>

      </div>



    </div>
  );
};
