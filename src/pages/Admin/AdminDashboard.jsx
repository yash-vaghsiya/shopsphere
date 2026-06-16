import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchProductsThunk } from "../../features/products/productSlice";
import { fetchOrdersThunk } from "../../features/orders/orderSlice";
import { DashboardCards, OrdersTable } from "../../components/admin/AdminComponents";
import { DashboardVisuals } from "../../components/admin/DashboardVisuals";
import { 
  Activity, 
  Cpu, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Server,
  CloudLightning,
  Workflow
} from "lucide-react";
import { toast } from "react-hot-toast";

// Interactive telemetry cluster nodes (runtime objects)

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchProductsThunk({}));
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  // Telemetry modulation state
  const [activeNode, setActiveNode] = useState("gw-node");
  const [telemetrySyncCount, setTelemetrySyncCount] = useState(0);
  const [isModulating, setIsModulating] = useState(false);

  const clusterNodes = [
    {
      id: "gw-node",
      name: "Gateway Node",
      status: "Active",
      load: "12.8%",
      rtt: "1.4 ms",
      uptime: "99.99%",
      color: "#2563eb", // Blue
      desc: "Ingress security load balancing systems routing worldwide store transactions securely.",
    },
    {
      id: "db-node",
      name: "Database Node",
      status: "Syncing",
      load: "22.5%",
      rtt: "2.1 ms",
      uptime: "100.0%",
      color: "#059669", // Emerald
      desc: "Dynamic stock allocation nodes tracking items, catalog listings, and database indexing.",
    },
    {
      id: "cdn-node",
      name: "CDN Node",
      status: "Standby",
      load: "8.1%",
      rtt: "9.2 ms",
      uptime: "99.95%",
      color: "#d97706", // Amber
      desc: "Distributed server grids optimized for loading high-resolution catalog images globally.",
    },
    {
      id: "sec-node",
      name,
      status,
      load: "4.2%",
      rtt: "0.8 ms",
      uptime: "100.0%",
      color: "#7c3aed", // Violet
      desc: "Identity verification and customer access level check algorithms block unauthorized actions.",
    }
  ];

  const stats = {
    totalUsers: 14,
    totalOrders: orders.length || 3,
    totalProducts: products.length || 8,
    revenue: orders.reduce((sum, ord) => sum + (ord.status !== "Cancelled" ? ord.total : 0), 0) || 124500,
  };

  const chartData = [
    { name: "Jan", sales: 42000 },
    { name: "Feb", sales: 38000 },
    { name: "Mar", sales: 51000 },
    { name: "Apr", sales: 47000 },
    { name: "May", sales: 53000 },
    { name: "Jun", sales: stats.revenue || 54000 },
  ];

  const handleReModulate = () => {
    setIsModulating(true);
    setTimeout(() => {
      setIsModulating(false);
      setTelemetrySyncCount(prev => prev + 1);
      toast.success("Operations network topology refollowed and synced!", {
        icon: "🔄"
      });
    }, 900);
  };

  const selectedNode = clusterNodes.find(node => node.id === activeNode) || clusterNodes[0];

  // Helper dynamic SVG builder representing the system operations network image
  const renderTelemetryImageSvg = () => {
    const isBlue = selectedNode.id === "gw-node";
    const isEmerald = selectedNode.id === "db-node";
    const isAmber = selectedNode.id === "cdn-node";
    const isViolet = selectedNode.id === "sec-node";

    // Modulate coordinates and line paths based on selected model highlight
    const mainColor = selectedNode.color;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 220" width="100%" height="100%" style="border-radius: 12px;">
      <!-- Grid Overlay Background -->
      <defs>
        <pattern id="op-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.8"/>
        </pattern>
        <radialGradient id="glow-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color: ${mainColor}; stop-opacity: 0.18;" />
          <stop offset="100%" style="stop-color: ${mainColor}; stop-opacity: 0.0;" />
        </radialGradient>
      </defs>
      
      <!-- Base Color Field -->
      <rect width="100%" height="100%" fill="#090d16" />
      <rect width="100%" height="100%" fill="url(#op-grid)" />
      
      <!-- Ambient Glow Vector -->
      <circle cx="270" cy="110" r="160" fill="url(#glow-center)" />

      <!-- Inner Technical Frame Lines -->
      <rect x="15" y="15" width="510" height="190" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      
      <!-- Interconnected Vector Circuit Lines -->
      <path d="M 50 110 L 160 110 M 160 110 L 270 50 M 270 50 L 380 110 M 380 110 L 490 110 M 160 110 L 270 170 M 270 170 L 380 110" 
            fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
            
      <!-- Dynamic Highlighted Pathway -->
      <path d="${
        isBlue 
        ? 'M 50 110 L 160 110' 
        : isEmerald 
        ? 'M 160 110 L 270 50' 
        : isAmber 
        ? 'M 160 110 L 270 170' 
        : 'M 380 110 L 490 110'
      }" 
            fill="none" stroke="${mainColor}" stroke-width="3.5" stroke-linecap="round" opacity="0.9" />

      <!-- Node 1: Ingress Gateway -->
      <g transform="translate(50, 110)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="${isBlue ? mainColor : 'rgba(255,255,255,0.2)'}" stroke-width="${isBlue ? '3' : '1.5'}" />
        <circle r="12" fill="${isBlue ? mainColor : 'rgba(255,255,255,0.05)'}" fill-opacity="${isBlue ? '1.0' : '0.1'}" />
        <text y="-28" text-anchor="middle" fill="${isBlue ? '#FFFFFF' : '#94a3b8'}" font-size="9" font-family="'Inter', sans-serif" font-weight="900">INGRESS GW</text>
        <text y="-40" text-anchor="middle" fill="#2563eb" font-size="7" font-family="monospace">RTT: 1.4ms</text>
      </g>
      
      <!-- Node 2: Database Server -->
      <g transform="translate(160, 110)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="${isEmerald ? mainColor : 'rgba(255,255,255,0.2)'}" stroke-width="${isEmerald ? '3' : '1.5'}" />
        <circle r="12" fill="${isEmerald ? mainColor : 'rgba(255,255,255,0.05)'}" fill-opacity="${isEmerald ? '1.0' : '0.1'}" />
        <text y="-28" text-anchor="middle" fill="${isEmerald ? '#FFFFFF' : '#94a3b8'}" font-size="9" font-family="'Inter', sans-serif" font-weight="900">CATALOG DB</text>
      </g>

      <!-- Node 3: Static Asset Grid -->
      <g transform="translate(270, 50)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="${isAmber ? mainColor : 'rgba(255,255,255,0.2)'}" stroke-width="${isAmber ? '3' : '1.5'}" />
        <circle r="12" fill="${isAmber ? mainColor : 'rgba(255,255,255,0.05)'}" fill-opacity="${isAmber ? '1.0' : '0.1'}" />
        <text y="-28" text-anchor="middle" fill="${isAmber ? '#FFFFFF' : '#94a3b8'}" font-size="9" font-family="'Inter', sans-serif" font-weight="900">VIRTUAL CDN</text>
      </g>

      <!-- Node 4: Security Shield Guard -->
      <g transform="translate(270, 170)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="${isViolet ? mainColor : 'rgba(255,255,255,0.2)'}" stroke-width="${isViolet ? '3' : '1.5'}" />
        <circle r="12" fill="${isViolet ? mainColor : 'rgba(255,255,255,0.05)'}" fill-opacity="${isViolet ? '1.0' : '0.1'}" />
        <text y="36" text-anchor="middle" fill="${isViolet ? '#FFFFFF' : '#94a3b8'}" font-size="9" font-family="'Inter', sans-serif" font-weight="900">SENTINEL ACCESS</text>
      </g>

      <!-- Node 5: Analytics Relays -->
      <g transform="translate(380, 110)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        <circle r="12" fill="rgba(255,255,255,0.05)" fill-opacity="0.1" />
        <text y="-28" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="'Inter', sans-serif" font-weight="900">METRICS RELAY</text>
      </g>

      <!-- Node 6: Global Network Ingress -->
      <g transform="translate(490, 110)" cursor="pointer">
        <circle r="22" fill="#0c1322" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        <circle r="12" fill="rgba(255,255,255,0.05)" fill-opacity="0.1" />
        <text y="-28" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="'Inter', sans-serif" font-weight="900">CLIENT OUT</text>
        <text y="35" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7.5" font-family="monospace">ACTIVE ID: ${selectedNode.id.toUpperCase()}</text>
      </g>
      
      <!-- Top Diagnostic Tech Labels -->
      <text x="30" y="32" fill="rgba(255,255,255,0.4)" font-family="monospace" font-size="7">SYSTEM LOGS STATUS // SHOPSPHERE CONTROL</text>
      <text x="510" y="32" text-anchor="end" fill="${mainColor}" font-family="monospace" font-weight="bold" font-size="7">NODE OVERRIDE ONLINE (${selectedNode.status.toUpperCase()})</text>
    </svg>`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-xs text-gray-400">
            Real-time diagnostics, customer acquisitions, and net turnover calculations
          </p>
        </div>

        <button
          onClick={handleReModulate}
          disabled={isModulating}
          type="button"
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-xs font-bold text-gray-800 dark:text-gray-200 rounded-xl shadow-xs cursor-pointer transition-all border-0 outline-none"
        >
          <RefreshCw size={14} className={isModulating ? "animate-spin" : ""} />
          Modulate Network Matrix
        </button>
      </div>

      {/* Modern High-Quality System Telemetry Graphic Board (Responsive layout matching User Request) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Vector SVG Dashboard Display */}
          <div className="lg:col-span-7 bg-gray-950 p-5 md:p-6 flex flex-col justify-between relative min-h-[220px]">
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-gray-900/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-green-500 absolute"></span>
              <span className="text-[9px] font-bold text-gray-300 font-mono">RTT LNK SECURE</span>
            </div>
            
            <div 
              className="w-full object-contain"
              dangerouslySetInnerHTML={{ __html: renderTelemetryImageSvg() }} 
            />
          </div>

          {/* Selector controls & system parameters logs */}
          <div className="lg:col-span-5 p-5 md:p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-gray-900 text-xs border-t lg:border-t-0 lg:border-l border-gray-150 dark:border-gray-850">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 block">Cluster Controller</span>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Operation Nodes</h3>
              </div>
              
              {/* Simple toggle selectors for server nodes */}
              <div className="grid grid-cols-2 gap-2">
                {clusterNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node.id)}
                    type="button"
                    className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer select-none border-0 ${
                      activeNode === node.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                        : "bg-gray-55 dark:bg-gray-950 border-gray-150 dark:border-gray-850 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide truncate">
                      {node.id === "gw-node" && <Globe size={11} />}
                      {node.id === "db-node" && <Server size={11} />}
                      {node.id === "cdn-node" && <CloudLightning size={11} />}
                      {node.id === "sec-node" && <Workflow size={11} />}
                      {node.name.split(" ")[0]}
                    </div>
                    <div className="text-[8px] opacity-75 mt-0.5 leading-none">
                      Load: {node.load} • RTT: {node.rtt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* In-depth stats log block */}
            <div className="p-3.5 bg-gray-55 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-850 space-y-1.5 font-medium text-[11px] leading-relaxed">
              <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
                <Activity size={12} className="text-blue-600" />
                {selectedNode.name} Metrics Log
              </h4>
              <p className="text-gray-500 text-[10px]">
                {selectedNode.desc}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px] text-gray-650 dark:text-gray-400">
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Uptime</span>
                  <span className="font-extrabold text-gray-850 dark:text-gray-200">{selectedNode.uptime}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Node Cost</span>
                  <span className="font-extrabold text-gray-850 dark:text-gray-200">₹0.04/req</span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Sync Cycle</span>
                  <span className="font-extrabold text-blue-600 font-bold">#{telemetrySyncCount + 115}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <DashboardCards stats={stats} />
      <DashboardVisuals products={products} orders={orders} />
      <OrdersTable orders={orders.slice(0, 5)} />
    </div>
  );
};

export default AdminDashboard;
