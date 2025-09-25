import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ChatBubblePeserta from "../components/ChatBubblePeserta";
import FileUploadPopup from "../components/FileUploadPopup";
import { useChatHeader } from "../hooks/useChatHeader";
import { assets } from "../assets/assets";
import groupPhoto from "../assets/admin-profile.png";
import chatBg from "../assets/chat-bg.png";
import EmojiPicker from "emoji-picker-react";
import { useMessagesByRoom, useMessageOperations, usePinnedMessagesByRoom } from "../hooks/useMessages";
import { messageService, formatMessageTime } from "../api/messageService";

const DateSeparator = ({ children, timestamp }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Today";
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex justify-center my-3">
      <span className="bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-500 rounded-[20px] shadow">
        {children || formatDate(timestamp)}
      </span>
    </div>
  );
};

// Helper function to determine time grouping properties
const getTimeGroupingProps = (currentMsg, currentIndex, allMessages) => {
  const nextMsg = allMessages[currentIndex + 1];
  const previousMsg = currentIndex > 0 ? allMessages[currentIndex - 1] : null;
  
  const currentSender = currentMsg.sender_type === 'admin' ? "You" : currentMsg.sender_name;
  const nextSender = nextMsg ? (nextMsg.sender_type === 'admin' ? "You" : nextMsg.sender_name) : null;
  const previousSender = previousMsg ? (previousMsg.sender_type === 'admin' ? "You" : previousMsg.sender_name) : null;
  
  const currentTime = formatMessageTime(currentMsg.created_at);
  const nextTime = nextMsg ? formatMessageTime(nextMsg.created_at) : null;
  const previousTime = previousMsg ? formatMessageTime(previousMsg.created_at) : null;
  
  const isLastInTimeGroup = !nextMsg || 
    nextSender !== currentSender || 
    nextTime !== currentTime;
  
  const isFirstInTimeGroup = !previousMsg || 
    previousSender !== currentSender || 
    previousTime !== currentTime;
  
  const showTime = isLastInTimeGroup;
  
  return {
    showTime,
    isLastInTimeGroup,
    isFirstInTimeGroup,
    nextMessageTime: nextTime,
    previousMessageTime: previousTime,
    nextMessageSender: nextSender,
    previousMessageSender: previousSender
  };
};

const BaseChatPage = ({ 
  isEmbedded = false, 
  onClose, 
  chatId: propChatId,
  isGroupChat = false,
  customHeader = null,
  customFooter = null,
  canSendMessages = true,
  showSenderNames = false,
  getSenderColor = null,
  highlightMessageId = null,
  onMessageHighlight = null,
  customChatBubbleProps = {},
  onGroupHeaderClick = null
}) => {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // **PERBAIKAN:** Mendefinisikan `actualChatId` di sini agar bisa digunakan oleh semua hooks.
  const actualChatId = isEmbedded ? propChatId : paramChatId;

  // **PERBAIKAN:** Menggunakan hook `useChatHeader` untuk mendapatkan data header.
  const chatInfo = useChatHeader(actualChatId, isGroupChat);
  
  const { 
    data: contextMessages, 
    loading: messagesLoading, 
    error: messagesError, 
    refetch: refetchMessages 
  } = useMessagesByRoom(actualChatId);
  
  const { 
    data: pinnedMessagesData, 
    refetch: refetchPinnedMessages 
  } = usePinnedMessagesByRoom(actualChatId);

  const {
    sendMessage,
    starMessages,
    unstarMessages,
    pinMessage,
    unpinMessage,
    updateMessage,
    deleteMessagesForMe,
    deleteMessagesGlobally,
    loading: operationLoading,
    error: operationError
  } = useMessageOperations();

  const currentChatPinnedMessages = useMemo(() => {
    if (!pinnedMessagesData || !Array.isArray(pinnedMessagesData)) return [];
    return pinnedMessagesData;
  }, [pinnedMessagesData]);

  // **PERBAIKAN:** Menghapus state `chatInfo` lokal karena sudah ditangani oleh `useChatHeader`.
  // const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);

  // ... (sisa state tidak berubah)
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedDeleteOption, setSelectedDeleteOption] = useState('me');
  const messageRefs = useRef({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileButtonRef = useRef(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const searchHighlightTimer = useRef(null);
  const inputRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isMobileKeyboard, setIsMobileKeyboard] = useState(false);

  const flattenedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    return messages.flat().filter(msg => {
      if (msg.is_deleted_globally) {
        return true;
      }
      if (!msg.message_status || msg.message_status.is_deleted_for_me) {
        return false;
      }
      return true;
    });
  }, [messages]);

  useEffect(() => {
    console.log('flattenedMessages:', flattenedMessages);
    console.log('currentChatPinnedMessages:', currentChatPinnedMessages);
  }, [flattenedMessages, currentChatPinnedMessages]);

  useEffect(() => {
    if (contextMessages) {
      setMessages(contextMessages);
    }
  }, [contextMessages]);
  
  // **PERBAIKAN:** Menghapus useEffect untuk `fetchChatInfo` karena sudah ditangani oleh `useChatHeader`.
  /*
  useEffect(() => {
    const fetchChatInfo = async () => {
      // ...
    };
    if (actualChatId) {
      fetchChatInfo();
    }
  }, [actualChatId]);
  */

  // ... (Sisa dari useEffect dan fungsi lainnya tetap sama, tidak perlu diubah)

  useEffect(() => {
    if (!actualChatId) {
      if (!isEmbedded) {
        navigate('/chats', { replace: true });
      }
      return;
    }
    
    const markAsRead = async () => {
      try {
        const unreadMessages = flattenedMessages
          .filter(msg => !msg.message_status?.read_at)
          .map(msg => ({
            message_id: msg.message_id,
            message_status_id: msg.message_status?.message_status_id
          }));
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(m => m.message_id);
          const messageStatusIds = unreadMessages.map(m => m.message_status_id);
          // await markMessagesAsRead(messageIds, messageStatusIds);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    
    if (flattenedMessages.length > 0) {
      markAsRead();
    }
    
    setTimeout(() => {
      scrollToBottomInstant();
    }, 10);
  }, [actualChatId, isEmbedded, flattenedMessages, navigate]);
  
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .elegant-scrollbar { 
        scrollbar-width: thin !important; 
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar { 
        width: 4px !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-track { 
        background: transparent !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-track-piece { 
        margin: 16px 0 !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-thumb { 
        background-color: rgba(156, 163, 175, 0.25) !important; 
        border-radius: 4px !important; 
        transition: background-color 0.2s ease !important; 
      }
      .elegant-scrollbar:hover::-webkit-scrollbar-thumb { 
        background-color: rgba(156, 163, 175, 0.5) !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-button { 
        display: none !important; 
        height: 0 !important; 
        width: 0 !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-corner {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollFromBottom = scrollHeight - scrollTop - clientHeight;
      
      setShowScrollButton(scrollFromBottom > 100);
      
      setIsUserScrolling(scrollFromBottom > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (highlightMessageId && messageRefs.current[highlightMessageId]) {
      messageRefs.current[highlightMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      
      setHighlightedMessageId(highlightMessageId);
      
      if (onMessageHighlight) {
        onMessageHighlight(highlightMessageId);
      }
      
      setTimeout(() => setHighlightedMessageId(null), 1500);
    }
  }, [highlightMessageId, onMessageHighlight]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlHighlightId = urlParams.get('highlight');
    const messageIdToHighlight = highlightMessageId || urlHighlightId;
    
    if (messageIdToHighlight && messageRefs.current[messageIdToHighlight]) {
      messageRefs.current[messageIdToHighlight].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      
      setHighlightedMessageId(messageIdToHighlight);
      
      if (onMessageHighlight) {
        onMessageHighlight(messageIdToHighlight);
      }
      
      setTimeout(() => setHighlightedMessageId(null), 1500);
    }
  }, [highlightMessageId, location.search, onMessageHighlight]);

  useEffect(() => {
    return () => {
      if (searchHighlightTimer.current) {
        clearTimeout(searchHighlightTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canSendMessages && !isSelectionMode && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [actualChatId, canSendMessages, isSelectionMode]);

  useEffect(() => {
    const cekMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobileKeyboard(isMobile || isTouchDevice);
    };
    
    cekMobile();
    window.addEventListener('resize', cekMobile);
    return () => window.removeEventListener('resize', cekMobile);
  }, []);

  useEffect(() => {
    if (editingMessage && editText && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          autoResize(inputRef.current);
          inputRef.current.focus();
          
          const textLength = editText.length;
          inputRef.current.setSelectionRange(textLength, textLength);
          
          scrollToCursor(inputRef.current);
        }
      }, 50);
    }
  }, [editingMessage, editText]);

  const getSelectedMessageTypes = () => {
    if (!isSelectionMode || selectedMessages.size === 0) return { hasReceiver: false, hasSender: false };
    
    let hasReceiver = false;
    let hasSender = false;
    
    selectedMessages.forEach(messageId => {
      const message = flattenedMessages.find(msg => msg.message_id === messageId);
      if (message) {
        if (message.sender_type === 'admin') {
          hasReceiver = true;
        } else if (message.sender_type === 'peserta') {
          hasSender = true;
        }
      }
    });
    
    return { hasReceiver, hasSender };
  };

  const getDeleteBehavior = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      const { hasReceiver, hasSender } = getSelectedMessageTypes();
      
      if (hasSender && !hasReceiver) {
        return 'sender-only';
      }
      else if (hasReceiver) {
        return 'receiver-included';
      }
    } else if (messageToDelete) {
      return messageToDelete.sender_type === 'peserta' ? 'sender-only' : 'receiver-included';
    }
    
    return 'receiver-included';
  };

  const handlePinMessage = async (messageStatusId) => {
    if (!messageStatusId) {
      console.error('messageStatusId is missing for pin');
      alert('Error: Status ID pesan tidak ditemukan');
      return;
    }

    try {
      const result = await pinMessage(messageStatusId);
      
      if (result.success) {
        await refetchMessages();
        await refetchPinnedMessages();
      } else {
        alert('Gagal pin pesan: ' + result.error);
      }
    } catch (error) {
      alert('Gagal pin pesan: ' + error.message);
    }
  };

  const handleUnpinMessage = async (messageId, messageStatusId) => {
    if (!messageId || !messageStatusId) {
      alert('Error: ID pesan tidak lengkap');
      return;
    }

    try {
      const result = await unpinMessage(messageId, messageStatusId);
      
      if (result && result.success) {
        await refetchMessages();
        await refetchPinnedMessages();
      } else {
        alert('Gagal unpin pesan: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Gagal unpin pesan: ' + error.message);
    }
  };
  const checkIsMessagePinned = (messageId) => {
    const message = flattenedMessages.find(msg => msg.message_id === messageId);
    return message?.message_status?.is_pinned || false;
  };
  
  const checkIsMessageStarred = (messageId) => {
    const message = flattenedMessages.find(msg => msg.message_id === messageId);
    return message?.message_status?.is_starred || false;
  };

  const navigatePinnedMessage = (direction) => {
    if (currentChatPinnedMessages.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentPinnedIndex + 1 >= currentChatPinnedMessages.length ? 0 : currentPinnedIndex + 1;
    } else {
      newIndex = currentPinnedIndex - 1 < 0 ? currentChatPinnedMessages.length - 1 : currentPinnedIndex - 1;
    }
    
    setCurrentPinnedIndex(newIndex);
  };

  const handleSend = async () => {
    // 1. Pastikan ada pesan teks untuk dikirim
    if (!message.trim()) return;

    // 2. Siapkan data untuk pesan TEKS (bukan file)
    const messageData = {
      content: message.trim(), // Ambil teks dari input
      reply_to_message_id: replyingMessage ? replyingMessage.message_id : null,
    };
    
    // 3. Panggil fungsi untuk mengirim pesan
    const result = await sendMessage(actualChatId, messageData);
    
    // 4. Jika berhasil, bersihkan input dan perbarui chat
    if (result.success) {
      setMessage("");
      setReplyingMessage(null);
      setShowEmojiPicker(false);
      refetchMessages();

      // Reset tinggi textarea dan scroll ke bawah
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px';
          inputRef.current.style.overflowY = 'hidden';
          inputRef.current.focus();
        }
      }, 10);

      setIsUserScrolling(false);
      setTimeout(() => {
        scrollToBottom();
      }, 50);

    } else {
      console.error("Failed to send message:", result.error);
      alert("Gagal mengirim pesan: " + (result.message || "Silakan coba lagi."));
    }
  };

  const handleKeyDown = (e) => {
    if (editingMessage) {
      if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Enter' && (e.altKey || e.shiftKey)) {
        e.preventDefault();
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = editText.substring(0, start) + '\n' + editText.substring(end);
        setEditText(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          textarea.focus();
          autoResize(textarea);
          scrollToCursor(textarea);
        }, 0);
      }
    } else {
      if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        setShowEmojiPicker(false);
      } else if (e.key === 'Enter' && (e.altKey || e.shiftKey)) {
        if (!isMobileKeyboard) {
          e.preventDefault();
          const textarea = e.target;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = message.substring(0, start) + '\n' + message.substring(end);
          setMessage(newValue);
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            textarea.focus();
            autoResize(textarea);
            scrollToCursor(textarea);
          }, 0);
        }
      }
    }
    
    if (e.key === 'Escape' && editingMessage) {
      handleCancelEdit();
    }
  };
  
  const scrollToCursor = (textarea) => {
    if (!textarea) return;
    
    if (textarea.scrollHeight > textarea.clientHeight) {
      const lineHeight = 24;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n').length;
      const cursorY = lines * lineHeight;
      
      const scrollTop = Math.max(0, cursorY - textarea.clientHeight + lineHeight);
      textarea.scrollTop = scrollTop;
    }
  };

  const autoResize = (textarea) => {
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120;
    const minHeight = 24;
    
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (editingMessage) {
      setEditText(value);
    } else {
      setMessage(value);
    }
    
    setTimeout(() => {
      autoResize(e.target);
    }, 0);
  };

  const handleEdit = (messageId) => {
    const messageToEdit = flattenedMessages.find(msg => msg.message_id === messageId);
    if (messageToEdit && messageToEdit.content) {
      setEditingMessage(messageId);
      setEditText(messageToEdit.content);
      
      setTimeout(() => {
        if (inputRef.current) {
          autoResize(inputRef.current);
          inputRef.current.focus();
          
          const textLength = messageToEdit.content.length;
          inputRef.current.setSelectionRange(textLength, textLength);
          scrollToCursor(inputRef.current);
        }
      }, 10);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingMessage) return;

    // Panggil API untuk update pesan
    const result = await updateMessage(editingMessage, editText.trim());

    if (result.success) {
      console.log("Pesan berhasil diupdate");

      setMessages(currentMessages =>
        currentMessages.map(msgGroup =>
          msgGroup.map(msg => {
            if (msg.message_id === editingMessage) {
              // Objek yang dikembalikan harus cocok dengan apa yang dicek oleh bubble
              return {
                ...msg,
                content: editText.trim(),
                // TAMBAHKAN BARIS INI untuk memperbarui timestamp secara lokal
                updated_at: new Date().toISOString(), 
              };
            }
            return msg;
          })
        )
      );
      
      // Bersihkan state setelah berhasil
      setEditingMessage(null);
      setEditText("");

      // Reset tampilan textarea
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px';
          inputRef.current.style.overflowY = 'hidden';
          inputRef.current.focus();
        }
      }, 10);

      // Ambil ulang data pesan untuk menampilkan perubahan
      // await refetchMessages();

    } else {
      console.error("Gagal mengupdate pesan:", result.error);
      alert("Gagal menyimpan perubahan: " + result.error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = '24px';
        inputRef.current.style.overflowY = 'hidden';
        inputRef.current.focus();
      }
    }, 10);
  };

  const handleStartSelection = (messageId) => {
    setIsSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const handleToggleSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      
      return newSet;
    });
  };
  const handleStarMessage = async (messageId, messageStatusId, isCurrentlyStarred) => {
    if (!messageStatusId) {
      alert('Error: Status ID pesan tidak ditemukan');
      return;
    }

    try {
      let result;
      
      if (isCurrentlyStarred) {
        result = await unstarMessages([messageStatusId]);
      } else {
        result = await starMessages([messageStatusId]);
      }
      
      if (result.success) {
        await refetchMessages();
        await refetchPinnedMessages();
      } else {
        alert('Gagal mengubah status star: ' + result.error);
      }
      
    } catch (error) {
      alert('Gagal mengubah status star pesan: ' + error.message);
    }
  };

  const handlePinnedMessageClick = () => {
    const currentPin = currentChatPinnedMessages[currentPinnedIndex];
    if (currentPin && messageRefs.current[currentPin.message_id]) {
      messageRefs.current[currentPin.message_id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessageId(currentPin.message_id);
      setTimeout(() => setHighlightedMessageId(null), 1500);
    }
  };

  const handleSearch = useCallback((query) => {
    if (searchHighlightTimer.current) {
      clearTimeout(searchHighlightTimer.current);
      searchHighlightTimer.current = null;
    }

    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
      return;
    }

    const results = contextMessages.filter(msg => 
      msg.message && msg.message.toLowerCase().includes(query.toLowerCase())
    ).reverse().map(msg => ({
      ...msg,
      chatName: chatInfo?.name || 'Unknown'
    }));

    setSearchResults(results);
    
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      scrollToMessage(results[0].id);
      
      searchHighlightTimer.current = setTimeout(() => {
        setHighlightedMessageId(null);
        searchHighlightTimer.current = null;
      }, 1500);
    } else {
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
    }
  }, [contextMessages, chatInfo]);

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;
    
    if (searchHighlightTimer.current) {
      clearTimeout(searchHighlightTimer.current);
      searchHighlightTimer.current = null;
    }
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentSearchIndex + 1 >= searchResults.length ? 0 : currentSearchIndex + 1;
    } else {
      newIndex = currentSearchIndex - 1 < 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    }
    
    setCurrentSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex].id);
    
    searchHighlightTimer.current = setTimeout(() => {
      setHighlightedMessageId(null);
      searchHighlightTimer.current = null;
    }, 1500);
  };

  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessageId(messageId);
      if (!searchQuery) {
        setTimeout(() => setHighlightedMessageId(null), 800);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottomInstant = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScrollButtonClick = () => {
    setIsUserScrolling(false);
    scrollToBottom();
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark 
            key={index} 
            className="bg-yellow-300 text-black font-medium"
            style={{
              padding: '0',
              margin: '0',
              borderRadius: '2px',
              boxShadow: 'none'
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const handleDeleteRequest = (messageId, messageStatusId, senderType) => {
    if (isSelectionMode) {
      handleToggleSelection(messageId);
      return;
    }
    
    setMessageToDelete({ 
      message_id: messageId, 
      message_status_id: messageStatusId, 
      sender_type: senderType 
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (isSelectionMode && selectedMessages.size > 0) {
        const messagesToDelete = Array.from(selectedMessages);
        const messagesData = messagesToDelete.map(msgId => {
          const msg = flattenedMessages.find(m => m.message_id === msgId);
          return {
            message_id: msg?.message_id,
            message_status_id: msg?.message_status?.message_status_id
          };
        }).filter(data => data.message_id && data.message_status_id);
        
        const messageStatusIds = messagesData.map(d => d.message_status_id);
        
        const result = await deleteMessagesForMe(messageStatusIds);
        
        if (result.success) {
          setIsSelectionMode(false);
          setSelectedMessages(new Set());
        } else {
          alert('Gagal menghapus pesan: ' + result.error);
        }
        
      } else if (messageToDelete) {
        const result = await deleteMessagesForMe([messageToDelete.message_status_id]);
        
        if (!result.success) {
          alert('Gagal menghapus pesan: ' + result.error);
        }
      }
      
      setShowDeleteModal(false);
      setShowDeleteOptions(false);
      setMessageToDelete(null);
      setSelectedDeleteOption('me');
      
      await refetchMessages();
      await refetchPinnedMessages();
      
    } catch (error) {
      alert('Gagal menghapus pesan: ' + error.message);
    }
  };

  const handleDeleteForMe = () => {
    setSelectedDeleteOption('me');
    setShowDeleteOptions(true);
  };

  const handleDeleteForEveryone = () => {
    setSelectedDeleteOption('everyone');
    setShowDeleteOptions(true);
  };

  const handleFinalDelete = async () => {
      const messageIdsToDelete = isSelectionMode
        ? Array.from(selectedMessages)
        : (messageToDelete ? [messageToDelete.message_id] : []);

      if (messageIdsToDelete.length === 0) return;

      const previousMessages = [...messages];

      const deletedIdsSet = new Set(messageIdsToDelete);
      setMessages(currentMessages =>
        currentMessages.map(msgGroup =>
          msgGroup.map(msg => {
            if (deletedIdsSet.has(msg.message_id)) {
              if (selectedDeleteOption === 'everyone') {
                return {
                  ...msg,
                  is_deleted_globally: true,
                  content: null,
                  attachment: null,
                };
              }
              return null;
            }
            return msg;
          }).filter(Boolean)
        )
      );

      setShowDeleteModal(false);
      setShowDeleteOptions(false);
      setMessageToDelete(null);
      setSelectedDeleteOption('me');
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedMessages(new Set());
      }

      try {
        const messagesData = messageIdsToDelete.map(msgId => {
          const msg = flattenedMessages.find(m => m.message_id === msgId);
          return { message_id: msg?.message_id, message_status_id: msg?.message_status?.message_status_id };
        }).filter(data => data.message_id && data.message_status_id);

        const messageIds = messagesData.map(d => d.message_id);
        const messageStatusIds = messagesData.map(d => d.message_status_id);

        const result = selectedDeleteOption === 'everyone'
          ? await deleteMessagesGlobally(messageIds)
          : await deleteMessagesForMe(messageStatusIds);

        if (!result.success) {
          alert('Gagal menghapus pesan: ' + result?.error);
          setMessages(previousMessages);
        } else {
          refetchMessages();
          refetchPinnedMessages();
        }

      } catch (error) {
        alert('Gagal menghapus pesan, periksa koneksi Anda.');
        setMessages(previousMessages);
      }
  };


  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowDeleteOptions(false);
    setMessageToDelete(null);
    setSelectedDeleteOption('me');
  };

  const shouldShowSenderNameInBubble = (message, index) => {
    if (!showSenderNames) return false;
    if (message.sender_type === 'admin') return false;
    const prevMessage = index > 0 ? flattenedMessages[index - 1] : null;
    return !prevMessage || 
          prevMessage.sender_name !== message.sender_name || 
          prevMessage.sender_type !== message.sender_type;
  };

  const renderMessage = (msg, idx, arr) => {
    const nextMsg = arr[idx + 1];
    const prevMsg = idx > 0 ? arr[idx - 1] : null;
    
    const isSender = msg.sender_type === 'peserta';
    
    const isLastFromSender = !nextMsg || nextMsg.sender_type !== msg.sender_type || 
      (isGroupChat && nextMsg.sender_name !== msg.sender_name);
    const isLastFromReceiver = !nextMsg || nextMsg.sender_type !== msg.sender_type || 
      (isGroupChat && nextMsg.sender_name !== msg.sender_name);

    const isFirstFromSender = !prevMsg || 
      prevMsg.sender_type !== msg.sender_type || 
      (isGroupChat && prevMsg.sender_name !== msg.sender_name);

    const showSenderNameInBubble = showSenderNames && 
      !isSender && 
      msg.sender_name && 
      isFirstFromSender;
    
    const timeGroupingProps = getTimeGroupingProps(msg, idx, arr);
    
    const previousMessageSender = prevMsg ? 
      (prevMsg.sender_type === 'admin' ? "You" : prevMsg.sender_name) : null;

    const hasValidDeleteData = msg.message_id && 
                              msg.message_status?.message_status_id && 
                              msg.sender_type;

    if (!hasValidDeleteData) {
      console.warn(`Message ${msg.message_id} missing required delete data`);
    }

    return (
      <div key={msg.message_id} className="mb-2">
        <div
          ref={(el) => (messageRefs.current[msg.message_id] = el)}
          className={`relative ${highlightedMessageId === msg.message_id ? "" : ""}`}
        >
          {highlightedMessageId === msg.message_id && (
            <div 
              className="absolute inset-0 bg-yellow-200 rounded-lg pointer-events-none z-0 opacity-70"
              style={{ margin: '-2px', padding: '2px' }}
            />
          )}
          <div className="z-10">
            <ChatBubblePeserta
              {...msg}
              attachment={msg.attachment}
              isLastFromSender={isLastFromSender}
              isLastFromReceiver={isLastFromReceiver}
              onCopy={() => {}}
              onReply={canSendMessages ? (replyData) => setReplyingMessage(replyData) : null}
              onPin={(messageStatusId) => handlePinMessage(messageStatusId)}
              onUnpin={(messageId, messageStatusId) => handleUnpinMessage(messageId, messageStatusId)}
              isPinned={checkIsMessagePinned(msg.message_id)}
              onDelete={hasValidDeleteData ? (messageId, messageStatusId, senderType) => {
                if (isSelectionMode) {
                  handleToggleSelection(messageId);
                } else {
                  handleDeleteRequest(messageId, messageStatusId, senderType);
                }
              } : null}
              onEdit={canSendMessages ? (messageId) => handleEdit(messageId) : null} 
              isEdited={msg.is_edited || false} 
              isDeleted={msg.is_deleted_globally}
              isSelectionMode={isSelectionMode}
              isSelected={selectedMessages.has(msg.message_id)}
              onStartSelection={(messageId) => handleStartSelection(messageId)}
              onToggleSelection={() => handleToggleSelection(msg.message_id)}
              onStar={(messageId, messageStatusId, currentlyStarred) => 
                handleStarMessage(messageId, messageStatusId, currentlyStarred)
              }
              onUnstar={(messageId, messageStatusId, currentlyStarred) => 
                handleStarMessage(messageId, messageStatusId, currentlyStarred)
              }
              isStarred={checkIsMessageStarred(msg.message_id)}
              searchQuery={searchQuery}
              highlightSearchTerm={highlightSearchTerm}
              showSenderName={showSenderNameInBubble}
              sender={msg.sender_name}
              getSenderColor={getSenderColor}
              isGroupChat={isGroupChat}
              isFirstFromSender={isFirstFromSender}
              previousMessageSender={previousMessageSender}
              {...timeGroupingProps}
              isLastBubble={idx === arr.length - 1}
              {...customChatBubbleProps}
            />
          </div>
        </div>
      </div>
    );
  };

  // **PERBAIKAN:** `defaultHeader` sekarang sepenuhnya mengandalkan `chatInfo` dari hook.
  const defaultHeader = (
    <div className="flex items-center gap-3 p-3 border-b">
      <button
        onClick={() => {
          const isMobile = window.innerWidth < 768;
          if (isEmbedded && !isMobile && onClose) {
            onClose();
          } else {
            navigate('/chats');
          }
        }}
        className="md:hidden p-2 hover:bg-gray-100 rounded transition"
        aria-label="Back to chats"
      >
        <img src={assets.ArrowLeft} alt="Back" className="w-5 h-5" />
      </button>
      
      <div className="relative">
       <img
          src={chatInfo?.avatar || groupPhoto  }
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
          crossOrigin="anonymous"
          onError={(e) => { 
            console.error("Gagal memuat gambar avatar:", e);
            e.target.onerror = null; 
            e.target.src=groupPhoto;
          }}
        />
        {chatInfo?.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full"
            style={{ backgroundColor: "#FFB400" }}
          ></span>
        )}
      </div>
      <div 
        className={`flex-1 ${isGroupChat && onGroupHeaderClick ? 'cursor-pointer' : ''}`}
        onClick={isGroupChat && onGroupHeaderClick ? onGroupHeaderClick : undefined}
      >
        <p className="font-semibold text-sm">{chatInfo?.name}</p>
        <div className="text-xs text-gray-500 leading-4">
            <span className="truncate block">
                {chatInfo?.subtitle}
            </span>
        </div>
      </div>

      <button 
        data-search-button
        onClick={() => setShowSearchResults(!showSearchResults)}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition"
      >
        <img src={assets.Search} alt="Search" className="w-5 h-5" />
      </button>
    </div>
  );

  const deleteBehavior = getDeleteBehavior();

  return (
    <div className="flex flex-col h-full overflow-hidden border-l-[1px]">
      {isSelectionMode ? (
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">{selectedMessages.size} Selected</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedMessages.size > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <img src={assets.Trash} alt="Delete" className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMessages(new Set());
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        customHeader || defaultHeader
      )}

      {showSearchResults && !isSelectionMode && (
        <div className="absolute top-[66px] right-0 z-50 w-3/5 max-w-md">
          <div className="bg-[#f4f0f0] bg-opacity-80 rounded-bl-xl shadow-lg border overflow-hidden" style={{ borderColor: '#4C0D68' }}>
            <div className="pl-5 pr-3 py-3 flex items-center gap-2">
              <div className="flex-1 border-[1px] border-b-[6px] rounded-lg text-sm outline-none relative" style={{ borderColor: '#4C0D68' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full px-3 py-2 ${searchQuery ? (searchResults.length > 0 ? 'pr-16' : 'pr-24') : '' } rounded-lg`}
                  autoFocus
                />
                
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded border pointer-events-none">
                    {searchResults.length > 0 
                      ? `${currentSearchIndex + 1} of ${searchResults.length}`
                      : "Not Found"
                    }
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {searchResults.length > 0 && (
                  <>
                    <button
                      onClick={() => navigateSearchResults('next')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigateSearchResults('prev')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </>
                )}
                <div className="w-0.5 h-6 bg-gray-400 mx-1"></div>
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery("");
                    setSearchResults([]);
                    setCurrentSearchIndex(-1);
                    setHighlightedMessageId(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500"
                >
                  <img src={assets.CancelClose} alt="CancelClose" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentChatPinnedMessages.length > 0 && !isSelectionMode && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ backgroundColor: "#4C0D68" }}
        >
          <div className="flex items-center gap-2 flex-1 text-white">
            <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded">
              <img src={assets.PinFill} alt="pinned" className="w-3 h-3" />
            </div>
            
            <div 
              className="flex-1 cursor-pointer"
              onClick={handlePinnedMessageClick}
            >
              <p className="text-xs font-semibold">
                {currentChatPinnedMessages[currentPinnedIndex]?.sender_name}
              </p>
              <p className="text-xs truncate max-w-xs">
                {currentChatPinnedMessages[currentPinnedIndex]?.content || "Media"}
              </p>
            </div>
            
            {currentChatPinnedMessages.length > 1 && (
              <>
                <button
                  onClick={() => navigatePinnedMessage('prev')}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <img src={assets.ArrowUp} alt="previous" className="w-6 h-6" />
                </button>
                <span className="text-xs">
                  {currentPinnedIndex + 1}/{currentChatPinnedMessages.length}
                </span>
                <button
                  onClick={() => navigatePinnedMessage('next')}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <img src={assets.ArrowDown} alt="next" className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={(curr) => {
            messagesContainerRef.current = curr;
            if (curr && flattenedMessages.length > 0 && !isUserScrolling) {
              const isInitialLoad = !messagesContainerRef.current || messagesContainerRef.current.scrollTop === 0;
              if (isInitialLoad) {
                curr.scrollTop = curr.scrollHeight;
              }
            }
          }}
          className={`flex-1 overflow-y-auto p-4 relative transition-all duration-300 elegant-scrollbar`}
          style={{
            backgroundImage: `url(${chatBg})`,
            backgroundSize: "cover",
          }}
          onClick={() => {
            if (showEmojiPicker) setShowEmojiPicker(false);
          }}
        >
          {flattenedMessages.length > 0 ? (
            <>
              <DateSeparator timestamp={flattenedMessages[0]?.created_at} />
              {flattenedMessages.map((msg, idx, arr) => {
                // Ambil pesan sebelumnya
                const prevMsg = arr[idx - 1];
                
                // Cek apakah DateSeparator perlu ditampilkan
                // Kondisi: Ini adalah pesan pertama ATAU tanggal pesan ini berbeda dari pesan sebelumnya
                const showDateSeparator = !prevMsg || 
                  new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                return (
                  <React.Fragment key={msg.message_id}>
                    {/* Tampilkan DateSeparator jika kondisi terpenuhi */}
                    {showDateSeparator && <DateSeparator timestamp={msg.created_at} />}
                    
                    {/* Render komponen pesan seperti biasa */}
                    {renderMessage(msg, idx, arr)}
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          )}
        </div>

        {showScrollButton && !isSelectionMode && (
          <div className="absolute bottom-24 right-4 z-40">
            <button
              onClick={handleScrollButtonClick}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
              
            >
              <img src={assets.ArrowDownThin} alt="Scroll to bottom" className="w-6 h-6" />
            </button>
          </div>
        )}

        {replyingMessage && !isSelectionMode && canSendMessages && (
          <div className={`flex items-center justify-between bg-gray-100 px-3 py-2 border-l-4 border-[#bd2cfc] transition-all duration-300`}>
            <div>
              <p className="text-xs font-semibold text-[#bd2cfc]">
                {replyingMessage.sender || "Anda"}
              </p>
              <p className="text-xs text-gray-600 truncate w-48">
                {replyingMessage.message || replyingMessage.file?.name || "Gambar"}
              </p>
            </div>
            <button
              onClick={() => setReplyingMessage(null)}
              className="hover:opacity-80 transition"
            >
              <img src={assets.Cancel} alt="Cancel" className="w-6 h-6" />
            </button>
          </div>
        )}

        {editingMessage && !isSelectionMode && canSendMessages && (
        <div
            className={`flex items-center justify-between bg-[#4C0D68]/10 px-3 py-2 border-l-4 border-[#4C0D68] transition-all duration-300`}
        >
            <div>
            <p className="text-xs font-semibold text-[#4C0D68]">
                Editing Message
            </p>
            <p className="text-xs text-gray-600 truncate w-48">
                {contextMessages.find(msg => msg.id === editingMessage)?.message}
            </p>
            </div>
            <button
            onClick={handleCancelEdit}
            className="hover:opacity-80 transition"
            >
            <img src={assets.Cancel} alt="Cancel" className="w-6 h-6" />
            </button>
        </div>
        )}

        {canSendMessages && !isSelectionMode && (
          <div
            className={`relative p-3 flex items-center gap-2 border-t transition-all duration-300`}
            style={{ borderColor: "#bababa" }}
          >
            <div className="relative">
              <div
                className={`rounded-md p-1 cursor-pointer transition-colors ${
                  showEmojiPicker 
                    ? "bg-gray-200 border border-gray-300 hover:bg-gray-300" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <img
                  src={assets.Happy}
                  alt="emoji"
                  className={`w-6 h-6 ${showEmojiPicker ? 'opacity-60' : 'opacity-100'}`}
                />
              </div>

              {showEmojiPicker && (
                <div 
                  className="absolute bottom-10 left-0 z-50 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EmojiPicker onEmojiClick={(emojiData) => {
                    const textarea = inputRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const currentValue = editingMessage ? editText : message;
                      const newValue = currentValue.substring(0, start) + emojiData.emoji + currentValue.substring(end);
                      
                      if (editingMessage) {
                        setEditText(newValue);
                      } else {
                        setMessage(newValue);
                      }
                      
                      setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
                        textarea.focus();
                        autoResize(textarea);
                      }, 0);
                    } else {
                      if (editingMessage) {
                        setEditText(prev => prev + emojiData.emoji);
                      } else {
                        setMessage(prev => prev + emojiData.emoji);
                      }
                    }
                    setShowEmojiPicker(false);
                  }} />
                </div>
              )}
            </div>

            {!editingMessage && (
              <div 
                ref={fileButtonRef}
                className={`rounded-md p-1 cursor-pointer transition-colors ${
                  showFileUpload 
                    ? "bg-gray-200 border border-gray-300 hover:bg-gray-300" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setShowFileUpload(true)}
              >
                <img
                  src={assets.File}
                  alt="file"
                  className={`w-6 h-6 ${showFileUpload ? 'opacity-60' : 'opacity-100'}`}
                />
              </div>
            )}

            <div
              className="flex items-center flex-1 border rounded-2xl px-3 py-1"
              style={{ borderColor: "#4C0D68" }}
            >
              <textarea
                ref={inputRef}
                placeholder={editingMessage ? "Edit your message..." : "Write down the message"}
                value={editingMessage ? editText : message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows="1"
                className="flex-1 text-sm outline-none resize-none min-h-[24px] max-h-[120px] leading-6 py-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
                }}
              />
              
              <button 
                onClick={editingMessage ? handleSaveEdit : handleSend}
                disabled={editingMessage ? !editText.trim() : !message.trim()}
                className={`ml-2 p-1 rounded-full transition-all ${
                  (editingMessage ? !editText.trim() : !message.trim()) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-80 hover:bg-gray-100'
                }`}
                title={editingMessage ? "Simpan perubahan" : "Kirim pesan"}
              >
                <img
                  src={editingMessage ? assets.Check || assets.Send : assets.Send}
                  alt={editingMessage ? "simpan" : "kirim"}
                  className="w-6 h-6"
                />
              </button>
            </div>
          </div>
        )}

        {!canSendMessages && !isSelectionMode && customFooter && (
          <div>
            {customFooter}
          </div>
        )}
      </div>

      <FileUploadPopup
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSend={async (fileData) => {
//           const formData = new FormData();
          
//           if (fileData.caption) {
//             formData.append('content', fileData.caption);
//           } else if (fileData.type === 'file') {
//             formData.append('content', fileData.file.name);
//           } else {
//             formData.append('content', 'Image');
//           }
          
//           formData.append('file', fileData.file.file);
          
//           if (replyingMessage) {
//             formData.append('reply_to_message_id', replyingMessage.message_id);
//           }

//           const result = await sendMessage(actualChatId, formData);

          // 1. Siapkan objek data pesan.
          const messageData = {
            file: fileData.file.file, // File asli untuk diunggah.
            
            // 2. Logika 'content' yang sudah diperbaiki:
            // - Untuk dokumen, 'content' SELALU nama file.
            // - Untuk gambar, 'content' adalah caption jika ada, jika tidak, string kosong.
            content: fileData.caption.trim() || '',

            // 3. Tambahkan caption sebagai field terpisah jika API Anda mendukungnya nanti.
            // caption: fileData.caption.trim(), // (Opsional, untuk pengembangan di masa depan)

            reply_to_message_id: replyingMessage ? replyingMessage.message_id : null
          };

          // 4. Kirim data ke service.
          const result = await sendMessage(actualChatId, messageData);
          
          if (result.success) {
            setReplyingMessage(null);
            refetchMessages();
            setTimeout(scrollToBottom, 100);
          } else {
            console.error("Failed to upload file:", result.error);
            alert("Gagal mengirim file: " + (result.message || "Silakan coba lagi."));
          }
        }}
        fileButtonRef={fileButtonRef}
      />

      {showDeleteModal && (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] z-[9998]" />
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-200">
            {deleteBehavior === 'receiver-included' ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete message{isSelectionMode && selectedMessages.size > 1 ? 's' : ''}?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Deleting {isSelectionMode && selectedMessages.size > 1 ? 'messages have' : 'a message has'} no effect on your recipient's chat.
                  </p>
                </div>
                
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={handleFinalDelete}
                    className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity rounded-[5px]"
                    style={{ backgroundColor: "#FFB400" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : !showDeleteOptions ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete message{isSelectionMode && selectedMessages.size > 1 ? 's' : ''}?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You can delete {isSelectionMode && selectedMessages.size > 1 ? 'messages' : 'message'} for everyone or just for yourself.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleDeleteForMe}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm rounded-[5px]"
                    >
                      <div className="w-[20px] h-[20px] border-2 border-gray-400 rounded-full bg-transparent"></div>
                      <span>Delete for me</span>
                    </button>

                    <button
                      onClick={handleDeleteForEveryone}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm rounded-[5px]"
                    >
                      <div className="w-[20px] h-[20px] border-2 border-gray-400 rounded-full bg-transparent"></div>
                      <span>Delete for everyone</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleCancelDelete}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete message{isSelectionMode && selectedMessages.size > 1 ? 's' : ''}?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You can delete {isSelectionMode && selectedMessages.size > 1 ? 'messages' : 'message'} for everyone or just for yourself.
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="me"
                          checked={selectedDeleteOption === 'me'}
                          onChange={(e) => setSelectedDeleteOption(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedDeleteOption === 'me' 
                            ? 'border-[#FFB400]' 
                            : 'border-gray-300'
                        }`}>
                          {selectedDeleteOption === 'me' && (
                            <div className="w-2 h-2 rounded-full bg-[#FFB400]"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">Delete for me</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="everyone"
                          checked={selectedDeleteOption === 'everyone'}
                          onChange={(e) => setSelectedDeleteOption(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedDeleteOption === 'everyone' 
                            ? 'border-[#FFB400]' 
                            : 'border-gray-300'
                        }`}>
                          {selectedDeleteOption === 'everyone' && (
                            <div className="w-2 h-2 rounded-full bg-[#FFB400]"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">Delete for everyone</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={handleFinalDelete}
                    className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity rounded-[5px]"
                    style={{ backgroundColor: "#FFB400" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default BaseChatPage;