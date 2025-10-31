import axiosInstance from "./axiosInstance";

export const roomService = {
  // Get all room
  fetchRooms: async () => {
    try {
      console.log("📡 Fetching rooms...");
      const res = await axiosInstance.get("/rooms");
      console.log("✅ Rooms fetched successfully:", res.data);
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      console.error("❌ Failed to fetch rooms:", error.response?.data || error.message);
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
      console.log("📡 Fetching room details for ID:", roomId);
      const res = await axiosInstance.get(`/rooms/${roomId}`);
      console.log("✅ Room details fetched successfully:", res.data);
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      console.error("❌ Failed to fetch room details:", error.response?.data || error.message);
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
      console.log("📡 Creating private room for admin ID:", targetAdminId);
      
      const payload = {
        target_admin_id: targetAdminId,
      };
      
      console.log("📤 Sending payload:", payload);
      
      const res = await axiosInstance.post("/rooms/privates", payload);
      
      console.log("✅ Private room created successfully!");
      console.log("📥 Response:", res.data);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      console.error("❌ Failed to create private room:");
      console.error("Error response:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      
      return {
        success: false,
        message:
          error.response?.data?.message || 
          error.response?.data?.error ||
          "Failed to create private room",
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
      console.log("📡 Deleting rooms with member IDs:", roomMemberIds);
      
      const payload = {
        room_member_id: Array.isArray(roomMemberIds)
          ? roomMemberIds
          : [roomMemberIds],
      };
      
      console.log("📤 Sending delete payload:", payload);
      
      const res = await axiosInstance.post("/rooms/delete", payload);
      
      console.log("✅ Rooms deleted successfully:", res.data);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      console.error("❌ Failed to delete rooms:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete rooms",
        data: null,
      };
    }
  },
};

// helper for time formatting
export const formatTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);

  // Batas waktu dalam detik (3 jam * 60 menit * 60 detik)
  const threeHoursInSeconds = 3 * 60 * 60;

  if (seconds < 60) {
    return "just now";
  }

  if (seconds < threeHoursInSeconds) {
    if (minutes < 60) {
      return `${minutes} minute ago`;
    } else {
      return `${hours} hour ago`;
    }
  }

  // Mengatur waktu 'now' ke awal hari untuk perbandingan yang akurat
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  // Jika tanggalnya hari ini
  if (date >= startOfToday) {
    return date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", ".");
  }

  // Jika tanggalnya kemarin
  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  // Jika lebih lama dari seminggu
  return date.toLocaleDateString('en-ID', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};