import React, { useEffect, useState } from "react";
import { MessageSquare, Search, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDate } from "../../utils/format";

const QUERIES_API = "/api/contact/queries";

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
};

const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.records)) return data.records;
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.results)) return data.results;
  }
  return null;
};

const normalizeQuery = (d, idx) => ({
  id: d.id ?? d.Id ?? d.queryId ?? d.QueryId ?? `q-${idx}-${Date.now()}`,
  name: d.name ?? d.Name ?? '',
  email: d.email ?? d.Email ?? '',
  subject: d.subject ?? d.Subject ?? '',
  message: d.message ?? d.Message ?? '',
  reply: d.reply ?? d.Reply ?? null,
  status: d.status ?? d.Status ?? 'pending',
  createdAt: d.createdAt ?? d.CreatedAt ?? new Date().toISOString(),
  repliedAt: d.repliedAt ?? d.RepliedAt ?? null,
});

const apiFetch = async (path, options = {}) =>
  fetch(`${QUERIES_API}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

export const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchQueries = async () => {
    try {
      const res = await apiFetch("");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const raw = unwrapArray(data);
      setQueries(raw ? raw.map((d, i) => normalizeQuery(d, i)) : []);
    } catch {
      console.error("Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the query from ${name}?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error("Delete failed");
      setQueries((prev) => prev.filter((q) => q.id !== id));
    } catch {
      console.error("Delete failed");
    }
  };

  const filteredQueries = queries.filter((q) => {
    const matchesSearch = 
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.reply && q.reply.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && q.status === 'pending') ||
      (statusFilter === 'replied' && q.status === 'replied');

    return matchesSearch && matchesStatus;
  });

  const pendingCount = queries.filter(q => q.status === 'pending').length;
  const repliedCount = queries.filter(q => q.status === 'replied').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="text-blue-600" />
            Customer Enquiries & Queries
          </h1>
          <p className="text-xs text-gray-500">
            Address incoming feedback, customer questions, wholesale inquiries, and dispatch instant replies to their mailboxes.
          </p>
        </div>
      </div>

      {/* Statistics and Filtering Navigation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total card */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-5 border rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-blue-50/50 border-blue-500/30 dark:bg-blue-955/20 ring-1 ring-blue-550'
              : 'bg-white border-gray-150 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-805 dark:hover:border-gray-750'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest">Total Queries</span>
            <h3 className="text-xl font-black text-gray-950 dark:text-white">{queries.length} Messages</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
            <MessageSquare size={16} />
          </div>
        </div>

        {/* Pending card */}
        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-5 border rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-50/40 border-amber-500/30 dark:bg-amber-955/10 ring-1 ring-amber-550'
              : 'bg-white border-gray-150 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-805 dark:hover:border-gray-750'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest">Awaiting Reply</span>
            <h3 className="text-xl font-black text-amber-600 flex items-center gap-1.5">
              {pendingCount} Pending
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock size={16} />
          </div>
        </div>

        {/* Replied card */}
        <div 
          onClick={() => setStatusFilter('replied')}
          className={`p-5 border rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'replied'
              ? 'bg-emerald-50/40 border-emerald-500/30 dark:bg-emerald-955/10 ring-1 ring-emerald-500'
              : 'bg-white border-gray-150 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-805 dark:hover:border-gray-750'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest">Responded</span>
            <h3 className="text-xl font-black text-emerald-600">{repliedCount} Replied</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-650">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      {/* Central Query Log Layout */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search header controls */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black uppercase text-gray-900 dark:text-white tracking-wider">
              Enquiry Logs
            </h2>
            <div className="flex gap-1">
              {(['all', 'pending', 'replied']).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border-0 transition-all ${
                    statusFilter === tab
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950 font-black'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer bg-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or content..."
              className="w-48 sm:w-72 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl py-2 pl-3.5 pr-8 text-xs outline-none focus:border-blue-500 text-gray-800 dark:text-white transition-colors placeholder:text-gray-400"
            />
            <Search size={14} className="absolute right-2.5 top-3 text-gray-400" />
          </div>
        </div>

        {/* Query Cards / List */}
        {loading ? (
          <div className="flex justify-center py-24 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-2">
            <AlertCircle size={32} className="mx-auto text-gray-300 dark:text-gray-700" />
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No matching user queries found</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We couldn't locate any enquiries in our database matching the current state and filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {filteredQueries.map((query, idx) => (
              <div 
                key={query.id ?? `q-${idx}`} 
                className={`p-5 transition-all ${
                  query.status === 'pending' 
                    ? 'bg-amber-500/[0.01] hover:bg-amber-500/[0.03]' 
                    : 'hover:bg-gray-50/40 dark:hover:bg-gray-900/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Query Main Info */}
                  <div className="space-y-3 flex-1">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        {query.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        &lt;{query.email}&gt;
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        • {formatDate(query.createdAt)}
                      </span>
                      
                      {query.status === 'pending' ? (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase text-amber-600 bg-amber-100/50 dark:bg-amber-950/20 border border-amber-500/20 rounded-full flex items-center gap-1">
                          <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                          Awaiting reply
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100/40 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          Replied
                        </span>
                      )}
                    </div>

                    {/* Query Original message bubble */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {query.message}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start">
                    <button
                      onClick={() => handleDelete(query.id, query.name)}
                      type="button"
                      className="p-1.5 text-gray-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all border-0 cursor-pointer"
                      title="Delete query record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminQueries;
