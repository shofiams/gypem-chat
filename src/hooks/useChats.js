import { useState, useEffect, useCallback } from "react";
import { chatService } from "../api/chatService";

export const useChats = (opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await chatService.fetchAllChats();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch chats");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!opts.manual) {
      fetchChats();
    }
  }, [fetchChats, opts.manual]);

  return {
    data,
    loading,
    error,
    refetch: fetchChats,
  };
};
