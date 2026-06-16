import { createSlice } from "@reduxjs/toolkit";

const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
};

const initialState = {
  mode: getStoredTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", state.mode);
        // Sync with html element
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(state.mode);
      } catch {}
    },
    setThemeMode: (state, action) => {
      state.mode = action.payload === "dark" ? "dark" : "light";
      try {
        localStorage.setItem("theme", state.mode);
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(state.mode);
      } catch {}
    }
  },
});

export const { toggleTheme, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
