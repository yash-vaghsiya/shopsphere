import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.orders)) return data.orders;
    if (Array.isArray(data.records)) return data.records;
    if (Array.isArray(data.result)) return data.result;
  }
  return null;
};

const parseShippingAddress = (sa) => {
  if (!sa) return {};
  if (typeof sa === 'string') { try { return JSON.parse(sa); } catch { return {}; } }
  if (typeof sa === 'object') return sa;
  return {};
};

const normalizeOrder = (o) => {
  const sa = parseShippingAddress(o.shippingAddress ?? o.ShippingAddress);
  let items = o.items ?? o.Items ?? o.orderItems ?? o.OrderItems ?? [];
  if (items.length === 0) {
    if (sa._items && Array.isArray(sa._items) && sa._items.length > 0) {
      items = sa._items;
    } else if (o.productName ?? o.ProductName) {
      const rawNames = String(o.productName ?? o.ProductName ?? '');
      const rawQty = o.quantity ?? o.Quantity ?? 0;
      if (rawNames.includes(' | ')) {
        const names = rawNames.split(' | ');
        const qtyPerItem = Math.max(1, Math.floor(Number(rawQty) / names.length));
        items = names.map((name, i) => ({
          productId: 0, name, quantity: i === names.length - 1 ? Number(rawQty) - qtyPerItem * (names.length - 1) : qtyPerItem,
          price: 0, image: '',
        }));
      } else {
        items = [{ productId: 0, name: rawNames, quantity: Number(rawQty) || 0, price: 0, image: '' }];
      }
    }
  }
  return {
    id: o.id ?? o.Id ?? o.orderId ?? o.OrderId ?? Date.now() + Math.random(),
    orderNumber: o.orderNumber ?? o.OrderNumber ?? `#${o.id ?? o.Id ?? o.orderId ?? o.OrderId ?? ''}`,
    customerName: o.customerName ?? o.CustomerName ?? sa.fullName ?? sa.name ?? o.name ?? o.Name ?? o.userName ?? o.UserName ?? '',
    email: o.email ?? o.Email ?? sa.email ?? sa.Email ?? '',
    phone: o.phone ?? o.Phone ?? o.shippingPhone ?? o.ShippingPhone ?? sa.phone ?? sa.Phone ?? sa.mobile ?? sa.Mobile ?? '',
    items,
    total: o.total ?? o.Total ?? o.amount ?? o.Amount ?? o.totalAmount ?? o.TotalAmount ?? 0,
    paymentMethod: o.paymentMethod ?? o.PaymentMethod ?? '',
    shippingAddress: sa,
    userId: o.userId ?? o.UserId ?? '',
    createdAt: o.createdAt ?? o.CreatedAt ?? o.orderDate ?? o.OrderDate ?? o.date ?? o.Date ?? new Date().toISOString(),
    status: o.status ?? o.Status ?? 'Pending',
  };
};

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/Orders`);
      if (response.ok) {
        const data = await response.json();
        const arr = unwrapArray(data);
        if (arr) return arr.map(normalizeOrder);
      }
    } catch {}
    try {
      const response = await axiosInstance.get("/api/orders");
      const arr = Array.isArray(response.data) ? response.data : unwrapArray(response.data) ?? [];
      return arr.map(normalizeOrder);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load orders"
      );
    }
  }
);

const decodeJwt = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch { return {}; }
};

const getDotNetUser = async () => {
  const raw = localStorage.getItem('user');
  let email = 'guest@shopsphere.com';
  let name = 'Guest';
  if (raw) {
    try {
      const u = JSON.parse(raw);
      if (u && typeof u === 'object') {
        email = u.email || u.Email || email;
        name = u.name || u.Name || email.split('@')[0];
      }
    } catch {}
  }
  const existingToken = localStorage.getItem('token');
  if (existingToken && !existingToken.startsWith('mock-')) {
    const jwt = decodeJwt(existingToken);
    const uid = String(jwt.UserId || jwt.userId || '');
    if (uid) return { userId: uid, token: existingToken, email };
  }
  try {
    const password = `auto_${Date.now()}`;
    const regRes = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dto: {}, firstName: name, lastName: '', phone: '', email, password }),
    });
    if (regRes.ok) {
      const loginRes = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dto: {}, email, password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (token) {
          localStorage.setItem('token', token);
          const jwt = decodeJwt(token);
          const userId = String(jwt.UserId || jwt.userId || email);
          return { userId, token, email };
        }
      }
    } else {
      // User likely exists — try login with a direct POST (use existing token if any)
      const loginRes = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dto: {}, email, password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (token) {
          localStorage.setItem('token', token);
          const jwt = decodeJwt(token);
          const userId = String(jwt.UserId || jwt.userId || email);
          return { userId, token, email };
        }
      }
    }
  } catch {}
  return { userId: email, token: '', email };
};

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, thunkAPI) => {
    let dotNetUserId = '';
    let dotNetToken = '';
    try {
      const u = await getDotNetUser();
      dotNetUserId = u.userId;
      dotNetToken = u.token;
    } catch {}
    const sa = orderData.shippingAddress || {};
    const orderItems = (orderData.items || []).map(it => ({
      productId: it.productId || it.id || 0,
      name: it.name || '',
      price: it.price || 0,
      quantity: it.quantity || 1,
      image: it.image || '',
    }));
    const dotNetPayload = {
      UserId: String(dotNetUserId || ''),
      OrderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      Total: Number(orderData.total) || 0,
      Status: orderData.status || 'Pending',
      PaymentMethod: orderData.paymentMethod || '',
      ShippingAddress: JSON.stringify({ ...sa, _items: orderItems }),
      CreatedAt: new Date().toISOString(),
      CustomerName: sa.fullName || orderData.customerName || '',
      ProductName: orderItems.map(it => it.name).join(' | ') || '',
      Quantity: orderItems.reduce((sum, it) => sum + it.quantity, 0) || 0,
    };
    try {
      const payloadStr = JSON.stringify(dotNetPayload);
      console.log('[orderSlice] .NET payload:', payloadStr);
      const response = await fetch(`${API_URL}/Orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(dotNetToken ? { Authorization: `Bearer ${dotNetToken}` } : {}) },
        body: payloadStr,
      });
      if (response.ok) {
        const text = await response.text();
        const obj = text ? JSON.parse(text) : {};
        const normalized = normalizeOrder(obj?.data ?? obj?.value ?? obj);
        try {
          if (obj?.id && obj.ownerToken) {
            const existing = JSON.parse(localStorage.getItem('orderTokens') || '{}');
            existing[String(obj.id)] = obj.ownerToken;
            localStorage.setItem('orderTokens', JSON.stringify(existing));
          }
        } catch (e) {}
        return normalized;
      }
      const errText = await response.text().catch(() => '(empty body)');
      console.error('[orderSlice] .NET API returned', response.status, 'Body:', errText);
    } catch (e) {
      console.warn('[orderSlice] .NET API fetch failed, falling back to Express:', e);
    }
    try {
      const response = await axiosInstance.post("/api/orders", orderData);
      try {
        const data = response.data;
        if (data && data.id && data.ownerToken) {
          const existing = JSON.parse(localStorage.getItem('orderTokens') || '{}');
          existing[String(data.id)] = data.ownerToken;
          localStorage.setItem('orderTokens', JSON.stringify(existing));
        }
      } catch (e) {}
      return normalizeOrder(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to purchase order"
      );
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(`/api/orders/${id}`, { status });
      return response.data; // Expected: Order
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      });
  },
});

export const { clearCurrentOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
