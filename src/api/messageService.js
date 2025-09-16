import axiosInstance from "./axiosInstance";

export const messageService = {
  // Get messages for a specific room
  fetchRoomMessages: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/messages`);
      return {
        success: true,
        data: res.data.data || [],
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch messages",
        data: [],
      };
    }
  },

  // Process messages to extract media, files, and links
  processMessagesForMedia: (messages) => {
    const mediaList = [];
    const files = [];
    const links = [];
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

    messages.forEach(message => {
      // Process attachments
      if (message.attachment) {
        const { file_type, file_path } = message.attachment;
        const fullUrl = `${baseUrl}/uploads${file_path}`;
        
        if (file_type === 'gambar' || file_type === 'image') {
          mediaList.push({
            type: 'image',
            url: fullUrl,
            messageId: message.message_id,
            sender: message.sender_name
          });
        } else if (file_type === 'video') {
          mediaList.push({
            type: 'video',
            url: fullUrl,
            messageId: message.message_id,
            sender: message.sender_name
          });
        } else if (file_type === 'dokumen' || file_type === 'document') {
          files.push({
            name: message.content || 'Document',
            type: getFileType(file_path),
            url: fullUrl,
            messageId: message.message_id,
            sender: message.sender_name
          });
        }
      }

      // Process links from message content
      if (message.content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const messageLinks = message.content.match(urlRegex) || [];
        messageLinks.forEach(link => {
          links.push({
            url: link,
            messageId: message.message_id,
            sender: message.sender_name
          });
        });
      }
    });

    return { 
      mediaList, 
      files, 
      links: removeDuplicateLinks(links) 
    };
  }
};

// Helper function to determine file type
const getFileType = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
  if (['mp4', 'avi', 'mov'].includes(extension)) return 'video';
  return 'pdf'; // default
};

// Helper function to remove duplicate links
const removeDuplicateLinks = (links) => {
  const uniqueUrls = new Set();
  return links.filter(link => {
    if (uniqueUrls.has(link.url)) {
      return false;
    }
    uniqueUrls.add(link.url);
    return true;
  });
};