import axiosInstance from "./axiosInstance";

export const authService = {
  loginPeserta: async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/peserta/login", {
        email,
        password,
      });
      
      if (res.data?.data?.token) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        data: null
      };
    }
  },

  logoutPeserta: async () => {
    try {
      const res = await axiosInstance.post("/auth/peserta/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      return {
        success: true,
        message: res.data.message,
        data: null
      };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      return {
        success: false,
        message: error.response?.data?.message || "Logout failed",
        data: null
      };
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  }
};