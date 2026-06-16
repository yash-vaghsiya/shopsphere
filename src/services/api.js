import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "", // Set empty to query local Origin directly (Vite dev proxy or CJS absolute binding)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Safe Request Interceptor to inject authentication headers
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (userJson && config.headers) {
        const user = JSON.parse(userJson);
        if (user?.email) {
          config.headers["X-User-Email"] = user.email;
        }
        if (user?.role) {
          config.headers["X-User-Role"] = user.role;
        } else {
          config.headers["X-User-Role"] = "Customer";
        }
        if (user?.id) {
          config.headers["X-User-Id"] = String(user.id);
        }
      }

        // Attach per-order owner token when requesting a specific order
        try {
          if (config && typeof config.url === 'string') {
            const orderMatch = config.url.match(/\/api\/orders\/(\d+)/);
            if (orderMatch) {
              const orderId = orderMatch[1];
              const tokensJson = localStorage.getItem('orderTokens');
              if (tokensJson) {
                const tokens = JSON.parse(tokensJson || '{}');
                const token = tokens[String(orderId)];
                if (token && config.headers) {
                  config.headers['X-Order-Token'] = token;
                }
              }
            }
          }
        } catch (e) {
          // ignore token attach failures
        }
    } catch (e) {
      console.warn("Storage item fetch failed", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to clear storage and redirect on 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        console.warn("Unauthorized storage clear block", e);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
