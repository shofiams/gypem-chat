import { useState, useEffect, useCallback } from "react";
import { starredMessagesService } from "../api/starredMessageService";

// Hook untuk menampilkan semua pesan berbintang
export const useStarredMessages = (opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStarredMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.fetchAllStarredMessages();

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
    if (!opts.manual) {
      fetchStarredMessages();
    }
  }, [fetchStarredMessages, opts.manual]);

  return {
    data,
    loading,
    error,
    refetch: fetchStarredMessages,
  };
};

// Hook untuk menampilkan pesan berbintang berdasarkan room
export const useRoomStarredMessages = (roomId, roomMemberId, opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoomStarredMessages = useCallback(async () => {
    if (!roomId || !roomMemberId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.fetchRoomStarredMessages(roomId, roomMemberId);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch room starred messages");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, roomMemberId]);

  useEffect(() => {
    if (roomId && roomMemberId && !opts.manual) {
      fetchRoomStarredMessages();
    }
  }, [roomId, roomMemberId, fetchRoomStarredMessages, opts.manual]);

  return {
    data,
    loading,
    error,
    refetch: fetchRoomStarredMessages,
  };
};

// Hook untuk mencari pesan berbintang
export const useStarredMessagesSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (keyword) => {
    if (!keyword?.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.searchStarredMessages(keyword);

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.message);
        setSearchResults([]);
      }
    } catch (err) {
      setError(err.message || "Failed to search starred messages");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    performSearch,
    clearSearch,
    refetch: performSearch,
  };
};

// Hook untuk operasi starred messages (fetch, search dengan kontrol penuh)
export const useStarredMessagesOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllStarred = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.fetchAllStarredMessages();

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch starred messages";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomStarred = useCallback(async (roomId, roomMemberId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.fetchRoomStarredMessages(roomId, roomMemberId);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch room starred messages";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStarred = useCallback(async (keyword) => {
    setLoading(true);
    setError(null);

    try {
      const result = await starredMessagesService.searchStarredMessages(keyword);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to search starred messages";
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
    fetchAllStarred,
    fetchRoomStarred,
    searchStarred,
    loading,
    error,
    clearError,
  };
};