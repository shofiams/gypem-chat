import { useState, useCallback } from "react";
import { searchService } from "../api/searchService";

// Hook untuk global search
export const useGlobalSearch = () => {
  const [searchResults, setSearchResults] = useState({ rooms: [], messages: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (keyword) => {
    if (!keyword?.trim()) {
      setSearchResults({ rooms: [], messages: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchService.globalSearch(keyword);

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.message);
        setSearchResults({ rooms: [], messages: [] });
      }
    } catch (err) {
      setError(err.message || "Failed to perform search");
      setSearchResults({ rooms: [], messages: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults({ rooms: [], messages: [] });
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

// Hook untuk room-scoped search
export const useRoomSearch = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchInRoom = useCallback(async (keyword) => {
    if (!roomId || !keyword?.trim()) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchService.searchInRoom(roomId, keyword);

      if (result.success) {
        setMessages(result.data.messages || []);
      } else {
        setError(result.message);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Failed to search in room");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const clearSearch = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    searchInRoom,
    clearSearch,
    refetch: searchInRoom,
  };
};

// Hook untuk search operations (dengan debounce optional)
export const useSearchOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performGlobalSearch = useCallback(async (keyword) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchService.globalSearch(keyword);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to perform global search";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const performRoomSearch = useCallback(async (roomId, keyword) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchService.searchInRoom(roomId, keyword);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to search in room";
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
    performGlobalSearch,
    performRoomSearch,
    loading,
    error,
    clearError,
  };
};