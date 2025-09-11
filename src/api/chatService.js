import axiosInstance from "./axiosInstance";

export const chatService = {
  // Buat room private
  createPrivateRoom: async (targetAdminId) => {
  try {
    console.log("Create private room call =>", targetAdminId);
    const res = await axiosInstance.post("/rooms/privates", {
      target_admin_id: targetAdminId,
    });
    console.log("Response create room:", res.data);
    return {
      success: true,
      data: res.data.data,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Error create room:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create private room",
      data: null,
    };
  }
},

  // Ambil semua chat (kalau API ada endpointnya)
  fetchAllChats: async () => {
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
        message: error.response?.data?.message || "Failed to fetch chats",
        data: [],
      };
    }
  },
};
