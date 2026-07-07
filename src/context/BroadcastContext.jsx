import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const BroadcastContext = createContext();

const getSeenIds = () => {
  try {
    const stored = localStorage.getItem('shop_seen_broadcasts');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveSeenIds = (ids) => {
  try { localStorage.setItem('shop_seen_broadcasts', JSON.stringify(ids)); } catch {}
};

const getToastedIds = () => {
  try {
    const stored = localStorage.getItem('shop_toasted_broadcasts');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveToastedId = (id) => {
  try {
    const toasted = getToastedIds();
    if (!toasted.includes(id)) {
      toasted.push(id);
      localStorage.setItem('shop_toasted_broadcasts', JSON.stringify(toasted));
    }
  } catch {}
};

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const processBroadcasts = (all, isInitial, setBroadcasts, setUnreadCount, initialRef) => {
  const now = Date.now();
  const recent = all.filter((b) => now - new Date(b.createdAt).getTime() <= TWENTY_FOUR_HOURS);
  setBroadcasts(recent);

  const seenIds = getSeenIds();
  const unread = recent.filter((b) => !seenIds.includes(b.id)).length;
  setUnreadCount(unread);

  if (isInitial) {
    const toastedList = getToastedIds();
    recent.forEach((b) => {
      if (!toastedList.includes(b.id)) saveToastedId(b.id);
    });
    if (initialRef) initialRef.current = false;
  }
};

export const BroadcastProvider = ({ children }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialMount = useRef(true);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch('/api/broadcasts');
      if (!res.ok) return;
      const data = await res.json();
      const all = Array.isArray(data) ? data : [];
      processBroadcasts(all, isInitialMount.current, setBroadcasts, setUnreadCount, isInitialMount);
    } catch { }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchBroadcasts();

    // SSE connection for instant delivery
    const sseUrl = `/api/broadcasts/stream`;
    let eventSource;

    const connectSSE = () => {
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('broadcasts', (e) => {
        try {
          const all = JSON.parse(e.data);
          if (Array.isArray(all)) {
            processBroadcasts(all, false, setBroadcasts, setUnreadCount, null);
          }
        } catch {}
      });

      eventSource.addEventListener('broadcast-created', () => {
        // New broadcast created — fetch full list to sync
        fetchBroadcasts();
      });

      eventSource.addEventListener('broadcast-deleted', () => {
        fetchBroadcasts();
      });

      eventSource.onerror = () => {
        // EventSource auto-reconnects; polling fallback also covers gaps
      };
    };

    connectSSE();

    // Polling fallback (every 7 seconds)
    const interval = setInterval(fetchBroadcasts, 7000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [fetchBroadcasts]);

  const markOneRead = useCallback((id) => {
    const seenIds = getSeenIds();
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      saveSeenIds(seenIds);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const markAllRead = useCallback(() => {
    const currentIds = broadcasts.map((b) => b.id);
    const existing = getSeenIds();
    const merged = [...new Set([...existing, ...currentIds])];
    saveSeenIds(merged);
    setUnreadCount(0);
  }, [broadcasts]);

  return (
    <BroadcastContext.Provider value={{ broadcasts, unreadCount, fetchBroadcasts, markOneRead, markAllRead }}>
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcasts = () => useContext(BroadcastContext);
