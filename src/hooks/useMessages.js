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

  return { data, loading, error, refetch: fetchStarredMessages };
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

  return { data, loading, error, refetch: fetchStarredMessagesByRoom };
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

  return { data, searchResults, loading, error, searchStarredMessages, clearSearch };
};

// Hook untuk mendapatkan pesan berdasarkan room
export const useMessagesByRoom = (roomId, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = opts;

  const fetchMessagesByRoom = useCallback(async () => {
    if (!roomId) {
      console.warn("useMessagesByRoom: No roomId provided");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await messageService.fetchMessagesByRoom(roomId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
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

  return { data, loading, error, refetch: fetchMessagesByRoom };
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

  return { data, loading, error, refetch: fetchMessagesByRoomAndType };
};

// Hook useRoomMedia 
export const useRoomMedia = (roomId) => {
  const [mediaList, setMediaList] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);

  const { data: imageMessages, loading: imageLoading, error: imageError, refetch: refetchImages } =
    useMessagesByRoomAndType(roomId, "image", { autoFetch: true });
  const { data: documentMessages, loading: documentLoading, error: documentError, refetch: refetchDocuments } =
    useMessagesByRoomAndType(roomId, "dokumen", { autoFetch: true });
  const { data: linkMessages, loading: linkLoading, error: linkError, refetch: refetchLinks } =
    useMessagesByRoomAndType(roomId, "tautan", { autoFetch: true });

  const loading = imageLoading || documentLoading || linkLoading;
  const error = [imageError, documentError, linkError].filter(Boolean)[0] || null;

  const getFullUrl = (pathOrUrl) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;
    if (!pathOrUrl || pathOrUrl.startsWith("http")) return pathOrUrl;
    return `${API_BASE_URL}/uploads/${pathOrUrl}`;
  };

  const processApiData = useCallback(() => {
    // Gambar
    const processedImages = (imageMessages || []).flat().map((message) => ({
      type: "image",
      url: getFullUrl(message.attachment?.url || message.attachment?.file_path),
      messageId: message.message_id,
      sender: message.sender_name,
      fileName: message.content || message.attachment?.file_path,
    })).filter((item) => item.url);
    setMediaList(processedImages);

    // File
    const getFileType = (filePath) => {
      if (!filePath) return "Unknown";
      const extension = filePath.split(".").pop()?.toLowerCase();
      const fileTypes = { pdf: "PDF", doc: "Word", docx: "Word" };
      return fileTypes[extension] || extension?.toUpperCase() || "Unknown";
    };
    const processedFiles = (documentMessages || []).flat().map((message) => ({
      name: message.attachment?.original_filename || message.content || "File",
      type: getFileType(message.attachment?.original_filename),
      url: getFullUrl(message.attachment?.url || message.attachment?.file_path),
      messageId: message.message_id,
      sender: message.sender_name,
      originalPath: message.attachment?.file_path,
    })).filter((item) => item.url);
    setFiles(processedFiles);

    // Link
    const seenUrls = new Set();
    const processedLinks = (linkMessages || []).flat().reduce((acc, message) => {
      let linkUrl = message.attachment?.url;
      if (linkUrl) {
        if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
          linkUrl = `https://${linkUrl}`;
        }
        if (!seenUrls.has(linkUrl)) {
          acc.push({ url: linkUrl, messageId: message.message_id, sender: message.sender_name });
          seenUrls.add(linkUrl);
        }
      }
      return acc;
    }, []);
    setLinks(processedLinks);
  }, [imageMessages, documentMessages, linkMessages]);

  useEffect(() => {
    processApiData();
  }, [processApiData]);

  const refetch = useCallback(async () => {
    try {
      await Promise.all([refetchImages(), refetchDocuments(), refetchLinks()]);
    } catch (err) {
      console.error("Error during manual refetch:", err);
    }
  }, [refetchImages, refetchDocuments, refetchLinks]);

  return { mediaList, files, links, loading, error, refetch };
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

  return { data, loading, error, refetch: fetchPinnedMessagesByRoom };
};

// Hook operasi message
export const useMessageOperations = (opts = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (roomId, messageData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await messageService.sendMessage(roomId, messageData);
      if (result.success) return { success: true, message: result.message, data: result.data };
      else {
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

  const updateMessage = useCallback(async (messageId, content) => {
    setLoading(true);
    setError(null);
    try {
      const result = await messageService.updateMessage(messageId, content);
      if (result.success) return { success: true, message: result.message };
      else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update message";
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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
      if (result.success) return { success: true, message: result.message };
      else {
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

  const clearError = useCallback(() => setError(null), []);

  return {
    sendMessage,
    updateMessage,
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
