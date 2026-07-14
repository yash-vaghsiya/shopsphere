process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const DATA_DIR = path.resolve('data');

const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const loadJson = (file, fallback) => {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {}
  return fallback;
};
const saveJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};

const getUserFromHeader = (req) => {
  const email = req.headers["x-user-email"] || req.headers["X-User-Email"] || null;
  const role = req.headers["x-user-role"] || req.headers["X-User-Role"] || "Customer";
  const userId = req.headers["x-user-id"] || req.headers["X-User-Id"] || null;
  const orderToken = req.headers["x-order-token"] || req.headers["X-Order-Token"] || null;
  return { email, role, userId, orderToken };
};

const products = [
  {
    id: 1,
    name: "Zenith Carbon-V X-1 Watch",
    brand: "Zenith",
    category: "Wearables",
    featured: true,
    trending: true,
    price: 14999,
    stock: 12,
    description: "Luxury sports smartwatch engineered with high-density carbon fiber and next-gen sensors.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Aerial Nova Soundbuds",
    brand: "AuraTone",
    category: "Audio",
    featured: true,
    trending: false,
    price: 7499,
    stock: 25,
    description: "Premium wireless earbuds with active noise cancellation and deep bass acoustics.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Vortex Apex Mechanical Keyboard",
    brand: "Crescent Labs",
    category: "Accessories",
    featured: false,
    trending: true,
    price: 6200,
    stock: 18,
    description: "Tactile mechanical keyboard with RGB backlight and premium aluminum chassis.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
  },
];


const orders = []; // in-memory only for backward-compatible order viewing; no JSON persistence

app.get('/api/products', async (req, res) => {
  try {
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Products`, {
      headers: { 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      return res.json(raw);
    }
  } catch {}
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Products/${req.params.id}`, {
      headers: { 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      return res.json(data);
    }
  } catch {}
  const product = products.find((item) => String(item.id) === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Helper: extract Bearer token from incoming request
const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
};

// Helper: fetch with timeout
const fetchWithTimeout = async (url, options, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

// Proxy: GET /api/coupons → .NET API GET /Discounts
app.get('/api/coupons', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    });
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      return res.json(raw.map(d => fromDotNetDiscount(d)));
    }
    res.status(dotNetRes.status).json(await dotNetRes.json().catch(() => ({ message: 'Proxy error' })));
  } catch {
    res.json([]);
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  const { code, amount } = req.body || {};
  if (!code) return res.status(400).json({ message: 'Coupon code is required' });

  const normalizedCode = String(code).trim().toUpperCase();
  const token = getBearerToken(req);

  try {
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    });

    if (!dotNetRes.ok) {
      const body = await dotNetRes.json().catch(() => null);
      return res.status(dotNetRes.status || 502).json(body || { message: 'Discount service returned an error' });
    }

    const data = await dotNetRes.json();
    const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
    const discounts = Array.isArray(raw) ? raw.map((d) => fromDotNetDiscount(d)) : [];
    const coupon = discounts.find((item) => String(item.code || '').trim().toUpperCase() === normalizedCode);

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Coupon not found or inactive' });
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (coupon.minCartAmount && Number(amount) < Number(coupon.minCartAmount)) {
      return res.status(400).json({ message: `You need a minimum cart amount of ₹${coupon.minCartAmount} to use this coupon.` });
    }

    return res.json(coupon);
  } catch (err) {
    console.error('[coupon validate] External API unreachable',  err?.message || err);
    return res.status(502).json({ message: 'External coupon service unreachable' });
  }
});

// Helper: convert camelCase discount to .NET API format (both camelCase and PascalCase)
const toDotNetDiscount = (body) => {
  const d = {};
  const P = (k, v) => { d[k] = v; d[k.charAt(0).toUpperCase() + k.slice(1)] = v; };

  if (body.code != null) {
    P('couponCode', String(body.code));
  }

  if (body.discountValue != null) {
    const num = Number(body.discountValue) || 0;
    if ((body.discountType || '').toLowerCase() === 'percentage') {
      P('discountPercent', num);
    } else {
      P('discountValue', num);
    }
  }

  if (body.minCartAmount != null) {
    P('minCartAmount', Number(body.minCartAmount) || 0);
  }

  if (body.maxUsage != null) {
    P('maxUsage', Number(body.maxUsage) || 0);
  }

  if (body.description != null) {
    P('description', String(body.description));
  }

  if (body.expiryDate != null && body.expiryDate !== '') {
    P('endDate', body.expiryDate);
    P('expiryDate', body.expiryDate);
  }

  if (body.isActive != null) {
    P('isActive', !!body.isActive);
  }

  return d;
};

// Helper: convert .NET API discount back to camelCase (same as normalizeDiscount)
const fromDotNetDiscount = (d) => ({
  id: d.id ?? d.discountId ?? d.DiscountId,
  code: d.code ?? d.couponCode ?? d.Code ?? d.CouponCode ?? '',
  discountType: d.discountType ?? d.DiscountType ?? (d.discountPercent != null ? 'percentage' : undefined),
  discountValue: d.discountValue ?? d.DiscountValue ?? d.discountPercent ?? d.DiscountPercent ?? 0,
  minCartAmount: d.minCartAmount ?? d.MinCartAmount ?? 0,
  expiryDate: d.expiryDate ?? d.ExpiryDate ?? d.endDate ?? d.EndDate,
  description: d.description ?? d.Description ?? '',
  isActive: d.isActive ?? d.IsActive ?? true,
  usageCount: d.usageCount ?? d.UsageCount ?? 0,
  maxUsage: d.maxUsage ?? d.MaxUsage ?? 0,
});

// ── Broadcast helpers ───────────────────────────────────────────────────
const toDotNetBroadcast = (body) => {
  const d = {};
  if (body.title != null) { d.title = String(body.title); d.Title = String(body.title); }
  if (body.message != null) { d.message = String(body.message); d.Message = String(body.message); }
  if (body.type != null) { d.type = String(body.type); d.Type = String(body.type); }
  return d;
};

const contentHash = (s) => {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};

const fromDotNetBroadcast = (d) => {
  const title = d.title ?? d.Title ?? '';
  const message = d.message ?? d.Message ?? '';
  const id = d.id ?? d.Id ?? d.broadcastId ?? d.BroadcastId ?? contentHash(title + message);
  const type = d.category ?? d.Category ?? d.type ?? d.Type ?? 'info';
  return {
    id, title, message, type,
    createdAt: d.createdAt ?? d.CreatedAt ?? new Date().toISOString(),
  };
};

// Proxy: POST /api/coupons → .NET API POST /Discounts
app.post('/api/coupons', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const requestBody = req.body || {};
    const body = toDotNetDiscount(requestBody);
    // Create PascalCase DTO for .NET API
    const pascalDto = {};
    Object.keys(body).forEach((k) => { pascalDto[k.charAt(0).toUpperCase() + k.slice(1)] = body[k]; });
    const dotNetBody = { dto: pascalDto, ...body, ...pascalDto };
    if (dotNetBody.EndDate == null && dotNetBody.endDate == null) { delete dotNetBody.endDate; delete dotNetBody.EndDate; }
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(dotNetBody),
    });
    if (!dotNetRes.ok) return res.status(dotNetRes.status).json({ message: 'Discount creation failed' });
    return res.status(201).json({ message: 'Discount Created' });
  } catch (e) {
    res.status(502).json({ message: 'External API unreachable' });
  }
});

// Proxy: PUT /api/coupons/:id → .NET API PUT /Discounts/{id}
// Fetches existing discount first, merges changes, then PUTs full object
app.put('/api/coupons/:id', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' };
    const id = req.params.id;
    const requestBody = req.body || {};

    // 1. Fetch existing discount from .NET API
    const getRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts/${id}`, { headers });
    if (!getRes.ok) {
      const errText = await getRes.text().catch(() => '');
      return res.status(getRes.status).json({ message: errText || 'Discount not found' });
    }
    const existing = await getRes.json();

    // 2. Merge incoming changes into existing fields
    const changes = toDotNetDiscount(requestBody);
    const pascalChanges = {};
    Object.keys(changes).forEach((k) => { pascalChanges[k.charAt(0).toUpperCase() + k.slice(1)] = changes[k]; });
    const merged = { ...existing, ...changes, ...pascalChanges };
    if (merged.discountId == null) merged.discountId = Number(id);

    // 3. PUT full merged object
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ dto: merged, ...merged }),
    });
    const text = await dotNetRes.text();
    try {
      const data = JSON.parse(text);
      if (dotNetRes.ok) return res.json(fromDotNetDiscount(data));
      return res.status(dotNetRes.status).json(data);
    } catch {
      if (dotNetRes.ok) return res.json(fromDotNetDiscount(merged));
      return res.status(dotNetRes.status).json({ message: text });
    }
  } catch (e) {
    res.status(502).json({ message: 'External API unreachable' });
  }
});

// Proxy: DELETE /api/coupons/:id → .NET API DELETE /Discounts/{id}
app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Discounts/${req.params.id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    });
    if (dotNetRes.ok) return res.json({ message: 'Coupon removed successfully' });
    res.status(dotNetRes.status).json(await dotNetRes.json().catch(() => ({ message: 'Delete failed' })));
  } catch {
    res.status(502).json({ message: 'External API unreachable' });
  }
});

// ── Broadcast endpoints (thin proxy to .NET API + SSE push) ──────────

const broadcastSSEClients = new Set();

const sendBroadcastSSE = (event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of broadcastSSEClients) {
    try { client.write(payload); } catch { broadcastSSEClients.delete(client); }
  }
};

// SSE endpoint for real-time broadcast push
app.get('/api/broadcasts/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`event: connected\ndata: {}\n\n`);

  try {
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Broadcasts`, {
      headers: { 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      const mapped = (Array.isArray(raw) ? raw : []).map(d => fromDotNetBroadcast(d));
      res.write(`event: broadcasts\ndata: ${JSON.stringify(mapped)}\n\n`);
    }
  } catch {}

  broadcastSSEClients.add(res);
  req.on('close', () => { broadcastSSEClients.delete(res); });
});

app.get('/api/broadcasts', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Broadcasts`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      const mapped = (Array.isArray(raw) ? raw : []).map(d => fromDotNetBroadcast(d));
      return res.json(mapped);
    }
    return res.status(dotNetRes.status).json({ message: 'Failed to fetch broadcasts' });
  } catch {
    res.json([]);
  }
});

app.post('/api/broadcasts', async (req, res) => {
  const b = req.body || {};
  const title = b.title ?? b.Title ?? '';
  const message = b.message ?? b.Message ?? '';
  const type = b.type ?? b.Type ?? 'info';
  if (!title || !message) {
    return res.status(400).json({ message: 'Broadcast title and message are required.' });
  }

  try {
    const token = getBearerToken(req);
    const body = { title: String(title).trim(), message: String(message).trim(), type: type || 'info' };
    const dotNetBody = { Title: body.title, Message: body.message, Category: body.type };
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Broadcasts`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(dotNetBody),
    }, 30000);
    if (dotNetRes.ok) {
      const created = { id: contentHash(body.title + body.message), title: body.title, message: body.message, type: body.type, createdAt: new Date().toISOString() };
      sendBroadcastSSE('broadcast-created', created);
      return res.status(201).json(created);
    }
    const text = await dotNetRes.text().catch(() => '');
    try { return res.status(dotNetRes.status).json(JSON.parse(text)); } catch { return res.status(dotNetRes.status).json({ message: text || dotNetRes.statusText }); }
  } catch (err) {
    res.status(502).json({ message: `Broadcast service unreachable: ${err?.message || err || 'unknown'}` });
  }
});

app.delete('/api/broadcasts/:id', async (req, res) => {
  const broadcastId = req.params.id;

  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Broadcasts/${broadcastId}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    });
    if (dotNetRes.ok || dotNetRes.status === 404) {
      sendBroadcastSSE('broadcast-deleted', { id: broadcastId });
      return res.json({ message: 'Broadcast removed successfully' });
    }
    return res.status(dotNetRes.status).json({ message: 'Delete failed' });
  } catch {
    res.status(502).json({ message: 'Broadcast service unreachable' });
  }
});

app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product || !product.name || !product.description || !product.image || product.price === undefined || product.stock === undefined) {
    return res.status(400).json({ message: 'Missing required product fields' });
  }

  const id = Date.now();
  const newProduct = {
    id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice !== undefined ? Number(product.originalPrice) : Number(product.price) * 1.25,
    image: product.image,
    category: product.category || 'General',
    stock: Number(product.stock),
    brand: product.brand || '',
    featured: product.featured || false,
    trending: product.trending || false,
    rating: product.rating || 0,
    reviews: product.reviews || [],
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updates = req.body || {};
  if (updates.name !== undefined) product.name = updates.name;
  if (updates.description !== undefined) product.description = updates.description;
  if (updates.price !== undefined) product.price = Number(updates.price);
  if (updates.originalPrice !== undefined) product.originalPrice = Number(updates.originalPrice);
  if (updates.category !== undefined) product.category = updates.category;
  if (updates.brand !== undefined) product.brand = updates.brand;
  if (updates.stock !== undefined) product.stock = Number(updates.stock);
  if (updates.image !== undefined) product.image = updates.image;

  res.json(product);
});

app.get('/api/orders', async (req, res) => {
  const { email, role, userId, orderToken } = getUserFromHeader(req);
  if (!email && role !== 'Admin' && !orderToken) {
    return res.status(401).json({ message: 'Unauthorized. Please log in to view your orders.' });
  }

  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Orders`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      if (Array.isArray(raw) && raw.length > 0) return res.json(raw);
    }
  } catch {}

  if (role === 'Admin') {
    return res.json(orders);
  }

  const filteredOrders = orders.filter((order) => {
    if (orderToken && order.ownerToken && String(order.ownerToken) === String(orderToken)) return true;
    if (userId && String(order.userId) === String(userId)) return true;
    if (email && order.email === email) return true;
    return false;
  });

  res.json(filteredOrders);
});

app.get('/api/orders/:id', async (req, res) => {
  const { email, role, userId, orderToken } = getUserFromHeader(req);
  // Try local orders first
  let order = orders.find((item) => String(item.id) === String(req.params.id));

  if (!order) {
    // Not found locally — try .NET API
    try {
      const token = getBearerToken(req);
      const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Orders/${req.params.id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      }, 5000);
      if (dotNetRes.ok) {
        const data = await dotNetRes.json();
        order = data?.data ?? data?.value ?? data;
      }
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (role === 'Admin') {
    return res.json(order);
  }

  if (orderToken && order.ownerToken && String(order.ownerToken) === String(orderToken)) {
    return res.json(order);
  }

  if (String(order.userId) !== String(userId) && order.email !== email) {
    return res.status(403).json({ message: 'Access denied. This order belongs to another user.' });
  }

  res.json(order);
});

// External API base URL for dynamic forwarding (server-to-server, no CORS)
const EXTERNAL_API = process.env.VITE_API_URL || 'https://localhost:7016/api';

const decodeJwtPayload = (token) => {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); } catch { return {}; }
};

// In-memory cache of .NET API auth results per email (avoids re-auth on every request)
const dotNetUserCache = new Map();

const dotNetAuth = async (email, password) => {
  try {
    const res = await fetch(`${EXTERNAL_API}/Auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dto: {}, email, password }),
    });
    if (res.ok) {
      const d = await res.json();
      const token = d.token;
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) return null;
      const payload = decodeJwtPayload(token);
      const userId = payload.UserId || payload.userId || '';
      if (!userId) return null;
      return { token, userId };
    }
  } catch {}
  return null;
};

const dotNetRegister = async (email, password) => {
  try {
    const name = email.split('@')[0];
    const res = await fetch(`${EXTERNAL_API}/Auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dto: {}, firstName: name, lastName: '', phone: '', email, password }),
    });
    return res;
  } catch { return null; }
};

const cacheDotNetUser = (email, result) => {
  const payload = decodeJwtPayload(result.token);
  const exp = (parseInt(payload.exp, 10) || 0) * 1000;
  result.expiresAt = exp || (Date.now() + 3600000);
  dotNetUserCache.set(email, result);
};

const ensureDotNetUser = async (email) => {
  try {
    if (!email) return null;
    const cached = dotNetUserCache.get(email);
    if (cached) {
      const exp = cached.expiresAt || 0;
      if (Date.now() < exp) return cached;
      dotNetUserCache.delete(email);
    }
    const passwords = [`auto_${email}`, `google_${email}`];
    for (const pwd of passwords) {
      let result = await dotNetAuth(email, pwd);
      if (result) { cacheDotNetUser(email, result); return result; }
      await dotNetRegister(email, pwd).catch(() => {});
      result = await dotNetAuth(email, pwd);
      if (result) { cacheDotNetUser(email, result); return result; }
    }
  } catch (err) { console.error(`[ensureDotNetUser] threw:`, err); }
  return null;
};

// Proxy: create order directly on .NET API (SQL Server) — no special service account needed
app.post('/api/orders/proxy', async (req, res) => {
  try {
    const order = req.body || {};
    if (!order.customerName || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ message: 'Customer details and items are required.' });
    }
    const userEmail = order.email || '';
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const jwtPayload = decodeJwtPayload(token);
    let dotNetUserId = jwtPayload.UserId || jwtPayload.userId || '';
    let dotNetToken = token;
    if (!dotNetUserId) {
      // No valid JWT — try ensureDotNetUser or register fallback
      let dotNetUser;
      try { dotNetUser = await ensureDotNetUser(userEmail); } catch { dotNetUser = null; }
      if (!dotNetUser || !dotNetUser.userId) {
        try {
          const pwd = `auto_${userEmail}`;
          await dotNetRegister(userEmail, pwd);
          dotNetUser = await dotNetAuth(userEmail, pwd);
          if (dotNetUser) {/* no-op */}
        } catch {}
      }
      if (dotNetUser && dotNetUser.userId) {
        dotNetUserId = dotNetUser.userId;
        dotNetToken = dotNetUser.token;
      }
    }
    if (!dotNetUserId) {
      // All auth paths failed — create order locally as last resort
      const localOrder = {
        id: Date.now(), createdAt: new Date().toISOString(), status: order.status || 'Pending',
        customerName: order.customerName || '', email: userEmail, items: order.items,
        subtotal: Number(order.subtotal) || 0, shipping: Number(order.shipping) || 0,
        tax: Number(order.tax) || 0, discount: Number(order.discount) || 0,
        discountPercent: Number(order.discountPercent) || 0, total: Number(order.total) || 0,
        paymentMethod: order.paymentMethod || '', couponCode: order.couponCode || null,
        shippingAddress: order.shippingAddress || {},
      };
      orders.push(localOrder);
      return res.status(201).json(localOrder);
    }
    const orderItems = (order.items || []).map(it => ({
      productId: it.productId || it.id || 0, name: it.name || '', price: it.price || 0,
      quantity: it.quantity || 1, image: it.image || '',
    }));
    let shippingAddressStr = '{}';
    try { shippingAddressStr = JSON.stringify({ ...(order.shippingAddress || {}), _items: orderItems }); } catch (e) { shippingAddressStr = JSON.stringify({ _items: orderItems }); }
    const productNamesJoined = orderItems.map(it => it.name).join(' | ') || '';
    const dotNetPayload = {
      UserId: dotNetUserId,
      OrderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      Total: Number(order.total) || 0, Status: order.status || 'Pending',
      PaymentMethod: order.paymentMethod || '', OrderItems: orderItems,
      ShippingAddress: shippingAddressStr, CreatedAt: new Date().toISOString(),
      CustomerName: order.customerName || '',
      ProductName: productNamesJoined.length > 200 ? productNamesJoined.slice(0, 197) + '...' : productNamesJoined,
      Quantity: orderItems.reduce((sum, it) => sum + it.quantity, 0) || 0,
      Discount: Number(order.discount) || 0,
      DiscountPercent: Number(order.discountPercent) || 0,
      CouponCode: order.couponCode || null,
    };
    let dotNetRes;
    try {
      dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(dotNetToken ? { Authorization: `Bearer ${dotNetToken}` } : {}) },
        body: JSON.stringify(dotNetPayload),
      }, 15000);
    } catch (fetchErr) {
      console.error(`[orders/proxy] .NET API unreachable, falling back to local order.`);
      const localOrder = {
        id: Date.now(), createdAt: new Date().toISOString(), status: order.status || 'Pending',
        customerName: order.customerName || '', email: userEmail, items: order.items,
        subtotal: Number(order.subtotal) || 0, shipping: Number(order.shipping) || 0,
        tax: Number(order.tax) || 0, discount: Number(order.discount) || 0,
        discountPercent: Number(order.discountPercent) || 0, total: Number(order.total) || 0,
        paymentMethod: order.paymentMethod || '', couponCode: order.couponCode || null,
        shippingAddress: order.shippingAddress || {},
      };
      orders.push(localOrder);
      return res.status(201).json(localOrder);
    }
    if (dotNetRes.ok) {
      const text = await dotNetRes.text();
      let obj;
      try { obj = text ? JSON.parse(text) : {}; } catch { obj = null; }
      const netResult = obj?.data ?? obj?.value ?? obj ?? {};
      // Merge in discount/coupon fields from original request (may not be returned by .NET)
      const merged = { ...netResult, ...{ discount: Number(order.discount) || 0, discountPercent: Number(order.discountPercent) || 0, couponCode: order.couponCode || null, shipping: Number(order.shipping) || 0, tax: Number(order.tax) || 0, subtotal: Number(order.subtotal) || 0 } };
      // Store locally so GET /api/orders/:id finds it here instead of re-fetching from .NET (which drops discount fields)
      if (merged.id || netResult.id) orders.push(merged);
      return res.status(201).json(merged);
    }
    // .NET API rejected the order — fall back to local creation so the user's order isn't lost
    console.error(`[orders/proxy] .NET API returned ${dotNetRes.status}, falling back to local order.`);
    const fallbackOrder = {
      id: Date.now(), createdAt: new Date().toISOString(), status: order.status || 'Pending',
      customerName: order.customerName || '', email: userEmail, items: order.items,
      subtotal: Number(order.subtotal) || 0, shipping: Number(order.shipping) || 0,
      tax: Number(order.tax) || 0, discount: Number(order.discount) || 0,
      discountPercent: Number(order.discountPercent) || 0, total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod || '', couponCode: order.couponCode || null,
      shippingAddress: order.shippingAddress || {},
    };
    orders.push(fallbackOrder);
    return res.status(201).json(fallbackOrder);
  } catch (e) {
    console.error('[server] Order proxy UNCAUGHT error:', e?.stack || e);
    return res.status(500).json({ message: 'Internal order processing error.' });
  }
});

// Proxy: update order status on .NET API (SQL Server)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, email } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ message: 'Order ID and status are required.' });
    }
    const authHeader = req.headers.authorization || '';
    const authToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const jwtPayload = decodeJwtPayload(authToken);
    let dotNetUserId = jwtPayload.UserId || jwtPayload.userId || '';
    let dotNetToken = authToken;
    if (!dotNetUserId) {
      let dotNetUser = await ensureDotNetUser(email || '');
      if (!dotNetUser || !dotNetUser.userId) {
        try {
          const pwd = `auto_${email || ''}`;
          await dotNetRegister(email || '', pwd);
          dotNetUser = await dotNetAuth(email || '', pwd);
          if (dotNetUser) {/* no-op */}
        } catch (e) {}
      }
      if (dotNetUser && dotNetUser.userId) {
        dotNetUserId = dotNetUser.userId;
        dotNetToken = dotNetUser.token;
      }
    }
    if (!dotNetUserId) {
      // .NET API auth unavailable — fall back to Express-local update
      const order = orders.find((item) => String(item.id) === String(id));
      if (order) { order.status = status; return res.json({ id: Number(id), status }); }
      return res.status(404).json({ message: 'Order not found locally.' });
    }
    const dotNetRes = await fetch(`${EXTERNAL_API}/Orders/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(dotNetToken ? { Authorization: `Bearer ${dotNetToken}` } : {}) },
    });
    if (dotNetRes.ok) {
      console.log(`[server] Order ${id} status updated to ${status} in SQL DB`);
      return res.json({ id: Number(id), status });
    }
    const errText = await dotNetRes.text().catch(() => '');
    console.error(`[server] .NET API status update failed (${dotNetRes.status}): ${errText}`);
    const statusCode = dotNetRes.status >= 500 ? 502 : dotNetRes.status;
    return res.status(statusCode).json({ message: `Order server error: ${errText.slice(0, 300) || 'Unknown error'}` });
  } catch (e) {
    console.error('[server] Status update proxy error:', e.message);
    return res.status(502).json({ message: 'Order server unreachable.' });
  }
});

app.patch('/api/orders/:id', (req, res) => {
  const order = orders.find((item) => String(item.id) === String(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  const updates = req.body || {};
  if (updates.status !== undefined) order.status = updates.status;
  if (updates.customerName !== undefined) order.customerName = updates.customerName;
  if (updates.shippingAddress !== undefined) order.shippingAddress = updates.shippingAddress;
  res.json(order);
});

let categories = loadJson(CATEGORIES_FILE, []);

app.get('/api/categories', async (req, res) => {
  try {
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Categories`, {
      headers: { 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      if (Array.isArray(raw) && raw.length > 0) return res.json(raw);
    }
  } catch {}
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const { categoryName, name } = req.body || {};
  const catName = categoryName || name || '';
  if (!catName.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  if (categories.some(c => c.name?.toLowerCase() === catName.trim().toLowerCase())) {
    return res.status(400).json({ message: 'Category already exists' });
  }
  const newCat = { id: Date.now(), name: catName.trim(), createdAt: new Date().toISOString() };
  categories.unshift(newCat);
  saveJson(CATEGORIES_FILE, categories);
  res.status(201).json(newCat);
});

app.delete('/api/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Category not found' });
  categories.splice(idx, 1);
  saveJson(CATEGORIES_FILE, categories);
  res.json({ message: 'Category deleted' });
});

app.patch('/api/products/:id/discount', (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updates = req.body || {};
  if (updates.price !== undefined) {
    product.price = Number(updates.price);
  }
  if (updates.originalPrice !== undefined) {
    product.originalPrice = updates.originalPrice !== null ? Number(updates.originalPrice) : null;
  }
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const index = products.findIndex((item) => item.id === productId);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(index, 1);
  res.json({ message: 'Product removed successfully' });
});

// Newsletter subscribers (in-memory)
const subscribers = [];


// Helper: forward auth request to external API
const forwardAuth = async (endpoint, body) => {
  try {
    const url = `${EXTERNAL_API}${endpoint}`;
    console.log(`[forwardAuth] → POST ${url}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[forwardAuth] ✓ ${res.status} from ${endpoint}`);
      return { ok: true, data };
    }
    const errData = await res.json().catch(() => ({}));
    console.log(`[forwardAuth] ✗ ${res.status} from ${endpoint}:`, errData);
    return { ok: false, status: res.status, message: errData.message || errData.title || 'External auth failed' };
  } catch (err) {
    console.error(`[forwardAuth] ✗ Network error for ${endpoint}:`, err.message);
    return { ok: false, message: 'External API unreachable' };
  }
};

// Auth endpoints: proxy to .NET API
app.get('/api/auth/me', async (req, res) => {
  const { email, role, userId } = getUserFromHeader(req);
  if (!email && !userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Customers/by-email/${encodeURIComponent(email || '')}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const c = await dotNetRes.json();
      return res.json({ user: { id: c.id, name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email?.split('@')[0] || 'User', email: c.email || '', phone: c.phone || '', role: c.role || 'Customer', address: c.address, city: c.city, state: c.state, zipCode: c.zipCode } });
    }
  } catch {}
  const token = getBearerToken(req);
  if (token) {
    const jwtPayload = decodeJwtPayload(token);
    const id = jwtPayload.UserId || jwtPayload.userId || jwtPayload.sub || userId || '';
    const jwtEmail = jwtPayload.Email || jwtPayload.email || jwtPayload.preferred_username || email || '';
    return res.json({ user: { id, name: jwtEmail.split('@')[0] || 'User', email: jwtEmail, role: jwtPayload.Role || jwtPayload.role || role || 'Customer' } });
  }
  res.json({ user: { id: userId || Date.now(), name: 'User', email: email || '', role: role || 'Customer' } });
});

app.patch('/api/auth/me', async (req, res) => {
  const { email, userId } = getUserFromHeader(req);
  if (!email && !userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/Customers/by-email/${encodeURIComponent(email || '')}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const existing = await dotNetRes.json();
      const customerId = existing.id;
      const updates = req.body || {};
      const putBody = {
        id: customerId,
        firstName: updates.name?.split(' ')[0] || existing.firstName || '',
        lastName: updates.name?.split(' ').slice(1).join(' ') || existing.lastName || '',
        email: existing.email || email,
        phone: updates.phone ?? existing.phone ?? '',
        address: updates.address ?? existing.address ?? '',
        city: updates.city ?? existing.city ?? '',
        state: updates.state ?? existing.state ?? '',
        zipCode: updates.zipCode ?? existing.zipCode ?? '',
      };
      const putRes = await fetchWithTimeout(`${EXTERNAL_API}/Customers/${customerId}`, {
        method: 'PUT',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify(putBody),
      }, 5000);
      if (putRes.ok) {
        const updated = await putRes.json();
        return res.json({ user: { id: updated.id, name: [updated.firstName, updated.lastName].filter(Boolean).join(' ').trim() || updated.email?.split('@')[0] || 'User', email: updated.email || '', phone: updated.phone || '', role: updated.role || 'Customer', address: updated.address, city: updated.city, state: updated.state, zipCode: updated.zipCode } });
      }
    }
  } catch {}
  return res.status(503).json({ message: 'Profile update service unavailable. Please try again later.' });
});

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Async error in', req.method, req.path, err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

app.post('/api/auth/register', wrapAsync(async (req, res) => {
  const body = req.body || {};
  // Tolerant field extraction — never return 4xx, use defaults for anything missing
  const firstName = body.firstName || body.name || '';
  const lastName = body.lastName || '';
  const phone = body.phone || '';
  const email = body.email || '';
  const password = body.password || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  if (!firstName || !email || !password) {
    console.warn('Register fallback defaults used - body keys:', Object.keys(body));
  }
  // Try external API first (server-to-server, no CORS)
  const ext = await forwardAuth('/Auth/register', { dto: {}, firstName, lastName: lastName || '', phone: phone || '', email, password });
  if (ext.ok) {
    // .NET register returns only { success, message } — no user/token → login to get them
    const loginExt = await forwardAuth('/Auth/login', { dto: {}, email, password });
    if (loginExt.ok) {
      const token = loginExt.data.token;
      const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
      const userId = String(jwtPayload.UserId || jwtPayload.userId || '');
      const user = { id: userId, name: fullName, email, phone, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer' };
      return res.status(201).json({ user, token });
    }
  }
  if (ext.message === 'External API unreachable') {
    // Fallback: session-only mock token (no persistence)
    const mockId = `mock_${Date.now()}`;
    const mockToken = `mock-jwt-${mockId}`;
    const user = { id: mockId, name: fullName, email, phone, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer' };
    return res.status(201).json({ user, token: mockToken });
  }
  return res.status(ext.status || 500).json({ message: ext.message || 'Registration failed' });
}));

app.post('/api/auth/login', wrapAsync(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    console.warn('Login 400 - body:', JSON.stringify(req.body));
    return res.status(400).json({ message: 'Missing email or password' });
  }
  // Try external API first (server-to-server, no CORS)
  const ext = await forwardAuth('/Auth/login', { dto: {}, email, password });
  if (ext.ok) {
    const token = ext.data.token;
    const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    const userId = String(jwtPayload.UserId || jwtPayload.userId || '');
    const user = { id: userId, name: email.split('@')[0], email, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer' };
    return res.json({ user, token });
  }
  if (ext.message === 'External API unreachable') {
    // Fallback: session-only mock token (no persistence)
    const mockId = `mock_${Date.now()}`;
    const mockToken = `mock-jwt-${mockId}`;
    const user = { id: mockId, name: email.split('@')[0], email, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer' };
    return res.json({ user, token: mockToken });
  }
  return res.status(ext.status || 401).json({ message: ext.message || 'Invalid email or password.' });
}));

// Google OAuth (Sign In With Google)
app.post('/api/auth/google', wrapAsync(async (req, res) => {
  const { credential, formData, mode } = req.body || {};
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  let payload;
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ message: 'Invalid Google credential format' });
    }
    payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
  } catch {
    return res.status(401).json({ message: 'Failed to decode Google credential' });
  }

  if (!payload || !payload.email) {
    return res.status(401).json({ message: 'Invalid Google credential payload' });
  }

  const email = formData?.email || payload.email;
  const firstName = formData?.firstName || payload.name || payload.given_name || email.split('@')[0];
  const lastName = formData?.lastName || payload.family_name || '';
  const phone = formData?.phone || '';
  const name = `${firstName} ${lastName}`.trim() || email.split('@')[0];
  const picture = payload.picture || '';
  const googlePassword = `google_${email}`;

  // Try .NET API register first (signup) or login (existing user)
  const reg = await forwardAuth('/Auth/register', { dto: {}, firstName, lastName, phone, email, password: googlePassword });
  let dotNetToken = '';
  let dotNetUserId = '';
  if (reg.ok) {
    // Registered → login to get JWT
    const loginExt = await forwardAuth('/Auth/login', { dto: {}, email, password: googlePassword });
    if (loginExt.ok) {
      dotNetToken = loginExt.data.token;
      const jwt = JSON.parse(Buffer.from(dotNetToken.split('.')[1], 'base64').toString('utf-8'));
      dotNetUserId = String(jwt.UserId || jwt.userId || '');
    }
  } else if (reg.status !== 500 || !reg.message?.includes('UNIQUE KEY')) {
    // .NET register failed for non-duplicate reason → try login (existing user might work)
    const loginExt = await forwardAuth('/Auth/login', { dto: {}, email, password: googlePassword });
    if (loginExt.ok) {
      dotNetToken = loginExt.data.token;
      const jwt = JSON.parse(Buffer.from(dotNetToken.split('.')[1], 'base64').toString('utf-8'));
      dotNetUserId = String(jwt.UserId || jwt.userId || '');
    }
  }

  if (dotNetToken && dotNetUserId) {
    return res.json({ token: dotNetToken, user: { id: dotNetUserId, email, name, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer', picture } });
  }

  if (reg.message === 'External API unreachable') {
    // Fallback: session-only mock token (no persistence)
    const mockId = `mock_${Date.now()}`;
    const mockToken = `mock-jwt-${mockId}`;
    return res.json({ token: mockToken, user: { id: mockId, email, name, role: String(email).toLowerCase().includes("admin") ? 'Admin' : 'Customer', picture } });
  }
  return res.status(reg.status || 500).json({ message: reg.message || 'Google sign-in failed' });
}));

// Newsletter endpoints
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const exists = subscribers.some(s => s.email === email);
  if (exists) {
    return res.status(400).json({ message: 'Email is already subscribed' });
  }
  subscribers.push({ id: Date.now(), email, subscribedAt: new Date().toISOString() });
  res.status(201).json({ message: 'Subscribed successfully! Welcome to ShopSphere updates.' });
});

app.get('/api/newsletter/subscribers', (req, res) => {
  res.json(subscribers);
});

app.delete('/api/newsletter/subscribers/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = subscribers.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Subscriber not found' });
  }
  subscribers.splice(index, 1);
  res.json({ message: 'Subscriber removed' });
});

// ── Contact Queries (proxy to .NET API) ──────────────────

app.get('/api/contact/queries', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/ContactQueries`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.$values ?? data?.data ?? data?.value ?? [];
      const mapped = (Array.isArray(raw) ? raw : []).map(d => ({
        id: d.queryId ?? d.QueryId ?? d.id ?? d.Id,
        name: d.name ?? d.Name ?? '',
        email: d.email ?? d.Email ?? '',
        subject: d.subject ?? d.Subject ?? '',
        message: d.message ?? d.Message ?? '',
        reply: d.reply ?? d.Reply ?? null,
        status: d.status ?? d.Status ?? 'pending',
        createdAt: d.createdAt ?? d.CreatedAt ?? new Date().toISOString(),
        repliedAt: d.repliedAt ?? d.RepliedAt ?? null,
      }));
      return res.json(mapped);
    }
  } catch {}
  res.json([]);
});

app.delete('/api/contact/queries/:id', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/ContactQueries/${req.params.id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    }, 5000);
    if (dotNetRes.ok) return res.json({ message: 'Query deleted permanently' });
    const text = await dotNetRes.text().catch(() => '');
    return res.status(dotNetRes.status).json({ message: text || 'Delete failed' });
  } catch (err) {
    res.status(502).json({ message: `Delete failed: ${err?.message || err || 'unknown'}` });
  }
});

// ── Contact Form Submit (proxy to .NET API + email via SMTP) ──────────
import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('[SMTP] Missing SMTP_* environment variables. Emails will not be sent.');
}
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
});

app.post('/api/contact/submit', async (req, res) => {
  const b = req.body || {};
  const name = b.name ?? b.Name ?? '';
  const email = b.email ?? b.Email ?? '';
  const subject = b.subject ?? b.Subject ?? '';
  const message = b.message ?? b.Message ?? '';
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const token = getBearerToken(req);
    const dotNetRes = await fetchWithTimeout(`${EXTERNAL_API}/ContactQueries`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Email: email, Subject: subject, Message: message }),
    }, 15000);
    if (!dotNetRes.ok) {
      const text = await dotNetRes.text().catch(() => '');
      return res.status(dotNetRes.status).json({ message: text || 'Database save failed' });
    }

    const mailTo = process.env.SMTP_TO || process.env.SMTP_USER || '';
    if (mailTo) {
      const displayName = name || email.split('@')[0] || 'Customer';
      smtpTransport.sendMail({
        from: `"${displayName} via ShopSphere" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: mailTo,
        subject: `New Contact Query: ${subject}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p><hr><p style="color:#888;font-size:12px;">Sent from ShopSphere contact form</p>`,
      }).catch(err => console.warn('[contact] Email send failed:', err.message));
    }

    res.status(201).json({ message: 'Query submitted successfully' });
  } catch (err) {
    res.status(502).json({ message: `Contact service unreachable: ${err?.message || err || 'unknown'}` });
  }
});

// Proxy: GET /api/dashboard/top-products → .NET API
app.get('/api/dashboard/top-products', async (req, res) => {
  try {
    const dotNetRes = await fetch(`${EXTERNAL_API}/Dashboard/top-products`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      return res.json(data);
    }
    res.status(dotNetRes.status).json({ message: 'Failed to fetch top products' });
  } catch {
    res.json([]);
  }
});

// Users endpoint (admin customers)
app.get('/api/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const dotNetRes = await fetch(`${EXTERNAL_API}/customers`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (dotNetRes.ok) {
      const data = await dotNetRes.json();
      const raw = Array.isArray(data) ? data : data?.data ?? data?.value ?? [];
      const mapped = raw.map(c => ({
        id: c.id,
        name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email?.split('@')[0] || 'User',
        email: c.email || '',
        role: String(c.email).toLowerCase().includes('admin') ? 'Admin' : 'Customer',
        phone: c.phone || '',
        isActive: c.isActive,
        createdAt: c.createdAt,
      }));
      return res.json(mapped);
    }
  } catch {}
  res.json([]);
});

// In-memory cart store per user (keyed by email)
const userCarts = {};

// Cart endpoints
app.get('/api/cart', (req, res) => {
  const user = getUserFromHeader(req);
  const key = user.email || 'anonymous';
  if (!userCarts[key]) userCarts[key] = [];
  res.json(userCarts[key]);
});

app.post('/api/cart/sync', (req, res) => {
  const user = getUserFromHeader(req);
  const key = user.email || 'anonymous';
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Cart items must be an array' });
  }
  userCarts[key] = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    image: item.image || '',
    quantity: Math.max(1, Number(item.quantity) || 1),
  }));
  res.json({ message: 'Cart synced' });
});

// AI Chat endpoint
app.post('/api/ai-chat', (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  const lowerMsg = message.toLowerCase();
  let text = '';
  if (lowerMsg.includes('coupon') || lowerMsg.includes('discount') || lowerMsg.includes('offer')) {
    text = 'We have active coupons: **SHOP10** (10% off) and **RARE50** (₹50 off on ₹500+). Head to the Home page to explore more deals!';
  } else if (lowerMsg.includes('watch') || lowerMsg.includes('zenith')) {
    text = 'The **Zenith Carbon-V X-1** is our flagship smartwatch at ₹14,999 — carbon fiber build, next-gen sensors, and 12 in stock!';
  } else if (lowerMsg.includes('gaming') || lowerMsg.includes('keyboard')) {
    text = 'Check out the **Vortex Apex Mechanical Keyboard** by Crescent Labs at ₹6,200 — RGB backlit, aluminum chassis, tactile switches!';
  } else if (lowerMsg.includes('audio') || lowerMsg.includes('earbud') || lowerMsg.includes('soundbud')) {
    text = 'The **Aerial Nova Soundbuds** by AuraTone at ₹7,499 feature active noise cancellation and deep bass. Top rated in Audio!';
  } else if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery')) {
    text = 'We offer **free shipping** on all orders above ₹4,999! Standard delivery takes 3-5 business days.';
  } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
    text = 'ShopSphere offers **30-day easy returns** on all products. Items must be unused with original packaging.';
  } else {
    text = 'Thank you for reaching out to **Iris**, your ShopSphere butler! You can ask me about products, coupons, shipping, or returns. Browse our Shop page for the latest collections!';
  }
  res.json({ text });
});

app.use(
  express.static(path.join(process.cwd(), 'dist'), {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },
  })
);

app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Project started! Open http://localhost:${PORT} to view it.`);
  console.log(`   .NET API target: ${EXTERNAL_API}`);
});