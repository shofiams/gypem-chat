import axiosInstance from "./axiosInstance";

export const adminService = {
  // Get all admins
  fetchAll: async () => {
    try {
      const res = await axiosInstance.get("/auth/admin/all");
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch admins",
        data: [],
      };
    }
  },

  // Get admin details by ID
  fetchById: async (adminId) => {
    try {
      const res = await axiosInstance.get(`/auth/admin/${adminId}`);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch admin details",
        data: null,
      };
    }
  },

  // Create admin - placeholder (sesuaikan dengan API endpoint yang tersedia)
  create: async (adminData) => {
    try {
      const res = await axiosInstance.post("/auth/admin", adminData);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create admin",
        data: null,
      };
    }
  },

  // Update admin - placeholder (sesuaikan dengan API endpoint yang tersedia)
  update: async (adminId, adminData) => {
    try {
      const res = await axiosInstance.put(`/auth/admin/${adminId}`, adminData);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update admin",
        data: null,
      };
    }
  },

  // Delete admin - placeholder (sesuaikan dengan API endpoint yang tersedia)
  delete: async (adminId) => {
    try {
      const res = await axiosInstance.delete(`/auth/admin/${adminId}`);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete admin",
        data: null,
      };
    }
  },
};