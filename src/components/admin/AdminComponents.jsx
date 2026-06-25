import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  Settings,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Menu,
  Percent,
  X,
  Edit,
  Megaphone,
  Mail,
  MessageSquare
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";

// ADMIN SIDEBAR NAVIGATION DRAWER Props

export const Sidebar = ({ isOpenMobile = false, onCloseMobile }) => {
  const menus = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={16} /> },
    { name: "Products Catalog", path: "/admin/products", icon: <Boxes size={16} /> },
    { name: "Add Product", path: "/admin/products/add", icon: <Plus size={16} /> },
    { name: "Categories", path: "/admin/categories", icon: <ClipboardList size={16} /> },
    { name: "Customer Orders", path: "/admin/orders", icon: <ShoppingBag size={16} /> },
    { name: "Offers & Discounts", path: "/admin/discounts", icon: <Percent size={16} /> },
    { name: "Broadcast Center", path: "/admin/broadcasts", icon: <Megaphone size={16} /> },
    { name: "User Base", path: "/admin/customers", icon: <Users size={16} /> },
    { name: "Newsletter Leads", path: "/admin/subscribers", icon: <Mail size={16} /> },
    { name: "Customer Enquiries", path: "/admin/queries", icon: <MessageSquare size={16} /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-gray-950 text-gray-300 p-6 select-none">
      <div className="space-y-8">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              ShopSphere<span className="text-blue-500">.</span>Admin
            </span>
          </Link>
          {/* Close button on mobile overlay */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg border-0 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col space-y-1.5">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              end={menu.path === "/admin"}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-lg transition-all border-0",
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-850"
                )
              }
            >
              {menu.icon}
              {menu.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer link back */}
      <div className="border-t border-gray-850 pt-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-gray-850 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-gray-800 shadow-inner"
        >
          <ShoppingBag size={14} className="text-blue-500 animate-pulse" />
          <span>Exit to WebsiteHome</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-900 h-screen sticky top-0 hidden lg:block">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Flyout Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isOpenMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Dark overlay backdrop */}
        <div
          onClick={onCloseMobile}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
        
        {/* Sliding body block */}
        <aside
          className={cn(
            "absolute top-0 bottom-0 left-0 w-64 bg-gray-950 shadow-2xl transition-transform duration-300 ease-out",
            isOpenMobile ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

// ADMIN TOP BAR Props

export const Topbar = ({ onToggleMobileSidebar }) => {
  return (
    <header className="h-16 md:h-20 bg-white dark:bg-gray-950 border-b border-gray-150 dark:border-gray-850 px-6 flex items-center justify-between transition-colors sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Toggle burger for mobile menu */}
        <button
          onClick={onToggleMobileSidebar}
          type="button"
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-all border-0 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        {/* Search HUD placeholder */}
        <div className="relative w-48 sm:w-64">
          <input
            type="text"
            placeholder="Lookup admin metrics..."
            disabled
            className="w-full bg-gray-55 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-lg py-1.5 pl-3.5 pr-8 text-xs outline-none text-gray-400"
          />
          <Search size={14} className="absolute right-2.5 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Admin meta profile & storefront shortcut */}
      <div className="flex items-center gap-4 select-none">
        <Link
          to="/"
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-0 shadow-sm"
          id="go-to-storefront-button"
        >
          <ShoppingBag size={14} className="animate-bounce" />
          <span>View Site Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-100/50 dark:ring-blue-900/20">
            A
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Admin Console</h4>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Master Controller</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// DASHBOARD STATE HIGHLIGHT CARDS

export const DashboardCards = ({ stats }) => {
  const cards = [
    { title: "Net Revenue", value: formatCurrency(stats.revenue), icon: <TrendingUp size={20} className="text-blue-600" />, bg: "from-blue-500/10 to-blue-600/10" },
    { title: "Invoice Orders", value: stats.totalOrders.toString(), icon: <ShoppingBag size={20} className="text-emerald-600" />, bg: "from-emerald-500/10 to-emerald-600/10" },
    { title: "System Products", value: stats.totalProducts.toString(), icon: <Boxes size={20} className="text-amber-600" />, bg: "from-amber-500/10 to-amber-600/10" },
    { title: "Active Users", value: stats.totalUsers.toString(), icon: <Users size={20} className="text-indigo-600" />, bg: "from-indigo-500/10 to-indigo-600/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.title}</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</h3>
          </div>
          <div className={cn("p-4 rounded-xl bg-gradient-to-br", card.bg)}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

// ADMIN ANALYTICS CHART

export const AnalyticsChart = ({ data = [] }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">Revenue & Sales Projections</h3>
          <p className="text-xs text-gray-400">Monthly invoice data metrics aggregation</p>
        </div>
      </div>

      <div className="w-full h-80 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderRadius: 8,
                  borderColor: "#334155",
                  color: "#ffffff",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="sales" name="Monthly Sales (INR)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-gray-50/10 dark:bg-gray-850/10 rounded-xl animate-pulse" />
        )}
      </div>
    </div>
  );
};

// ADMIN ORDERS MANAGEMENT TABLE

export const OrdersTable = ({ orders = [], onStatusChange }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">Invoiced System Orders</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold px-3 py-1 rounded-full">{orders.length} Total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              <th className="px-6 py-4">Invoiced ID</th>
              <th className="px-6 py-4">Recipient Name</th>
              <th className="px-6 py-4">Ordered Items</th>
              <th className="px-6 py-4">Net Total</th>
              <th className="px-6 py-4">Date Invoiced</th>
              <th className="px-6 py-4 text-right">Status Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  No orders found in the system logs.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white truncate max-w-[120px]">#{ord.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{ord.customerName}</td>
                  <td className="px-6 py-4 text-gray-500">{ord.items.length} Product(s)</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(ord.total)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(ord.createdAt)}</td>
                  <td className="px-6 py-4 text-right flex justify-end">
                    {onStatusChange ? (
                      <select
                        value={ord.status}
                        onChange={(e) => onStatusChange(ord.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold outline-none cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          ord.status === "Delivered" && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450",
                          ord.status === "Shipped" && "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450",
                          ord.status === "Pending" && "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450",
                          ord.status === "Processing" && "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-450",
                          ord.status === "Cancelled" && "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-450"
                        )}
                      >
                        {ord.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ADMIN PRODUCTS MANAGEMENT TABLE

export const ProductsTable = ({ products = [], onDelete, onEdit }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">Catalog Stocks</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold px-3 py-1 rounded-full">{products.length} Products</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Product Specs</th>
              <th className="px-6 py-4">Product Category</th>
              <th className="px-6 py-4">Individual Cost</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4 text-center">Safety Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  No products registered in catalog.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg p-0.5 border bg-white flex items-center justify-center">
                      <img src={prod.image || '/placeholder.svg'} alt="" onError={(e) => { e.target.src = '/placeholder.svg'; }} className="w-full h-full object-contain" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{prod.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-550">{prod.category}</td>
                  <td className="px-6 py-4 font-extrabold text-blue-600">{formatCurrency(prod.price)}</td>
                  <td className="px-6 py-4 font-bold">
                    <span className={cn("px-2 py-1 rounded", prod.stock < 10 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                      {prod.stock} left
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(prod)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors border-0 cursor-pointer"
                          title="Edit Product Stock & Details"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(prod.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-0 cursor-pointer"
                        title="Deallocate Stock"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ADMIN USERS BASE SHEET TABLE

export const UsersTable = ({ users = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">Registered System Accounts</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold px-3 py-1 rounded-full">{users.length} Users</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              <th className="px-6 py-4">Account Holder</th>
              <th className="px-6 py-4">Email ID</th>
              <th className="px-6 py-4">Access Role Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                  No accounts registered in system sheet.
                </td>
              </tr>
            ) : (
              users.map((usr) => (
                <tr key={usr.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-105 border font-black text-xs text-blue-600 flex items-center justify-center">
                        {usr.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{usr.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-350">{usr.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", usr.role === "Admin" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>
                      {usr.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
