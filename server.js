import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

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

const broadcasts = [
  {
    id: 1,
    title: "Weekend Flash Sale",
    message: "ShopSphere is offering up to 25% off select luxury goods this weekend only!",
    type: "offer",
    createdAt: new Date().toISOString(),
  },
];

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
  res.status(201).json(newBroadcast);
});

app.delete('/api/broadcasts/:id', (req, res) => {
  const broadcastId = Number(req.params.id);
  const index = broadcasts.findIndex((item) => item.id === broadcastId);
  if (index === -1) {
    return res.status(404).json({ message: 'Broadcast not found' });
  }
  broadcasts.splice(index, 1);
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

// Mock auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const id = Date.now();
  const isAdmin = String(email).toLowerCase().includes("admin");
  const user = { id, name, email, role: isAdmin ? 'Admin' : 'Customer' };
  const token = `mock-token-${id}`;
  return res.status(201).json({ user, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  const id = Date.now();
  const isAdmin = String(email).toLowerCase().includes("admin");
  const user = { id, name: 'Demo User', email, role: isAdmin ? 'Admin' : 'Customer' };
  const token = `mock-token-${id}`;
  return res.json({ user, token });
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
