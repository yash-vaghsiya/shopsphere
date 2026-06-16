import React, { useEffect, useState } from "react";
import { Mail, Search, Trash2, Copy, Download, Calendar, ArrowUpRight, CheckCircle } from "lucide-react";
import { axiosInstance } from "../../services/api";
import { NewsletterSubscriber } from "../../types";
import { toast } from "react-hot-toast";
import { formatDate } from "../../utils/format";

export const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubscribers = async () => {
    try {
      const response = await axiosInstance.get("/api/newsletter/subscribers");
      setSubscribers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load newsletter subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the newsletter subscriber base?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/newsletter/subscribers/${id}`);
      toast.success(`${email} has been successfully removed.`);
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove subscriber.");
    }
  };

  const handleCopyAll = () => {
    if (subscribers.length === 0) {
      toast.error("No subscriber records available to copy.");
      return;
    }
    const emailsList = subscribers.map((sub) => sub.email).join(", ");
    navigator.clipboard.writeText(emailsList);
    toast.success("Successfully copied all subscriber emails to your clipboard!");
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error("No subscriber records available to export.");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Email,Subscribed At"]
        .concat(subscribers.map((sub) => `"${sub.id}","${sub.email}","${sub.subscribedAt}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopsphere_newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscribers list exported!");
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-gray-500">
            Monitor and export collected customer emails for newsletter campaigns and future promotional targeting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAll}
            type="button"
            className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Copy subscriber emails separated by commas"
          >
            <Copy size={13} />
            <span className="hidden md:inline">Copy All Emails</span>
            <span className="md:hidden">Copy</span>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-0 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download CSV database file"
          >
            <Download size={13} />
            <span className="hidden md:inline">Export CSV</span>
            <span className="md:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Audience</span>
            <h3 className="text-2xl font-black text-gray-950 dark:text-white">{subscribers.length} Emails</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-450">
            <Mail size={18} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verification Status</span>
            <h3 className="text-2xl font-black text-emerald-600">100% Validated</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Campaign Ready</span>
            <h3 className="text-2xl font-black text-blue-500 flex items-center gap-1">
              Yes
              <ArrowUpRight size={18} />
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Calendar size={18} />
          </div>
        </div>
      </div>

      {/* List Layout with Search */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">
            Collected Email Records
          </h2>

          <div className="relative max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter addresses..."
              className="w-48 sm:w-64 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-3.5 pr-8 text-xs outline-none focus:border-blue-500 text-gray-800 dark:text-white transition-colors"
            />
            <Search size={14} className="absolute right-2.5 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Status Indicator</th>
                  <th className="px-6 py-4">Captured Email</th>
                  <th className="px-6 py-4">Subscription Timestamp</th>
                  <th className="px-6 py-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs text-gray-600 dark:text-gray-300">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 dark:text-gray-550 italic">
                      No matching email subscriber records verified in the log.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/30 transition-all">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] rounded-full text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          Subscribed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-semibold tracking-tight text-gray-950 dark:text-white">
                        {sub.email}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-450">
                        {formatDate(sub.subscribedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          type="button"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border-0 cursor-pointer text-xs"
                          title="Unsubscribe Lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;
