import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";


// Get initial values safely
const getInitialUser = () => {
  try {
    const saved = localStorage.getItem("user");
    const user = saved ? JSON.parse(saved) : null;
    if (user && !user.role) {
      user.role = "Customer";
    }
    return user;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();
const initialToken = getInitialToken();

const initialState = {
  user: initialUser,
  token: initialToken,
  loading: false,
  error: null,
  isAuthenticated: !!initialToken,
};

// Async Thunks
export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", credentials);
      const data = response.data;
      if (data.user && !data.user.role) {
        data.user.role = "Customer";
      }
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", userData);
      const data = response.data;
      if (data.user && !data.user.role) {
        data.user.role = "Customer";
      }
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Account creation failed"
      );
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const response = await axiosInstance.patch("/api/auth/me", profileData);
      const data = response.data;
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        console.warn("Unauthorized storage clear block", e);
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Action
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register Action
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Update Profile Action
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
