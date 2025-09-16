import axiosInstance from "./axiosInstance";

export const roomService = {
  // Get all room
  fetchRooms: async () => {
    try {
      const res = await axiosInstance.get("/rooms");
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch rooms",
        data: [],
      };
    }
  },

  // Get detail room
  fetchRoomDetails: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}`);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch room details",
        data: null,
      };
    }
  },

  // buat one-to-one room
  createPrivateRoom: async (targetAdminId) => {
    try {
      const res = await axiosInstance.post("/rooms/privates", {
        target_admin_id: targetAdminId,
      });
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to create private room",
        data: null,
      };
    }
  },

  leaveRoom: async (roomMemberId) => {
    try {
      const res = await axiosInstance.delete(`/rooms/${roomMemberId}/leave`);
      return {
        success: true,
        data: null,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to leave room",
        data: null,
      };
    }
  },

  // delete room
  deleteRooms: async (roomMemberIds) => {
    try {
      const res = await axiosInstance.post("/rooms/delete", {
        room_member_id: Array.isArray(roomMemberIds)
          ? roomMemberIds
          : [roomMemberIds],
      });
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete rooms",
        data: null,
      };
    }
  },
};

// Simple helper for time formatting
export const formatTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", ".");
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};
