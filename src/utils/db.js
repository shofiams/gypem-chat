import Dexie from "dexie";

export const db = new Dexie("gypemChatDB");

db.version(1).stores({
  rooms: "room_id, last_message_at, unread_count",
  messages:
    "++local_id, &message_id, &temp_id, room_id, created_at, status, [room_id+created_at]",
  roomDetails: "room_id, cached_at",
  starredMessages: "message_id, room_id, cached_at",
  admins: "admin_id, cached_at",
});


/**
 * Cache rooms (max 15)
 */
export async function cacheRooms(rooms) {
  try {
    if (!Array.isArray(rooms) || rooms.length === 0) return;

    // Urutkan berdasarkan last_message_at (terbaru dulu)
    const sortedRooms = [...rooms].sort((a, b) => {
      const timeA = new Date(a.last_message_at || 0).getTime();
      const timeB = new Date(b.last_message_at || 0).getTime();
      return timeB - timeA;
    });

    // Ambil maksimal 15 room
    const roomsToCache = sortedRooms.slice(0, 15);

    const validRooms = roomsToCache.filter((room) => {
      if (!room.room_id) {
        console.warn("Skipping room with missing room_id:", room);
        return false;
      }
      const roomId = Number(room.room_id);
      if (isNaN(roomId)) {
        console.warn("Skipping room with invalid room_id:", room.room_id);
        return false;
      }
      return true;
    });

    await db.transaction("rw", db.rooms, async () => {
      // Hapus semua room lama
      await db.rooms.clear();

      // Simpan room baru dengan timestamp cache
      const roomsWithTimestamp = validRooms.map((room) => ({
        ...room,
        cached_at: Date.now(),
      }));

      await db.rooms.bulkPut(roomsWithTimestamp);
    });

    console.log(`✅ Cached ${validRooms.length} rooms to IndexedDB`);
  } catch (error) {
    console.error("Error caching rooms:", error);
  }
}

/**
 * Mengambil semua rooms dari cache
 */
export async function getCachedRooms() {
  try {
    const rooms = await db.rooms.toArray();

    // Urutkan berdasarkan last_message_at
    rooms.sort((a, b) => {
      const timeA = new Date(a.last_message_at || 0).getTime();
      const timeB = new Date(b.last_message_at || 0).getTime();
      return timeB - timeA;
    });

    console.log(`📦 Retrieved ${rooms.length} rooms from cache`);
    return rooms;
  } catch (error) {
    console.error("Error getting cached rooms:", error);
    return [];
  }
}

/**
 * Mengambil room tertentu dari cache berdasarkan room_id
 */
export async function getCachedRoom(roomId) {
  try {
    const room = await db.rooms.get(roomId);
    return room || null;
  } catch (error) {
    console.error("Error getting cached room:", error);
    return null;
  }
}

/**
 * Cek apakah room ada di cache
 */
export async function isRoomCached(roomId) {
  try {
    const room = await db.rooms.get(roomId);
    return !!room;
  } catch (error) {
    console.error("Error checking cached room:", error);
    return false;
  }
}

/**
 * Update single room di cache
 */
export async function updateCachedRoom(room) {
  try {
    await db.rooms.put({
      ...room,
      cached_at: Date.now(),
    });
    console.log(`✅ Updated room ${room.room_id} in cache`);
  } catch (error) {
    console.error("Error updating cached room:", error);
  }
}

/**
 * Hapus room dari cache
 */
export async function removeCachedRoom(roomId) {
  try {
    await db.rooms.delete(roomId);
    console.log(`🗑️ Removed room ${roomId} from cache`);
  } catch (error) {
    console.error("Error removing cached room:", error);
  }
}

// ============================================
// MESSAGE FUNCTIONS (existing - tidak berubah)
// ============================================

export async function upsertMessage(message) {
  try {
    if (message.message_id) {
      const existing = await db.messages
        .where("message_id")
        .equals(message.message_id)
        .first();

      if (existing) {
        await db.messages.update(existing.local_id, message);
        return existing.local_id;
      }
    }

    if (message.temp_id) {
      const pending = await db.messages
        .where("temp_id")
        .equals(message.temp_id)
        .first();

      if (pending) {
        await db.messages.update(pending.local_id, message);
        return pending.local_id;
      }
    }

    const id = await db.messages.add(message);
    return id;
  } catch (error) {
    console.error("Error upserting message:", error);
    throw error;
  }
}

export async function bulkUpsertMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return;

  try {
    await db.transaction("rw", db.messages, async () => {
      for (const msg of messages) {
        await upsertMessage(msg);
      }
    });
  } catch (error) {
    console.error("Error bulk upserting messages:", error);
    throw error;
  }
}

export async function pruneMessages() {
  try {
    const total = await db.messages.count();
    if (total <= 500) return;

    const excessCount = total - 500;

    const oldMessages = await db.messages
      .orderBy("created_at")
      .filter((msg) => {
        return msg.status !== "pending" && msg.status !== "failed";
      })
      .limit(excessCount)
      .toArray();

    if (oldMessages.length > 0) {
      const idsToDelete = oldMessages.map((m) => m.local_id);
      await db.messages.bulkDelete(idsToDelete);
      console.log(`Pruned ${idsToDelete.length} old messages from cache`);
    }
  } catch (error) {
    console.error("Error pruning messages:", error);
  }
}

export async function getMessagesByRoom(roomId) {
  try {
    const messages = await db.messages
      .where("[room_id+created_at]")
      .between([roomId, 0], [roomId, Infinity])
      .toArray();

    return messages;
  } catch (error) {
    console.error("Error getting messages by room:", error);
    return [];
  }
}

export async function getLatestMessageTimestamp(roomId) {
  try {
    const messages = await db.messages
      .where("room_id")
      .equals(roomId)
      .reverse()
      .sortBy("created_at");

    return messages.length > 0 ? messages[0].created_at : null;
  } catch (error) {
    console.error("Error getting latest timestamp:", error);
    return null;
  }
}

export async function deleteMessagesByRoom(roomId) {
  try {
    const messages = await db.messages
      .where("room_id")
      .equals(roomId)
      .toArray();
    const idsToDelete = messages.map((m) => m.local_id);

    if (idsToDelete.length > 0) {
      await db.messages.bulkDelete(idsToDelete);
      console.log(`Deleted ${idsToDelete.length} messages from room ${roomId}`);
    }
  } catch (error) {
    console.error("Error deleting messages by room:", error);
  }
}
