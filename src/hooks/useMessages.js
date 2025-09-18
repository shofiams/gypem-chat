import { useState, useEffect, useCallback } from "react";
import { messageService } from "../api/messageService";

// Hook untuk mendapatkan semua pesan berbintang
export const useStarredMessages = (opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchStarredMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.fetchAllStarredMessages();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch starred messages");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchStarredMessages();
    }
  }, [autoFetch, fetchStarredMessages]);

  return {
    data,
    loading,
    error,
    refetch: fetchStarredMessages,
  };
};

// Hook untuk mendapatkan pesan berbintang berdasarkan room
export const useStarredMessagesByRoom = (roomId, roomMemberId, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchStarredMessagesByRoom = useCallback(async () => {
    if (!roomId || !roomMemberId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await messageService.fetchStarredMessagesByRoom(roomId, roomMemberId);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch starred messages by room");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, roomMemberId]);

  useEffect(() => {
    if (autoFetch && roomId && roomMemberId) {
      fetchStarredMessagesByRoom();
    }
  }, [autoFetch, roomId, roomMemberId, fetchStarredMessagesByRoom]);

  return {
    data,
    loading,
    error,
    refetch: fetchStarredMessagesByRoom,
  };
};

// Hook untuk pencarian pesan berbintang
export const useStarredMessageSearch = (opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const searchStarredMessages = useCallback(async (keyword) => {
    if (!keyword?.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await messageService.searchStarredMessages(keyword);

      if (result.success) {
        setSearchResults(result.data);
        setData(result.data);
      } else {
        setError(result.message);
        setSearchResults([]);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to search starred messages");
      setSearchResults([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    searchResults,
    loading,
    error,
    searchStarredMessages,
    clearSearch,
  };
};

// Hook untuk mendapatkan pesan berdasarkan room
export const useMessagesByRoom = (roomId, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchMessagesByRoom = useCallback(async () => {
    if (!roomId) {
      console.warn('useMessagesByRoom: No roomId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching messages for room:', roomId);
      const result = await messageService.fetchMessagesByRoom(roomId);

      if (result.success) {
        console.log('Messages fetched successfully:', result.data.length, 'messages');
        setData(result.data);
      } else {
        console.error('Failed to fetch messages:', result.message);
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || "Failed to fetch messages by room");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (autoFetch && roomId) {
      fetchMessagesByRoom();
    }
  }, [autoFetch, roomId, fetchMessagesByRoom]);

  return {
    data,
    loading,
    error,
    refetch: fetchMessagesByRoom,
  };
};

// Hook untuk mendapatkan pesan berdasarkan room dan tipe
export const useMessagesByRoomAndType = (roomId, messageType, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchMessagesByRoomAndType = useCallback(async () => {
    if (!roomId || !messageType) return;

    setLoading(true);
    setError(null);

    try {
      const result = await messageService.fetchMessagesByRoomAndType(roomId, messageType);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch messages by type");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, messageType]);

  useEffect(() => {
    if (autoFetch && roomId && messageType) {
      fetchMessagesByRoomAndType();
    }
  }, [autoFetch, roomId, messageType, fetchMessagesByRoomAndType]);

  return {
    data,
    loading,
    error,
    refetch: fetchMessagesByRoomAndType,
  };
};

// Hook useRoomMedia yang menggunakan API endpoints
export const useRoomMedia = (roomId) => {
  const [mediaList, setMediaList] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Menggunakan API endpoints yang spesifik untuk setiap tipe
  const { 
    data: imageMessages, 
    loading: imageLoading, 
    error: imageError, 
    refetch: refetchImages 
  } = useMessagesByRoomAndType(roomId, 'image', { autoFetch: true });

  const { 
    data: documentMessages, 
    loading: documentLoading, 
    error: documentError, 
    refetch: refetchDocuments 
  } = useMessagesByRoomAndType(roomId, 'dokumen', { autoFetch: true });

  const { 
    data: linkMessages, 
    loading: linkLoading, 
    error: linkError, 
    refetch: refetchLinks 
  } = useMessagesByRoomAndType(roomId, 'tautan', { autoFetch: true });

  const processApiData = useCallback(() => {
    const API_BASE_URL = import.meta.env.VITE_API_UPLOAD_PHOTO;

    const processedImages = [];
    if (imageMessages && Array.isArray(imageMessages)) {
      imageMessages.forEach(group => {
        if (Array.isArray(group)) {
          group.forEach(message => {
            if (message?.attachment) {
              processedImages.push({
                type: 'image',
                url: message.attachment.url || `${API_BASE_URL}/uploads/${message.attachment.file_path}`,
                messageId: message.message_id,
                sender: message.sender_name,
                fileName: message.content || message.attachment.file_path
              });
            }
          });
        }
      });
    }

    const processedFiles = [];
    if (documentMessages && Array.isArray(documentMessages)) {
      documentMessages.forEach(group => {
        if (Array.isArray(group)) {
          group.forEach(message => {
            if (message?.attachment) {
              const fileType = getFileType(message.attachment.file_path);
              
              processedFiles.push({
                name: message.content || message.attachment.file_path,
                type: fileType,
                url: message.attachment.url || `${API_BASE_URL}/uploads/${message.attachment.file_path}`,
                messageId: message.message_id,
                sender: message.sender_name,
                originalPath: message.attachment.file_path
              });
            }
          });
        }
      });
    }

    const processedLinks = [];
    if (linkMessages && Array.isArray(linkMessages)) {
      linkMessages.forEach(group => {
        if (Array.isArray(group)) {
          group.forEach(message => {
            if (message?.attachment?.url) {
              let linkUrl = message.attachment.url;
              
              if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
                linkUrl = `https://${linkUrl}`;
              }
              
              try {
                new URL(linkUrl);
                processedLinks.push({
                  url: linkUrl,
                  messageId: message.message_id,
                  sender: message.sender_name
                });
              } catch (error) {
                console.warn('❌ Invalid URL found:', linkUrl);
              }
            } else {
              console.warn('❌ Message tanpa attachment.url:', message);
            }
          });
        }
      });
    }

    setMediaList(processedImages);
    setFiles(processedFiles);
    setLinks(removeDuplicateLinks(processedLinks));
    
    console.log('Final processed data:', {
      images: processedImages.length,
      files: processedFiles.length, 
      links: processedLinks.length
    });
    
  }, [imageMessages, documentMessages, linkMessages]);

  // Helper function untuk menghapus duplikat links
  const removeDuplicateLinks = (linkObjects) => {
    if (!Array.isArray(linkObjects)) return [];
    const seenUrls = new Set();
    return linkObjects.filter(linkObj => {
      if (seenUrls.has(linkObj.url)) {
        return false;
      } else {
        seenUrls.add(linkObj.url);
        return true;
      }
    });
  };

  // Helper function untuk mendeteksi tipe file
  const getFileType = (filePath) => {
    if (!filePath) return 'Unknown';
    const extension = filePath.split('.').pop()?.toLowerCase();
    const fileTypes = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'webp': 'Image',
      'svg': 'Image',
    };
    return fileTypes[extension] || extension?.toUpperCase() || 'Unknown';
  };

  // Process data ketika ada perubahan
  useEffect(() => {
    processApiData();
  }, [processApiData]);

  // Set loading state
  useEffect(() => {
    setLoading(imageLoading || documentLoading || linkLoading);
  }, [imageLoading, documentLoading, linkLoading]);

  // Set error state
  useEffect(() => {
    const errors = [imageError, documentError, linkError].filter(Boolean);
    if (errors.length > 0) {
      setError(errors[0]);
    } else {
      setError(null);
    }
  }, [imageError, documentError, linkError]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    console.log('useRoomMedia: Manual refetch triggered');
    try {
      await Promise.all([
        refetchImages(),
        refetchDocuments(), 
        refetchLinks()
      ]);
    } catch (err) {
      console.error('Error during manual refetch:', err);
    }
  }, [refetchImages, refetchDocuments, refetchLinks]);

  return {
    mediaList: mediaList || [],
    files: files || [],
    links: links || [],
    loading,
    error,
    refetch,
  };
};

// Hook untuk mendapatkan pesan yang di-pin berdasarkan room
export const usePinnedMessagesByRoom = (roomId, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchPinnedMessagesByRoom = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await messageService.fetchPinnedMessagesByRoom(roomId);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pinned messages");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (autoFetch && roomId) {
      fetchPinnedMessagesByRoom();
    }
  }, [autoFetch, roomId, fetchPinnedMessagesByRoom]);

  return {
    data,
    loading,
    error,
    refetch: fetchPinnedMessagesByRoom,
  };
};

// Hook untuk operasi message (send, star, unstar)
export const useMessageOperations = (opts = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (roomId, messageData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.sendMessage(roomId, messageData);

      if (result.success) {
        return { success: true, message: result.message, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to send message";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const starMessages = useCallback(async (messageIds, messageStatusIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.starMessages(messageIds, messageStatusIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to star messages";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const unstarMessages = useCallback(async (messageStatusIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.unstarMessages(messageStatusIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to unstar messages";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (messageIds, messageStatusIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.markMessagesAsRead(messageIds, messageStatusIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to mark messages as read";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessagesForMe = useCallback(async (messageStatusIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.deleteMessagesForMe(messageStatusIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete messages for me";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessagesGlobally = useCallback(async (messageIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.deleteMessagesGlobally(messageIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete messages globally";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const pinMessage = useCallback(async (messageStatusId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.pinMessage(messageStatusId);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to pin message";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const unpinMessage = useCallback(async (messageId, messageStatusId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.unpinMessage(messageId, messageStatusId);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to unpin message";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    starMessages,
    unstarMessages,
    markMessagesAsRead,
    deleteMessagesForMe,
    deleteMessagesGlobally,
    pinMessage,
    unpinMessage,
    loading,
    error,
    clearError,
  };
};