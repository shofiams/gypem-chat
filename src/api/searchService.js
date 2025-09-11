import axiosInstance from "./axiosInstance";

export const searchService = {
  // Global search - mencari di rooms dan messages
  globalSearch: async (keyword) => {
    try {
      const res = await axiosInstance.get(`/search?q=${encodeURIComponent(keyword)}`);
      return {
        success: true,
        data: res.data.data || { rooms: [], messages: [] },
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to perform global search",
        data: { rooms: [], messages: [] },
      };
    }
  },

  // Room-scoped search - mencari messages dalam room tertentu
  searchInRoom: async (roomId, keyword) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/search?q=${encodeURIComponent(keyword)}`);
      return {
        success: true,
        data: res.data.data || { messages: [] },
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search in room",
        data: { messages: [] },
      };
    }
  },
};