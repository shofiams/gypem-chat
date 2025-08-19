const getLastMessage = (chatId) => {
  const msgs = INITIAL_MESSAGES[chatId] ?? [];
  if (!Array.isArray(msgs) || msgs.length === 0)
    return { message: "", time: "" };
  const last = msgs[msgs.length - 1];
  return {
    message: last.message ?? "",
    time: last.time ?? "",
    type: last.type ?? "",
  };
};

// Mock messages for each chat - in real app, this would be loaded from API based on chatId
export const INITIAL_MESSAGES = {
  1: [
    {
      id: 1,
      type: "receiver",
      sender: "Pak Ketua",
      message: "Welcome to Class All!",
      time: "16.01",
      isStarred: true,
    },
    {
      id: 2,
      type: "receiver",
      sender: "Pimpinan A",
      message: "Hello everyone!",
      time: "16.02",
    },
    {
      id: 3,
      type: "receiver",
      sender: "Pimpinan B",
      image: "/gambar1.jpg",
      message: "Check out this image!",
      time: "16.03",
    },
    {
      id: 4,
      type: "receiver",
      sender: "Admin A",
      file: {
        name: "Demokrasi Nasional.pdf",
        url: "/gypem-chat/public/DEMOKRASI NASIONAL.pdf",
      },
      message: "Here's the document you requested",
      time: "16.04",
      isStarred: true,
    },
  ],
  2: [
    {
      id: 1,
      type: "receiver",
      sender: "Admin A",
      message: "Hello everyone!",
      time: "16.02",
      isStarred: true,
    },
    {
      id: 2,
      type: "receiver",
      sender: "Pimpinan A",
      message: "Ready for the competition?",
      time: "16.01",
    },
  ],
  3: [
    {
      id: 1,
      type: "receiver",
      sender: "Admin A",
      message: "Good luck everyone!",
      time: "16.01",
    },
    {
      id: 2,
      type: "receiver",
      sender: "Admin B",
      message: "Don't forget to submit your answers",
      time: "16.02",
    },
  ],
  4: [
    {
      id: 1,
      type: "receiver",
      sender: "Admin Gypem",
      message: "System update completed",
      time: "16.01",
      isStarred: true,
    },
    {
      id: 2,
      type: "sender",
      sender: "Anda",
      message: "Great, thanks for the update",
      time: "16.02",
    },
  ],
  5: [
    {
      id: 1,
      type: "receiver",
      sender: "Admin WITA",
      message: "Meeting scheduled for tomorrow",
      time: "16.01",
    },
    {
      id: 2,
      type: "sender",
      sender: "Anda",
      message: "I'll be there",
      time: "16.02",
    },
  ],
  6: [
    {
      id: 1,
      type: "receiver",
      sender: "Admin WIB",
      message: "Mongols",
      time: "16.01",
    },
    {
      id: 2,
      type: "sender",
      sender: "Anda",
      message: "What about them?",
      time: "16.02",
    },
  ],
  // ADD: Group chat messages with multiple senders
  7: [
    {
      id: 1,
      sender: "Admin B",
      message: "Admin message",
      time: "15:01",
      type: "receiver",
    },
    {
      id: 2,
      sender: "Admin A", 
      message: "Thank you",
      time: "16:01",
      type: "receiver",
      reply: {
        sender: "Admin B",
        message: "Admin message",
      },
    },
    {
      id: 3,
      sender: "Pimpinan A",
      message: "The leader added an answer",
      time: "16:01", 
      type: "receiver",
    },
    {
      id: 4,
      sender: "Admin A",
      message: "The chairman gave a message of advice",
      time: "16:01",
      type: "receiver",
    },
  ],
};

// Mock data - in real app, this would be loaded from API
export const INITIAL_CHATS = [
  {
    id: 1,
    name: "Class All - Broadcast",
    lastMessage: "Welcome to Class All!",
    time: "10:15",
    unreadCount: 3,
    avatar: null,
    isOnline: false,
    showCentang: false,
    showCentangAbu: false,
    type: "group",
    members: ["Pak Ketua", "Pimpinan A", "Pimpinan B", "Admin A", "Admin B", "Admin WITA"],
    isReadOnly: true,
  },
  {
    id: 2,
    name: "Olympiad Moon",
    lastMessage: "Pesan terkirim",
    time: "10:15",
    unreadCount: 1,
    avatar: null,
    isOnline: true,
    showCentang: true,
    showCentangAbu: false,
    type: "group",
    members: ["Pak Ketua", "Pimpinan A", "Pimpinan B", "Admin A", "Admin B", "Admin WITA"],
    isReadOnly: true,
  },
  {
    id: 3,
    name: "Olympiade Star",
    lastMessage: "Belum dibaca nih",
    time: "10:15",
    unreadCount: 11,
    avatar: null,
    isOnline: false,
    showCentang: false,
    showCentangAbu: true,
    type: "group",
    members: ["Pak Ketua", "Pimpinan A", "Pimpinan B", "Admin A", "Admin B", "Admin WITA"],
    isReadOnly: true,
  },
  {
    id: 4,
    name: "Admin Gypem",
    lastMessage: "Sudah dibaca",
    time: "10:15",
    unreadCount: 0,
    avatar: null,
    isOnline: true,
    showCentang: true,
    showCentangAbu: false,
    type: "one-to-one",
  },
  {
    id: 5,
    name: "Admin WITA",
    lastMessage: "Gimana sih itu...",
    time: "10:09",
    unreadCount: 0,
    avatar: null,
    isOnline: false,
    showCentang: false,
    showCentangAbu: true,
    type: "one-to-one",
  },
  {
    id: 6,
    name: "Admin WIB",
    lastMessage: "Mongols",
    time: "10:02",
    unreadCount: 0,
    avatar: null,
    isOnline: false,
    showCentang: false,
    showCentangAbu: false,
    type: "one-to-one",
  },
  // ADD: Group chat example
  {
    id: 7,
    name: "Class All - English",
    lastMessage: "The chairman gave a message of advice",
    time: "16:01",
    unreadCount: 0,
    avatar: null,
    isOnline: false,
    showCentang: false,
    showCentangAbu: false,
    type: "group",
    members: ["Pak Ketua", "Pimpinan A", "Pimpinan B", "Admin A", "Admin B", "Admin WITA"],
    isReadOnly: true,
  },
].map((chat) => {
  const last = getLastMessage(chat.id);
  return {
    ...chat,
    lastMessage: last.message,
    lastMessageTime: last.time,
  };
});

export const STARRED_MESSAGES = {
  1: { chatId: 1, messageId: 1 }, // "Welcome to Class All!" from chat 1
  4: { chatId: 1, messageId: 4 }, // PDF document from chat 1
  7: { chatId: 2, messageId: 1 }, // "Hello everyone!" from chat 2
  11: { chatId: 4, messageId: 1 }, // "System update completed" from chat 4
};