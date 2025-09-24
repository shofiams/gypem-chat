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
    if (!roomId) return;

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

  // VVV TAMBAHKAN FUNGSI BARU INI VVV
  const updateMessage = useCallback(async (messageId, content) => {
    setLoading(true);
    setError(null);
    try {
      const result = await messageService.updateMessage(messageId, content);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
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

  return {
    sendMessage,
    starMessages,
    unstarMessages,
    markMessagesAsRead,
    deleteMessagesForMe,
    deleteMessagesGlobally,
    pinMessage,
    updateMessage,
    unpinMessage,
    loading,
    error,
    clearError,
  };
};