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
    subtotal: o.subtotal ?? o.Subtotal ?? o.subTotal ?? o.SubTotal ?? 0,
    shipping: o.shipping ?? o.Shipping ?? o.shippingCost ?? o.ShippingCost ?? o.postage ?? o.Postage ?? 0,
    tax: o.tax ?? o.Tax ?? o.gst ?? o.GST ?? o.taxAmount ?? o.TaxAmount ?? 0,
    discount: o.discount ?? o.Discount ?? 0,
    discountPercent: o.discountPercent ?? o.DiscountPercent ?? 0,
    couponCode: o.couponCode ?? o.CouponCode ?? o.coupon ?? o.Coupon ?? '',
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
    const allOrders = [];
    const seenIds = new Set();
    try {
      const response = await fetch(`${API_URL}/Orders`);
      if (response.ok) {
        const data = await response.json();
        const arr = unwrapArray(data);
        if (arr) {
          arr.map(normalizeOrder).forEach(o => {
            if (!seenIds.has(o.id)) { seenIds.add(o.id); allOrders.push(o); }
          });
        }
      }
    } catch {}
    try {
      const response = await axiosInstance.get("/api/orders");
      const arr = Array.isArray(response.data) ? response.data : unwrapArray(response.data) ?? [];
      arr.map(normalizeOrder).forEach(o => {
        if (!seenIds.has(o.id)) { seenIds.add(o.id); allOrders.push(o); }
      });
    } catch (error) {
      if (allOrders.length === 0) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Failed to load orders"
        );
      }
    }
    return allOrders;
  }
);

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/orders/proxy", orderData);
      const data = response.data;
      return normalizeOrder(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to submit order"
      );
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axiosInstance.put(`/api/orders/${id}/status`, { status, email: user.email || '' });
      if (response.status === 200) return { id, status };
    } catch {}
    try {
      const response = await axiosInstance.patch(`/api/orders/${id}`, { status });
      const order = normalizeOrder(response.data);
      return { id: order.id, status: order.status };
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
        const order = state.orders.find((o) => String(o.id) === String(action.payload.id));
        if (order) order.status = action.payload.status;
        if (state.currentOrder && String(state.currentOrder.id) === String(action.payload.id)) {
          state.currentOrder.status = action.payload.status;
        }
      });
  },
});

export const { clearCurrentOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
