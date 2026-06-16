import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/api/orders");
      return response.data; // Expected: Order[]
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load orders"
      );
    }
  }
);

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/orders", orderData);
      // If backend returned an owner token for guest orders, persist it locally mapped to the order id
      try {
        const data = response.data;
        if (data && data.id && data.ownerToken) {
          const existing = JSON.parse(localStorage.getItem('orderTokens') || '{}');
          existing[String(data.id)] = data.ownerToken;
          localStorage.setItem('orderTokens', JSON.stringify(existing));
        }
      } catch (e) {
        // ignore storage errors
      }
      return response.data; // Expected: Order
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
