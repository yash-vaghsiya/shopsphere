import { createSlice } from "@reduxjs/toolkit";


export const SUPPORTED_CURRENCIES = {
  INR: { code: "INR", symbol: "₹", rate: 1.0, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", rate: 0.012, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0095, locale: "en-GB" },
  JPY: { code: "JPY", symbol: "¥", rate: 1.88, locale: "ja-JP" },
};

// Global in-memory variable for ultra-fast, synchronous access in vanilla utility functions
let activeGlobalCurrency = SUPPORTED_CURRENCIES.INR;

export const getActiveGlobalCurrency = () => {
  return activeGlobalCurrency;
};

// Seed initial value from localStorage if present
const getInitialCurrency = () => {
  try {
    const saved = localStorage.getItem("selected_currency");
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      activeGlobalCurrency = SUPPORTED_CURRENCIES[saved];
      return saved;
    }
  } catch {}
  return "INR";
};

const initialState = {
  current: getInitialCurrency(),
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      const code = action.payload;
      if (SUPPORTED_CURRENCIES[code]) {
        state.current = code;
        activeGlobalCurrency = SUPPORTED_CURRENCIES[code];
        try {
          localStorage.setItem("selected_currency", code);
        } catch {}
      }
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
