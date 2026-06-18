import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Megaphone, Bell, Volume2, Award, CheckCircle, ShieldAlert, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

export const GlobalBroadcastListener = () => {
  useEffect(() => {
    // Use a separate localStorage key to track which broadcasts have been
    // toasted — this must NOT overlap with shop_seen_broadcasts (used by
    // Navbar for read/unread badge).
    const getToastedIds = () => {
      try {
        const stored = localStorage.getItem("shop_toasted_broadcasts");
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    };

    const saveToastedId = (id) => {
      try {
        const toasted = getToastedIds();
        if (!toasted.includes(id)) {
          toasted.push(id);
          localStorage.setItem("shop_toasted_broadcasts", JSON.stringify(toasted));
        }
      } catch (e) {
        // Fail-safe
      }
    };

    // On first poll, silently register all existing broadcasts as toasted
    // so the user only sees toast popups for genuinely NEW arrivals.
    let isInitialMount = true;

    const checkNewBroadcasts = async () => {
      try {
        const [externalRes, localRes] = await Promise.allSettled([
          fetch(`${API_URL}/Broadcasts`),
          fetch("/api/broadcasts")
        ]);

        let all = [];
        if (externalRes.status === "fulfilled" && externalRes.value.ok) {
          const data = await externalRes.value.json();
          if (Array.isArray(data)) all.push(...data);
        }
        if (localRes.status === "fulfilled" && localRes.value.ok) {
          const data = await localRes.value.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              if (!all.some((b) => String(b.id) === String(item.id))) {
                all.push(item);
              }
            }
          }
        }

        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const broadcasts = all.filter((b) => now - new Date(b.createdAt).getTime() <= TWENTY_FOUR_HOURS);
        if (broadcasts.length === 0) return;

        const toastedList = getToastedIds();

        if (isInitialMount) {
          broadcasts.forEach((b) => {
            if (!toastedList.includes(b.id)) {
              saveToastedId(b.id);
            }
          });
          isInitialMount = false;
          return;
        }

        // Identify any notifications not yet toasted on this device
        const freshAlerts = broadcasts.filter((b) => !toastedList.includes(b.id));

        if (freshAlerts.length > 0) {
          // Process and toast each fresh alert
          freshAlerts.forEach((alert) => {
            // Save so we don't toast it again
            saveToastedId(alert.id);

            // Play a soft announcement audio tone or browser native beep if supported
            try {
              const audioCtx = new (window.AudioContext || (window).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = "sine";
              oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 high tone
              gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.15);
            } catch (soundErr) {
              // Browser may block automatic audio until first interaction, fail-safe
            }

            // HTML5 Native Browser Push notification if permission is active
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(alert.title, {
                  body: alert.message,
                  icon: "/favicon.ico"
                });
              } catch (err) {
                console.warn("Could not fire native notification:", err);
              }
            }

            // Custom Elegant Toast block with beautiful responsive design
            toast.custom(
              (t) => {
                const getAlertAccent = (type) => {
                  switch (type) {
                    case "success":
                      return {
                        bg: "bg-emerald-950 border-emerald-800 text-emerald-400",
                        icon: <CheckCircle className="text-emerald-400 animate-bounce" size={20} />,
                      };
                    case "warning":
                      return {
                        bg: "bg-amber-950 border-amber-800 text-amber-400",
                        icon: <ShieldAlert className="text-amber-400 animate-bounce" size={20} />,
                      };
                    case "offer":
                      return {
                        bg: "bg-purple-950 border-purple-800 text-purple-400",
                        icon: <Award className="text-purple-400 animate-bounce" size={20} />,
                      };
                    default:
                      return {
                        bg: "bg-blue-950 border-blue-800 text-blue-400",
                        icon: <Bell className="text-blue-400 animate-bounce" size={20} />,
                      };
                  }
                };

                const accent = getAlertAccent(alert.type);

                return (
                  <div
                    className={`${
                      t.visible ? "animate-fade-in" : "animate-out fade-out duration-300"
                    } max-w-md w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden leading-normal select-none`}
                    id={`active-toast-${alert.id}`}
                  >
                    <div className="p-4 flex gap-3 items-start">
                      <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
                        {accent.icon}
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">
                            Live Bulletin
                          </span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider animate-pulse">
                            New Push
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white tracking-tight leading-normal">
                          {alert.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          {alert.message}
                        </p>
                      </div>

                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-200 transition-colors border-0 cursor-pointer outline-none shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="px-4 py-2 bg-slate-950 border-t border-slate-850/80 flex justify-between items-center text-[9px] text-slate-500 font-bold">
                      <span>ShopSphere Universal Broadcast Network</span>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-blue-500 hover:text-blue-400 bg-transparent border-0 cursor-pointer font-black px-1"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                );
              },
              { duration: 8000 }
            );
          });
        }
      } catch (err) {
        // Silently capture fetching errors during background polling
        console.warn("Broadcast synchronization paused momentarily:", err);
      }
    };

    // Run first verification immediately on mount
    const initialTimer = setTimeout(() => {
      checkNewBroadcasts();
    }, 400);

    // Set high-frequency 5-second interval poll to check for dynamic updates live
    const pollId = setInterval(checkNewBroadcasts, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollId);
    };
  }, []);

  return null; // Pure background component
};

export default GlobalBroadcastListener;
