import axiosInstance from "./axiosInstance";

export const messageService = {
  // Send message
  sendMessage: async (roomId, messageData) => {
    try {
      const formData = new FormData();
      formData.append("content", messageData.content);
      
      if (messageData.file) {
        formData.append("file", messageData.file);
      }
      
      if (messageData.reply_to_message_id) {
        formData.append("reply_to_message_id", messageData.reply_to_message_id);
      }

      const res = await axiosInstance.post(`/rooms/${roomId}/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil dikirim",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Pesan gagal dikirim",
        data: null,
      };
    }
  },

  // Star messages
  starMessages: async (messageStatusIds) => {
    try {
      const res = await axiosInstance.patch("/messages/star", {
        message_status_id: Array.isArray(messageStatusIds) ? messageStatusIds : [messageStatusIds],
      });
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil ditandai bintang",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to star messages",
        data: null,
      };
    }
  },

  // Unstar messages
  unstarMessages: async (messageStatusIds) => {
    try {
      const res = await axiosInstance.patch("/messages/unstar", {
        message_status_id: Array.isArray(messageStatusIds) ? messageStatusIds : [messageStatusIds],
      });
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Bintang pada pesan berhasil dibatalkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unstar messages",
        data: null,
      };
    }
  },

  // Get all starred messages
  fetchAllStarredMessages: async () => {
    try {
      const res = await axiosInstance.get("/messages/starred");
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || "Data berhasil didapatkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch starred messages",
        data: [],
      };
    }
  },

  // Get starred messages by room
  fetchStarredMessagesByRoom: async (roomId, roomMemberId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/${roomMemberId}/messages/starred`);
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || "Data berhasil didapatkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch starred messages by room",
        data: [],
      };
    }
  },

  // Search starred messages
  searchStarredMessages: async (keyword) => {
    try {
      const res = await axiosInstance.get(`/messages/starred/search?q=${encodeURIComponent(keyword)}`);
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || "Data berhasil didapatkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to search starred messages",
        data: [],
      };
    }
  },

  // Get messages by room
  fetchMessagesByRoom: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/messages`);
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || "Data pesan berhasil didapatkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch messages by room",
        data: [],
      };
    }
  },

  // Get messages by room and type
  fetchMessagesByRoomAndType: async (roomId, messageType) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/messages/${messageType}`);
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || `Data pesan dengan tipe '${messageType}' berhasil didapatkan`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch messages by type",
        data: [],
      };
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (messageIds, messageStatusIds) => {
    try {
      const res = await axiosInstance.post("/messages/read", {
        message_id: Array.isArray(messageIds) ? messageIds : [messageIds],
        message_status_id: Array.isArray(messageStatusIds) ? messageStatusIds : [messageStatusIds],
      });
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil dibaca",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark messages as read",
        data: null,
      };
    }
  },

  updateMessage: async (messageId, content) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageId}`, {
        content: content,
      });
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil diperbarui",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Gagal memperbarui pesan",
        data: null,
      };
    }
  },

  // Delete messages for me
  deleteMessagesForMe: async (messageStatusIds) => {
    try {
      const payload = {
        message_status_id: Array.isArray(messageStatusIds) ? messageStatusIds : [messageStatusIds],
      };

      const res = await axiosInstance.post("/messages/deleted-for-me", payload);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil dihapus dari tampilan saya",
      };
    } catch (error) {
      console.error('Delete for me error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete messages for me",
        data: null,
      };
    }
  },

  // Delete messages globally
  deleteMessagesGlobally: async (messageIds) => {
    try {
      const res = await axiosInstance.post("/messages/deleted-globally", {
        message_id: Array.isArray(messageIds) ? messageIds : [messageIds],
      });
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan telah dihapus untuk semua orang",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete messages globally",
        data: null,
      };
    }
  },

  // Pin message
  pinMessage: async (messageStatusId) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageStatusId}/pin`);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Pesan berhasil disematkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to pin message",
        data: null,
      };
    }
  },

  // Unpin message
  unpinMessage: async (messageId, messageStatusId) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageStatusId}/unpin`);
      
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Sematan pada pesan berhasil dibatalkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unpin message",
        data: null,
      };
    }
  },
  
  // Get pinned messages by room
  fetchPinnedMessagesByRoom: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/pinned-messages`);
      
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message || "Data berhasil didapatkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch pinned messages",
        data: [],
      };
    }
  },
};

// Helper function untuk format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
};

// Helper function untuk format tanggal message
export const formatMessageTime = (created_at) => {
  const date = new Date(created_at);
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }).replace(':', '.');
};