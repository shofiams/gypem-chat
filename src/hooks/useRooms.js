import { useState, useEffect, useCallback } from "react";
import { roomService } from "../api/roomService";

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(rooms + 'rooms')

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.fetchRooms();

      if (result.success) {
        setRooms(result.data);
      } else {
        setError(result.message);
        setRooms([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    retry: fetchRooms,
  };
};

export const useRoomDetails = (roomId) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await roomService.fetchRoomDetails(roomId);

      if (result.success) {
        setRoomDetails(result.data);
      } else {
        setError(result.message);
        setRoomDetails(null);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch room details");
      setRoomDetails(null);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId, fetchRoomDetails]);

  return {
    roomDetails,
    loading,
    error,
    refetch: fetchRoomDetails,
  };
};

// Hook for room operations (create, delete)
export const useRoomOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPrivateRoom = useCallback(async (targetAdminId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.createPrivateRoom(targetAdminId);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create private room";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const leave = useCallback(async (roomMemberId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.leaveRoom(roomMemberId);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to leave room";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRooms = useCallback(async (roomMemberIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.deleteRooms(roomMemberIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete rooms";
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
    createPrivateRoom,
    leave,
    deleteRooms,
    loading,
    error,
    clearError,
  };
};
