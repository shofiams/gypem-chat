import axiosInstance from "./axiosInstance";

export const starredMessagesService = {
  // Get all starred messages across all rooms
  fetchAllStarredMessages: async () => {
    try {
      const res = await axiosInstance.get("/messages/starred");
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch starred messages",
        data: [],
      };
    }
  },

  // Get starred messages for a specific room
  fetchRoomStarredMessages: async (roomId, roomMemberId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/${roomMemberId}/messages/starred`);
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch room starred messages",
        data: [],
      };
    }
  },

  // Search in starred messages
  searchStarredMessages: async (keyword) => {
    try {
      const res = await axiosInstance.get(`/messages/starred/search?q=${encodeURIComponent(keyword)}`);
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search starred messages",
        data: [],
      };
    }
  },
};