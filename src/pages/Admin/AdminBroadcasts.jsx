import React, { useState, useEffect } from "react";
import { Megaphone, Send, Trash2, Clock, ShieldAlert, Award, FileText, Bell, Volume2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { BroadcastNotification } from "../../types";

export const AdminBroadcasts = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [publishing, setPublishing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        toast.error("Could not fetch currently loaded broadcasts");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to notification microservice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both the notification headline and message body");
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type
        })
      });

      if (res.ok) {
        toast.success("Broadcast alert successfully dispatched to all live devices!", {
          duration: 4000,
          icon: "🚀"
        });
        setTitle("");
        setMessage("");
        fetchNotifications();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to dispatch broadcast");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error executing broadcast command");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteNotification = async (id, label) => {
    if (!window.confirm(`Are you sure you want to recall and delete the broadcast: "${label}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/broadcasts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Broadcast alert recalled successfully.");
        fetchNotifications();
      } else {
        toast.error("Failed to recall notification from servers");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to notification server for delete call");
    }
  };

  const getNotificationColors = (t) => {
    switch (t) {
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          border: "border-emerald-100 dark:border-emerald-900/30",
          text: "text-emerald-800 dark:text-emerald-400",
          badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-705 dark:text-emerald-400",
          accent: "border-l-4 border-l-emerald-500",
          icon: <CheckCircle size={16} className="text-emerald-500" />
        };
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-100 dark:border-amber-900/30",
          text: "text-amber-800 dark:text-amber-400",
          badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-705 dark:text-amber-400",
          accent: "border-l-4 border-l-amber-500",
          icon: <ShieldAlert size={16} className="text-amber-500" />
        };
      case "offer":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/20",
          border: "border-purple-100 dark:border-purple-900/30",
          text: "text-purple-800 dark:text-purple-400",
          icon: <Award size={16} className="text-purple-500" />,
          badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-705 dark:text-purple-400",
          accent: "border-l-4 border-l-purple-500",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/10",
          border: "border-blue-100 dark:border-blue-950/20",
          text: "text-blue-800 dark:text-blue-400",
          badge: "bg-blue-100 dark:bg-blue-950/40 text-blue-705 dark:text-blue-400",
          accent: "border-l-4 border-l-blue-500",
          icon: <Volume2 size={16} className="text-blue-500" />,
        };
    }
  };

  return (
    <div className="space-y-8" id="admin-broadcasts-main">
      
      {/* HEADER HUD BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="broadcasts-header-hud">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-955/40 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            📡 Live Device Connection Engine
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Universal Notification Broadcasts
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dispatch reactive alerts, event announcements, and checkout offers to active devices storefront-wide.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-505 animate-pulse shrink-0" />
            <div className="text-xs leading-none">
              <span className="text-gray-400 block mb-0.5 font-bold uppercase text-[9px]">Server State</span>
              <span className="font-extrabold text-[#10b981]">Active Broadcast Channels</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: BROADCAST DRAFT CREATOR FORM (40% width) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100 dark:border-gray-850">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                <Megaphone size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                  Compose Broadcast
                </h3>
                <p className="text-[10px] text-gray-405">Draft headlines and select dispatch streams</p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-semibold">
              
              {/* NOTIFICATION TYPE SELECT */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Alert Category</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(["info", "success", "warning", "offer"]).map((t) => {
                    const colors = getNotificationColors(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-2 px-3 rounded-xl border text-left flex items-center gap-1.5 transition-all uppercase text-[9px] font-black tracking-wider cursor-pointer select-none outline-none ${
                          type === t 
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {colors.icon}
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NOTIFICATION TITLE */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🎁 Ultimate Summer Sale Unlocked!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950 focus:bg-white dark:focus:bg-gray-1000 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-gray-850 dark:text-gray-150 transition-all placeholder-gray-400"
                />
              </div>

              {/* NOTIFICATION MESSAGE */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Alert Broadcast Message</label>
                <textarea
                  required
                  rows={4}
                  maxLength={300}
                  placeholder="e.g. Save an immense flat 50% discount on all checkout accessories tonight using special promotion code METAEPCES. Hurry!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950 focus:bg-white dark:focus:bg-gray-1000 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-gray-850 dark:text-gray-150 transition-all placeholder-gray-400 resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center pt-0.5 text-[9px] text-gray-400 font-bold">
                  <span>Storewide Audience Limit: Unlimited</span>
                  <span>{message.length}/300 characters</span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={publishing}
                id="dispatch-broadcast-btn"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-[0.98] border-0 mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none shadow-blue-900/10"
              >
                {publishing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={12} className="animate-pulse" />
                    <span>Send Announcement</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: CHRONOLOGY OF ACTIVE DISPATCHED NOTIFICATIONS (80% width equivalent) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-300 rounded-lg">
                    <Bell size={14} className="animate-swing" />
                  </span>
                  <h3 className="text-xs font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
                    Dispatched Alert Archive
                  </h3>
                </div>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full select-none">
                  {notifications.length} Historical Logs
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs text-gray-400 font-bold">Connecting to broadcast stream...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2.5">
                  <span className="text-3xl">🔇</span>
                  <h4 className="text-sm font-bold text-gray-805 dark:text-gray-205">No Active Broadcaster Alerts</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-505 max-w-sm leading-relaxed">
                    Once you publish announcements using the composer tool on the left, your alerts will show up here. All stores and shoppers will sync dynamically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {notifications.map((n) => {
                    const styling = getNotificationColors(n.type);
                    return (
                      <div
                        key={n.id}
                        id={`archived-alert-${n.id}`}
                        className={`p-4.5 rounded-xl border flex gap-4 items-start justify-between transition-all duration-200 ${styling.bg} ${styling.border} ${styling.accent}`}
                      >
                        <div className="flex gap-3 items-start min-w-0">
                          <div className="p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                            {styling.icon}
                          </div>
                          
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight leading-none">
                                {n.title}
                              </h4>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider leading-none ${styling.badge}`}>
                                {n.type}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold leading-relaxed">
                              {n.message}
                            </p>
                            
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold pt-1">
                              <Clock size={10} />
                              <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                              <span>•</span>
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(n.id, n.title)}
                          id={`recall-alert-${n.id}`}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all border-0 cursor-pointer shrink-0"
                          title="Permanently Recall / Delete Notification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LOWER STATS BAR */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-bold gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>Audience scope: Registered customers + Guest browsing suites</span>
              </div>
              <button
                type="button"
                onClick={fetchNotifications}
                className="text-blue-600 hover:text-blue-700 hover:underline border-0 bg-transparent cursor-pointer font-extrabold uppercase tracking-wider text-[10px] select-none"
              >
                Sync Connected Channels
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminBroadcasts;
