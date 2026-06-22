import express from 'express';
import path from 'path';
import fs from 'fs';

// Allow server-to-server fetch to accept self-signed .NET dev certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const DATA_DIR = path.resolve('data');
const BROADCASTS_FILE = path.join(DATA_DIR, 'broadcasts.json');
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

const coupons = [
  {
    id: 1,
    code: "SHOP10",
    discountType: "percentage",
    discountValue: 10,
    description: "Save 10% on your next order.",
    minCartAmount: 0,
    expiryDate: null,
    usageCount: 0,
    isActive: true,
  },
  {
    id: 2,
    code: "RARE50",
    discountType: "fixed",
    discountValue: 50,
    description: "Take ₹50 off premium items.",
    minCartAmount: 500,
    expiryDate: null,
    usageCount: 0,
    isActive: true,
  },
];

const broadcasts = loadJson(BROADCASTS_FILE, [
  {
    id: 1,
    title: "Weekend Flash Sale",
    message: "ShopSphere is offering up to 25% off select luxury goods this weekend only!",
    type: "offer",
    createdAt: new Date().toISOString(),
  },
]);

const orders = [];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => String(item.id) === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, amount } = req.body || {};
  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  const normalizedCode = String(code).trim().toUpperCase();
  const coupon = coupons.find((item) => item.code === normalizedCode);
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ message: 'Coupon not found or inactive' });
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({ message: 'Coupon has expired' });
  }

  if (coupon.minCartAmount && Number(amount) < coupon.minCartAmount) {
    return res.status(400).json({ message: `You need a minimum cart amount of ₹${coupon.minCartAmount} to use this coupon.` });
  }

  res.json(coupon);
});

app.post('/api/coupons', (req, res) => {
  const coupon = req.body;
  if (!coupon || !coupon.code || !coupon.discountType || !coupon.discountValue) {
    return res.status(400).json({ message: 'Missing coupon details' });
  }

  const code = String(coupon.code).trim().toUpperCase();
  const alreadyExists = coupons.some((item) => item.code === code);
  if (alreadyExists) {
    return res.status(400).json({ message: 'Coupon code already exists' });
  }

  const id = Date.now();
  const newCoupon = {
    id,
    code,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    description: coupon.description || '',
    minCartAmount: Number(coupon.minCartAmount) || 0,
    expiryDate: coupon.expiryDate || null,
    isActive: coupon.isActive !== false,
    usageCount: coupon.usageCount || 0,
  };

  coupons.push(newCoupon);
  res.status(201).json(newCoupon);
});

app.patch('/api/coupons/:id', (req, res) => {
  const couponId = Number(req.params.id);
  const coupon = coupons.find((item) => item.id === couponId);
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }

  const updates = req.body || {};
  if (updates.code) coupon.code = String(updates.code).trim().toUpperCase();
  if (updates.discountType) coupon.discountType = updates.discountType;
  if (updates.discountValue !== undefined) coupon.discountValue = Number(updates.discountValue);
  if (updates.minCartAmount !== undefined) coupon.minCartAmount = Number(updates.minCartAmount);
  if (updates.expiryDate !== undefined) coupon.expiryDate = updates.expiryDate || null;
  if (updates.description !== undefined) coupon.description = updates.description;
  if (updates.isActive !== undefined) coupon.isActive = Boolean(updates.isActive);

  res.json(coupon);
});

app.delete('/api/coupons/:id', (req, res) => {
  const couponId = Number(req.params.id);
  const index = coupons.findIndex((item) => item.id === couponId);
  if (index === -1) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  coupons.splice(index, 1);
  res.json({ message: 'Coupon removed successfully' });
});

app.get('/api/broadcasts', (req, res) => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (let i = broadcasts.length - 1; i >= 0; i--) {
    const age = now - new Date(broadcasts[i].createdAt).getTime();
    if (age > TWENTY_FOUR_HOURS) {
      broadcasts.splice(i, 1);
    }
  }
  saveJson(BROADCASTS_FILE, broadcasts);
  res.json(broadcasts);
});

app.post('/api/broadcasts', (req, res) => {
  const { title, message, type } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ message: 'Broadcast title and message are required.' });
  }

  const id = Date.now();
  const newBroadcast = {
    id,
    title,
    message,
    type: type || 'info',
    createdAt: new Date().toISOString(),
  };

  broadcasts.unshift(newBroadcast);
  saveJson(BROADCASTS_FILE, broadcasts);
  res.status(201).json(newBroadcast);
});

app.delete('/api/broadcasts/:id', (req, res) => {
  const broadcastId = String(req.params.id);
  const index = broadcasts.findIndex((item) => String(item.id) === broadcastId);
  if (index === -1) {
    return res.status(404).json({ message: 'Broadcast not found' });
  }
  broadcasts.splice(index, 1);
  saveJson(BROADCASTS_FILE, broadcasts);
  res.json({ message: 'Broadcast removed successfully' });
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

app.get('/api/orders', (req, res) => {
  const { email, role, userId, orderToken } = getUserFromHeader(req);
  if (!email && role !== 'Admin' && !orderToken) {
    return res.status(401).json({ message: 'Unauthorized. Please log in to view your orders.' });
  }

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

app.get('/api/orders/:id', (req, res) => {
  const { email, role, userId, orderToken } = getUserFromHeader(req);
  const order = orders.find((item) => String(item.id) === String(req.params.id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (role === 'Admin') {
    return res.json(order);
  }

  // Allow access if owner token matches (for guest/anonymous buyers)
  if (orderToken && order.ownerToken && String(order.ownerToken) === String(orderToken)) {
    return res.json(order);
  }

  if (String(order.userId) !== String(userId) && order.email !== email) {
    return res.status(403).json({ message: 'Access denied. This order belongs to another user.' });
  }

  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const order = req.body || {};
  if (!order.customerName || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return res.status(400).json({ message: 'Invalid order payload. Customer details and items are required.' });
  }

  const { email: headerEmail, userId: headerUserId } = getUserFromHeader(req);
  const ownerToken = String(Date.now()) + '-' + Math.floor(Math.random() * 1000000);
  const newOrder = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: order.status || 'Pending',
    customerName: order.customerName || 'Guest Shopper',
    email: headerEmail || order.email || 'guest@shopsphere.com',
    userId: headerUserId || order.userId || null,
    ownerToken,
    items: order.items,
    subtotal: Number(order.subtotal) || 0,
    shipping: Number(order.shipping) || 0,
    tax: Number(order.tax) || 0,
    discount: Number(order.discount) || 0,
    discountPercent: Number(order.discountPercent) || 0,
    total: Number(order.total) || 0,
    paymentMethod: order.paymentMethod || 'COD',
    couponCode: order.couponCode || null,
    shippingAddress: order.shippingAddress || {},
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id', (req, res) => {
  const orderId = Number(req.params.id);
  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  const updates = req.body || {};
  if (updates.status) order.status = updates.status;
  if (updates.customerName) order.customerName = updates.customerName;
  if (updates.shippingAddress) order.shippingAddress = updates.shippingAddress;
  res.json(order);
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

// Contact queries (in-memory)
const contactQueries = [];

// In-memory user store for mock auth fallback
const users = [];

// External API base URL for dynamic forwarding (server-to-server, no CORS)
const EXTERNAL_API = process.env.VITE_API_URL || 'https://localhost:7015/api';

// Helper: forward auth request to external API
const forwardAuth = async (endpoint, body) => {
  try {
    const res = await fetch(`${EXTERNAL_API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    const errData = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: errData.message || errData.title || 'External auth failed' };
  } catch {
    return { ok: false, message: 'External API unreachable' };
  }
};

// Mock auth endpoints
app.get('/api/auth/me', (req, res) => {
  const { email, role, userId } = getUserFromHeader(req);
  if (!email && !userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  let user = users.find(u => u.email === email || String(u.id) === String(userId));
  if (!user) {
    user = { id: userId || Date.now(), name: 'User', email: email || 'guest@shopsphere.com', role: role || 'Customer' };
  }
  res.json({ user });
});

app.patch('/api/auth/me', (req, res) => {
  const { email, userId } = getUserFromHeader(req);
  if (!email && !userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const updates = req.body || {};
  let user = users.find(u => u.email === email || String(u.id) === String(userId));
  if (!user) {
    user = { id: userId || Date.now(), email, role: 'Customer' };
    users.push(user);
  }
  if (updates.name) user.name = updates.name;
  if (updates.phone) user.phone = updates.phone;
  if (updates.address) user.address = updates.address;
  if (updates.city) user.city = updates.city;
  if (updates.state) user.state = updates.state;
  if (updates.zipCode) user.zipCode = updates.zipCode;
  res.json({ user });
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
  const ext = await forwardAuth('/Auth/register', { firstName, lastName: lastName || '', phone: phone || '', email, password });
  if (ext.ok) {
    const extUser = ext.data.user || {};
    const user = { id: extUser.id || Date.now(), name: extUser.name || fullName, email, phone: phone || extUser.phone || '', role: extUser.role || 'Customer' };
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) users[idx] = user; else users.push(user);
    return res.status(201).json({ user, token: ext.data.token });
  }
  // Fall back to local mock — store password for credential verification
  const id = Date.now();
  const isAdmin = String(email).toLowerCase().includes("admin");
  const user = { id, name: fullName, email, phone: phone || '', password, role: isAdmin ? 'Admin' : 'Customer' };
  const idx = users.findIndex(u => u.email === email);
  if (idx >= 0) users[idx] = user; else users.push(user);
  const token = `mock-token-${id}`;
  return res.status(201).json({ user: { id, name: fullName, email, phone: phone || '', role: user.role }, token });
}));

app.post('/api/auth/login', wrapAsync(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    console.warn('Login 400 - body:', JSON.stringify(req.body));
    return res.status(400).json({ message: 'Missing email or password' });
  }
  // Try external API first (server-to-server, no CORS)
  const ext = await forwardAuth('/Auth/login', { email, password });
  if (ext.ok) {
    const extUser = ext.data.user || {};
    const user = { id: extUser.id || Date.now(), name: extUser.name || email.split('@')[0], email, role: extUser.role || 'Customer' };
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) users[idx] = user; else users.push(user);
    return res.json({ user, token: ext.data.token });
  }
  // Only fall back to local mock if external API was unreachable (network error)
  if (ext.message === 'External API unreachable') {
    const existingUser = users.find(u => u.email === email);
    if (!existingUser) {
      return res.status(401).json({ message: 'Account not found. Please register first.' });
    }
    if (existingUser.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = `mock-token-${existingUser.id}`;
    return res.json({ user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role }, token });
  }
  // External API rejected the credentials — forward its error
  return res.status(ext.status || 401).json({ message: ext.message || 'Invalid email or password.' });
}));

// Google OAuth (Sign In With Google) — same dual-flow pattern
app.post('/api/auth/google', wrapAsync(async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  // Verify credential via Google's tokeninfo endpoint
  let payload;
  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) {
      return res.status(401).json({ message: 'Invalid Google credential' });
    }
    payload = await verifyRes.json();
  } catch {
    return res.status(502).json({ message: 'Failed to verify Google credential' });
  }

  if (!payload.email || payload.email_verified !== 'true') {
    return res.status(401).json({ message: 'Email not verified with Google' });
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
    return res.status(401).json({ message: 'Token audience mismatch' });
  }

  // Find existing user or create new one
  const email = payload.email;
  let user = users.find(u => u.email === email);
  if (!user) {
    const id = Date.now();
    user = {
      id,
      name: payload.name || email.split('@')[0],
      email,
      phone: '',
      password: `google_${id}`,
      role: 'Customer',
      picture: payload.picture || '',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }

  const token = `mock-token-${user.id}`;
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, picture: user.picture || '' },
  });
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

// Contact queries endpoints
app.post('/api/contact/queries', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  const query = {
    id: Date.now(),
    name,
    email,
    message,
    reply: null,
    createdAt: new Date().toISOString(),
  };
  contactQueries.unshift(query);
  res.status(201).json({ message: 'Message dispatched successfully! We\'ll reply within 24 hours.', query });
});

app.get('/api/contact/queries', (req, res) => {
  res.json(contactQueries);
});

app.delete('/api/contact/queries/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = contactQueries.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Query not found' });
  }
  contactQueries.splice(index, 1);
  res.json({ message: 'Query removed' });
});

app.post('/api/contact/queries/:id/reply', (req, res) => {
  const id = Number(req.params.id);
  const query = contactQueries.find(q => q.id === id);
  if (!query) {
    return res.status(404).json({ message: 'Query not found' });
  }
  const { reply } = req.body || {};
  if (!reply) {
    return res.status(400).json({ message: 'Reply text is required' });
  }
  query.reply = reply;
  res.json({ query });
});

// Users endpoint (admin customers)
app.get('/api/users', (req, res) => {
  res.json(users);
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

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Project started! Open http://localhost:${PORT} to view it.`);
});
