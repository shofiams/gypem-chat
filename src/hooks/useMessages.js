import { useState, useEffect, useCallback, useMemo } from "react";
import { messageService } from "../api/messageService";

export const useRoomMessages = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await messageService.fetchRoomMessages(roomId);

      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.message);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
    }
  }, [roomId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
  };
};

// Hook specifically for media processing
export const useRoomMedia = (roomId) => {
  const { messages, loading, error, refetch } = useRoomMessages(roomId);
  
  const processedData = useMemo(() => {
    if (!messages.length) {
      return { mediaList: [], files: [], links: [] };
    }
    
    return messageService.processMessagesForMedia(messages);
  }, [messages]);

  return {
    ...processedData,
    loading,
    error,
    refetch,
  };
};