// src/hooks/useRooms.js
import { useState, useEffect, useCallback, useRef } from "react";
import { roomService } from "../api/roomService";
import {
  getCachedRooms,
  cacheRooms,
  isRoomCached,
  updateCachedRoom,
  removeCachedRoom,
} from "../utils/db.js";

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isMountedRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  const fetchRooms = useCallback(
    async (forceApi = false) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Step 1: Ambil dari cache dulu (jika bukan force API)
        if (!forceApi && isInitialLoadRef.current) {
          const cachedRooms = await getCachedRooms();

          if (cachedRooms.length > 0) {
            console.log("📦 Loading rooms from cache first...");

            // Proses rooms (tambahkan admin_id)
            const processedCached = processRoomsData(cachedRooms);

            setRooms(processedCached);
            setIsFromCache(true);
            setLoading(false); // Set loading false karena sudah ada data
          }
        }

        // Step 2: Fetch dari API (background atau foreground)
        console.log("🌐 Fetching rooms from API...");
        const result = await roomService.fetchRooms();

        if (!isMountedRef.current) return;

        if (result.success) {
          // Proses rooms dengan data yang sudah ada dari API
          const processedRooms = (result.data || []).map((room) => {
            // Ensure room_id is valid
            if (!room || typeof room.room_id === "undefined") {
              console.warn("Skipping room due to missing room_id:", room);
              return { ...room, admin_id: null };
            }

            // Calculate admin_id safely
            let admin_id = null;
            if (
              room.room_type === "one_to_one" &&
              Array.isArray(room.members)
            ) {
              const adminMember = room.members.find(
                (m) => m && m.member_type === "admin"
              );
              admin_id = adminMember?.member_id || null;
            }

            // Gunakan data last_message yang sudah ada dari API response
            // Jika API tidak mengembalikan last_message, tambahkan default values
            return {
              ...room,
              admin_id: admin_id,
              // Ensure last message fields exist (gunakan dari API atau default)
              last_message: room.last_message || null,
              last_message_type: room.last_message_type || "text",
              last_time: room.last_time || room.updated_at,
              is_last_message_mine: room.is_last_message_mine || false,
              last_message_status: room.last_message_status || "sent",
              last_message_updated_at:
                room.last_message_updated_at || room.updated_at,
              last_message_created_at:
                room.last_message_created_at || room.created_at,
              last_message_is_starred: room.last_message_is_starred || false,
              last_message_is_pinned: room.last_message_is_pinned || false,
              last_message_is_deleted: room.last_message_is_deleted || false,
            };
          });

          console.log("Processed rooms:", processedRooms);

          // Update state dengan data dari API
          setRooms(processedRooms);
          setIsFromCache(false);

          // Cache rooms ke IndexedDB (async, tidak perlu await)
          cacheRooms(processedRooms).catch((err) =>
            console.error("Failed to cache rooms:", err)
          );

          console.log("✅ Rooms updated from API");
          isInitialLoadRef.current = false;

          return processedRooms;
        } else {
          setError(result.message || "Failed to fetch rooms: Unknown error");
          // Jika API gagal tapi ada cache, pertahankan cache
          if (rooms.length === 0) {
            setRooms([]);
          }
          return [];
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        console.error("Error fetching rooms:", err);
        const errorMsg = err.message || "Failed to fetch rooms";
        setError(errorMsg);

        // Jika error dan belum ada data, set empty
        if (rooms.length === 0) {
          setRooms([]);
        }

        return [];
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [rooms.length]
  );

  /**
   * Process rooms data - tambahkan admin_id untuk one-to-one rooms
   */
  const processRoomsData = (roomsData) => {
    return roomsData.map((room) => {
      if (room.room_type === "one_to_one" && room.members) {
        const adminMember = room.members.find(
          (member) => member.member_type === "admin"
        );
        if (adminMember) {
          return { ...room, admin_id: adminMember.member_id };
        }
      }
      return room;
    });
  };

  /**
   * Check apakah room sudah di-cache
   */
  const checkRoomCache = useCallback(async (roomId) => {
    try {
      const isCached = await isRoomCached(roomId);
      return isCached;
    } catch (error) {
      console.error("Error checking room cache:", error);
      return false;
    }
  }, []);

  /**
   * Update single room (dari socket atau manual update)
   */
  const updateRoom = useCallback(async (roomData) => {
    try {
      // Update di state
      setRooms((currentRooms) => {
        const existingIndex = currentRooms.findIndex(
          (r) => r.room_id === roomData.room_id
        );

        if (existingIndex !== -1) {
          // Update existing room
          const updated = [...currentRooms];
          updated[existingIndex] = { ...updated[existingIndex], ...roomData };
          return updated;
        } else {
          // Add new room di awal
          return [roomData, ...currentRooms];
        }
      });

      // Update di cache (async)
      updateCachedRoom(roomData).catch((err) =>
        console.error("Failed to update room cache:", err)
      );
    } catch (error) {
      console.error("Error updating room:", error);
    }
  }, []);

  /**
   * Remove room (ketika delete atau leave)
   */
  const removeRoom = useCallback(async (roomId) => {
    try {
      // Remove dari state
      setRooms((currentRooms) =>
        currentRooms.filter((room) => room.room_id !== roomId)
      );

      // Remove dari cache (async)
      removeCachedRoom(roomId).catch((err) =>
        console.error("Failed to remove room from cache:", err)
      );
    } catch (error) {
      console.error("Error removing room:", error);
    }
  }, []);

  /**
   * Optimistic updates untuk room baru
   */
  const addOptimisticRoom = useCallback((optimisticRoom) => {
    setRooms((currentRooms) => [optimisticRoom, ...currentRooms]);
  }, []);

  const updateOptimisticRoom = useCallback((optimisticId, serverData) => {
    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.optimisticId === optimisticId
          ? { ...serverData, optimisticId: undefined }
          : room
      )
    );
  }, []);

  const removeOptimisticRoom = useCallback((optimisticId) => {
    setRooms((currentRooms) =>
      currentRooms.filter((room) => room.optimisticId !== optimisticId)
    );
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchRooms();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRooms]);

  // Handle unread count updates dari event
  useEffect(() => {
    const handleUnreadCountUpdated = (event) => {
      const { roomId, unreadCount } = event.detail;

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.room_id === roomId
            ? { ...room, unread_count: unreadCount }
            : room
        )
      );

      // Update cache juga
      updateCachedRoom({ room_id: roomId, unread_count: unreadCount }).catch(
        (err) => console.error("Failed to update unread count in cache:", err)
      );
    };

    window.addEventListener("unreadCountUpdated", handleUnreadCountUpdated);

    return () => {
      window.removeEventListener(
        "unreadCountUpdated",
        handleUnreadCountUpdated
      );
    };
  }, []);

  return {
    rooms,
    loading,
    error,
    isFromCache,
    refetch: fetchRooms,
    checkRoomCache,
    updateRoom,
    removeRoom,
    addOptimisticRoom,
    updateOptimisticRoom,
    removeOptimisticRoom,
  };
};

/**
 * Hook untuk room details
 */
export const useRoomDetails = (roomId) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(!!roomId);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchRoomDetails = useCallback(async () => {
    // Check if roomId is actually a valid ID (not null, undefined, or potentially an optimistic ID string)
    if (!roomId || typeof roomId !== "number") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Langsung fetch dari API
      console.log(`🌐 Fetching room details for ${roomId} from API...`);
      const result = await roomService.fetchRoomDetails(roomId);

      if (!isMountedRef.current) return;

      if (result.success) {
        setRoomDetails(result.data);
        return result.data;
      } else {
        setError(result.message);
        setRoomDetails(null);
        return null;
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error(`Failed to fetch room details for ID ${roomId}:`, err);
      const errorMsg = err.message || "Failed to fetch room details";
      setError(errorMsg);
      setRoomDetails(null);
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [roomId]);

  useEffect(() => {
    isMountedRef.current = true;

    if (roomId) {
      fetchRoomDetails();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [roomId, fetchRoomDetails]);

  return {
    roomDetails,
    loading,
    error,
    refetch: fetchRoomDetails,
  };
};

/**
 * Hook untuk room operations (create, leave, delete)
 */
export const useRoomOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPrivateRoom = useCallback(async (targetAdminId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.createPrivateRoom(targetAdminId);

      if (result.success) {
        // Cache room yang baru dibuat
        if (result.data) {
          updateCachedRoom(result.data).catch((err) =>
            console.error("Failed to cache new room:", err)
          );
        }

        return { success: true, data: result.data, message: result.message };
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
