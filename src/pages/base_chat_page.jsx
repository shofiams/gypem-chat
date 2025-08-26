import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useChatContext } from "../api/use_chat_context";
import ChatBubblePeserta from "../components/ChatBubblePeserta";
import FileUploadPopup from "../components/FileUploadPopup";
import { assets } from "../assets/assets";
import groupPhoto from "../assets/admin-profile.png";
import chatBg from "../assets/chat-bg.png";
import EmojiPicker from "emoji-picker-react";

const DateSeparator = ({ children }) => (
  <div className="flex justify-center my-3">
    <span className="bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-500 rounded-[20px] shadow">
      {children}
    </span>
  </div>
);

// Helper function to determine time grouping properties
const getTimeGroupingProps = (currentMsg, currentIndex, allMessages) => {
  const nextMsg = allMessages[currentIndex + 1];
  const previousMsg = currentIndex > 0 ? allMessages[currentIndex - 1] : null;
  
  // Get sender information
  const currentSender = currentMsg.type === "sender" ? "You" : currentMsg.sender;
  const nextSender = nextMsg ? (nextMsg.type === "sender" ? "You" : nextMsg.sender) : null;
  const previousSender = previousMsg ? (previousMsg.type === "sender" ? "You" : previousMsg.sender) : null;
  
  // Get time information
  const currentTime = currentMsg.time;
  const nextTime = nextMsg ? nextMsg.time : null;
  const previousTime = previousMsg ? previousMsg.time : null;
  
  // Determine if this is the last message in a time group
  const isLastInTimeGroup = !nextMsg || 
    nextSender !== currentSender || 
    nextTime !== currentTime;
  
  // Determine if this is the first message in a time group
  const isFirstInTimeGroup = !previousMsg || 
    previousSender !== currentSender || 
    previousTime !== currentTime;
  
  // Determine if time should be shown
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

  const actualChatId = isEmbedded ? propChatId : paramChatId;
  
  // Use ChatContext
  const { 
    getChatById, 
    getChatMessages, 
    addMessage, 
    deleteMessage, 
    updateMessage,
    markChatAsRead,
    toggleStarMessage,
    isMessageStarred,
    togglePinMessage,
    isMessagePinned,
    getPinnedMessage,
  } = useChatContext();
  
  // Get chat info and messages from context
  const chatInfo = getChatById(actualChatId);
  const contextMessages = getChatMessages(actualChatId);
  const location = useLocation();

  // Updated state for multiple pinned messages
  const [replyingMessage, setReplyingMessage] = useState(null);
  // const [pinnedMessages, setPinnedMessages] = useState([]);
  const allPinnedMessages = getPinnedMessage();
  const currentChatPinnedMessages = allPinnedMessages.filter(pin => pin.chatId === parseInt(actualChatId));
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

  // Check if chatId is valid and mark as read
  useEffect(() => {
    if (!actualChatId) {
      if (!isEmbedded) {
        navigate('/chats', { replace: true });
      }
      return;
    }
    
    const currentChatInfo = getChatById(actualChatId);
    if (!currentChatInfo) {
      if (!isEmbedded) {
        navigate('/chats', { replace: true });
      } else if (onClose) {
        onClose();
      }
      return;
    }
    
    // Mark chat as read when opening
    markChatAsRead(actualChatId);
    
    // Instantly scroll to bottom when opening chat (no animation)
    setTimeout(() => {
      scrollToBottomInstant();
    }, 10);
  }, [actualChatId, isEmbedded]);

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

  // Scroll detection for floating button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show button if scrolled up more than 100px from bottom
      setShowScrollButton(scrollFromBottom > 100);
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

  // Auto-focus input when chat opens
  useEffect(() => {
    if (canSendMessages && !isSelectionMode && inputRef.current) {
      // Small delay to ensure component is fully rendered
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [actualChatId, canSendMessages, isSelectionMode]);

  // Function to check selected message types
  const getSelectedMessageTypes = () => {
    if (!isSelectionMode || selectedMessages.size === 0) return { hasReceiver: false, hasSender: false };
    
    let hasReceiver = false;
    let hasSender = false;
    
    selectedMessages.forEach(messageId => {
      const message = contextMessages.find(msg => msg.id === messageId);
      if (message) {
        if (message.type === 'receiver') {
          hasReceiver = true;
        } else if (message.type === 'sender') {
          hasSender = true;
        }
      }
    });
    
    return { hasReceiver, hasSender };
  };

  // Function to determine delete behavior based on selected messages
  const getDeleteBehavior = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      const { hasReceiver, hasSender } = getSelectedMessageTypes();
      
      // If only sender messages are selected
      if (hasSender && !hasReceiver) {
        return 'sender-only'; // Show delete options (for me/everyone)
      }
      // If receiver messages are selected (alone or mixed with sender)
      else if (hasReceiver) {
        return 'receiver-included'; // Show simple delete confirmation
      }
    } else if (messageToDelete) {
      // Single message delete
      const message = contextMessages.find(msg => msg.id === messageToDelete);
      return message?.type === 'sender' ? 'sender-only' : 'receiver-included';
    }
    
    return 'receiver-included'; // Default fallback
  };

  // New functions for handling multiple pins
  const handlePinMessage = (message) => {
    togglePinMessage(actualChatId, message.id);
  };

  const handleUnpinMessage = (messageId) => {
    togglePinMessage(actualChatId, messageId);
  };

  // Function to check if a message is pinned
  const checkIsMessagePinned = (messageId) => {
    return isMessagePinned(actualChatId, messageId);
  };

  // Function to navigate through pinned messages
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

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      type: "sender",
      sender: "Anda",
      message: message.trim(),
      time: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).replace(':', '.'),
      ...(replyingMessage && { reply: replyingMessage })
    };
    
    // Add to context instead of local state
    addMessage(actualChatId, newMessage);
    setMessage("");
    setReplyingMessage(null);
    setShowEmojiPicker(false);

    // Auto-scroll to bottom after adding message
    setTimeout(() => {
      scrollToBottom();
    }, 50);
  };

  // Handle edit message
  const handleEdit = (messageId) => {
    const messageToEdit = contextMessages.find(msg => msg.id === messageId);
    if (messageToEdit && messageToEdit.message) {
      setEditingMessage(messageId);
      setEditText(messageToEdit.message);
    }
  };

  // Save edited message
  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    
    // Update message in context instead of local state
    updateMessage(actualChatId, editingMessage, {
      message: editText.trim(),
      isEdited: true
    });
    
    setEditingMessage(null);
    setEditText("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Selection mode handlers
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
      
      // If no messages selected, exit selection mode
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      
      return newSet;
    });
  };

  // Search function
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

  // Navigation functions for search results
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

  // Updated delete functions with conditional behavior
  const handleDeleteRequest = (messageId) => {
    if (isSelectionMode) {
      // In selection mode, toggle selection instead of delete
      handleToggleSelection(messageId);
      return;
    }
    
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      // Delete selected messages from context
      selectedMessages.forEach(msgId => {
        deleteMessage(actualChatId, msgId);
        
        // Remove from pinned messages if it was pinned
        if (isMessagePinned(msgId)) {
          handleUnpinMessage(msgId);
        }
      });
      
      // Exit selection mode
      setIsSelectionMode(false);
      setSelectedMessages(new Set());
    } else if (messageToDelete) {
      // Delete single message from context
      deleteMessage(actualChatId, messageToDelete);
      
      // Remove from pinned messages if it was pinned
      if (isMessagePinned(messageToDelete)) {
        handleUnpinMessage(messageToDelete);
      }
    }
    
    setShowDeleteModal(false);
    setShowDeleteOptions(false);
    setMessageToDelete(null);
    setSelectedDeleteOption('me');
  };

  const handleDeleteForMe = () => {
    setSelectedDeleteOption('me');
    setShowDeleteOptions(true);
  };

  const handleDeleteForEveryone = () => {
    setSelectedDeleteOption('everyone');
    setShowDeleteOptions(true);
  };

  const handleFinalDelete = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      // Handle multiple selected messages
      if (selectedDeleteOption === 'everyone') {
        // Update messages to show as deleted
        selectedMessages.forEach(msgId => {
          updateMessage(actualChatId, msgId, {
            message: "You delete this message", 
            isDeleted: true,
            image: null,
            file: null,
            reply: null
          });
          
          // Remove from pinned messages if it was pinned
          if (isMessagePinned(msgId)) {
            handleUnpinMessage(msgId);
          }
        });
      } else {
        // Delete messages completely
        selectedMessages.forEach(msgId => {
          deleteMessage(actualChatId, msgId);
          
          // Remove from pinned messages if it was pinned
          if (isMessagePinned(msgId)) {
            handleUnpinMessage(msgId);
          }
        });
      }
      
      setIsSelectionMode(false);
      setSelectedMessages(new Set());
    } else if (messageToDelete) {
      if (selectedDeleteOption === 'everyone') {
        // Update message to show as deleted
        updateMessage(actualChatId, messageToDelete, {
          message: "You delete this message", 
          isDeleted: true,
          image: null,
          file: null,
          reply: null
        });
        
        // Remove from pinned messages if it was pinned
        if (isMessagePinned(messageToDelete)) {
          handleUnpinMessage(messageToDelete);
        }
      } else {
        // Delete message completely
        deleteMessage(actualChatId, messageToDelete);
        
        // Remove from pinned messages if it was pinned
        if (isMessagePinned(messageToDelete)) {
          handleUnpinMessage(messageToDelete);
        }
      }
    }
    
    setShowDeleteModal(false);
    setShowDeleteOptions(false);
    setMessageToDelete(null);
    setSelectedDeleteOption('me');
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowDeleteOptions(false);
    setMessageToDelete(null);
    setSelectedDeleteOption('me');
  };

  // Function to determine if sender name should be shown in bubble
  const shouldShowSenderNameInBubble = (message, index) => {
    if (!showSenderNames) return false;
    const prevMessage = index > 0 ? contextMessages[index - 1] : null;
    return !prevMessage || prevMessage.sender !== message.sender;
  };

  // Render message function with group chat support
  const renderMessage = (msg, idx, arr) => {
    const nextMsg = arr[idx + 1];
    const isLastFromSender = !nextMsg || nextMsg.type !== msg.type || (isGroupChat && nextMsg.sender !== msg.sender);
    const isLastFromReceiver = !nextMsg || nextMsg.type !== msg.type || (isGroupChat && nextMsg.sender !== msg.sender);
    const showSenderNameInBubble = shouldShowSenderNameInBubble(msg, idx);
    
    // Get time grouping properties
    const timeGroupingProps = getTimeGroupingProps(msg, idx, arr);

    return (
      <div key={msg.id} className="mb-2">
        {/* Show sender name outside bubble for group chat if not shown inside */}
        {isGroupChat && showSenderNames && !showSenderNameInBubble && (
          <div>
            <span
              className="text-sm font-semibold"
              style={{ color: getSenderColor ? getSenderColor(msg.sender) : '#4C0D68' }}
            >
              {msg.sender}
            </span>
          </div>
        )}

        <div
          ref={(el) => (messageRefs.current[msg.id] = el)}
          className={`relative ${highlightedMessageId === msg.id ? "" : ""}`}
        >
          {highlightedMessageId === msg.id && (
            <div 
              className="absolute inset-0 bg-yellow-200 rounded-lg pointer-events-none z-0 opacity-70"
              style={{
                margin: '-2px',
                padding: '2px',
              }}
            />
          )}
          <div className="z-10">
            <ChatBubblePeserta
              {...msg}
              isLastFromSender={isLastFromSender}
              isLastFromReceiver={isLastFromReceiver}
              onCopy={() => {}}
              onReply={canSendMessages ? () => setReplyingMessage(msg) : null}
              onPin={() => handlePinMessage(msg)}
              onUnpin={() => handleUnpinMessage(msg.id)}
              isPinned={checkIsMessagePinned(msg.id)}
              onDelete={() => handleDeleteRequest(msg.id, msg.type)}
              onEdit={canSendMessages ? () => handleEdit(msg.id) : null} 
              isEdited={msg.isEdited}
              isDeleted={msg.isDeleted}
              isSelectionMode={isSelectionMode}
              isSelected={selectedMessages.has(msg.id)}
              onStartSelection={() => handleStartSelection(msg.id)}
              onToggleSelection={() => handleToggleSelection(msg.id)}
              onStar={() => toggleStarMessage && toggleStarMessage(actualChatId, msg.id)}
              onUnstar={() => toggleStarMessage && toggleStarMessage(actualChatId, msg.id)}
              isStarred={isMessageStarred && isMessageStarred(actualChatId, msg.id)}
              searchQuery={searchQuery}
              highlightSearchTerm={highlightSearchTerm}
              // Group chat specific props
              showSenderName={showSenderNameInBubble}
              sender={msg.sender}
              getSenderColor={getSenderColor}
              isGroupChat={isGroupChat}
              {...timeGroupingProps}
              isLastBubble={idx === arr.length - 1}
              // Custom props from parent
              {...customChatBubbleProps}
            />
          </div>
        </div>
      </div>
    );
  };


  // Default header component
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
          src={chatInfo?.avatar || groupPhoto}
          alt="profile"
          className="w-10 h-10 rounded-full"
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
        {isGroupChat && chatInfo?.members ? (
          <div className="text-xs text-gray-500 leading-4">
            <span className="truncate block">
              {chatInfo.members.length > 3 
                ? `${chatInfo.members.slice(0, 3).join(', ')}...` 
                : chatInfo.members.join(', ')
              }
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">{chatInfo?.isOnline ? 'Online' : 'Offline'}</p>
        )}
      </div>

      {/* Search Section */}
      <button 
        data-search-button
        onClick={() => setShowSearchResults(!showSearchResults)}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition"
      >
        <img src={assets.Search} alt="Search" className="w-5 h-5" />
      </button>
    </div>
  );

  // Get delete behavior for current selection
  const deleteBehavior = getDeleteBehavior();

  return (
    <div className="flex flex-col h-full overflow-hidden border-l-[1px]">
      {/* Header - use custom or default */}
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

      {/* Floating Search Bar */}
      {showSearchResults && !isSelectionMode && (
        <div className="absolute top-[66px] right-0 z-50 w-3/5 max-w-md">
          <div className="bg-[#f4f0f0] bg-opacity-80 rounded-bl-xl shadow-lg border overflow-hidden" style={{ borderColor: '#4C0D68' }}>
            {/* Search Input Header */}
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
                
                {/* Results counter inside search input */}
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded border pointer-events-none">
                    {searchResults.length > 0 
                      ? `${currentSearchIndex + 1} of ${searchResults.length}`
                      : "Not Found"
                    }
                  </div>
                )}
              </div>
              
              {/* Navigation buttons */}
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

      {/* Enhanced Pinned Message Section */}
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
              onClick={() => {
                const currentPin = currentChatPinnedMessages[currentPinnedIndex];
                if (messageRefs.current[currentPin.messageId]) {
                  messageRefs.current[currentPin.messageId].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  setHighlightedMessageId(currentPin.messageId);
                  setTimeout(() => setHighlightedMessageId(null), 1500);
                }
              }}
            >
              <p className="text-xs font-semibold">
                {currentChatPinnedMessages[currentPinnedIndex]?.sender}
              </p>
              <p className="text-xs truncate max-w-xs">
                {currentChatPinnedMessages[currentPinnedIndex]?.message || "Media"}
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={(curr) => {
            messagesContainerRef.current = curr;
            if (curr && contextMessages.length > 0) {
              curr.scrollTop = curr.scrollHeight;
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
          {contextMessages.length > 0 ? (
            <>
              <DateSeparator>Today</DateSeparator>
              {contextMessages.map((msg, idx, arr) => renderMessage(msg, idx, arr))}
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

        {/* Floating Scroll to Bottom Button */}
        {showScrollButton && !isSelectionMode && (
          <div className="absolute bottom-24 right-4 z-40">
            <button
              onClick={scrollToBottom}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
              
            >
              <img src={assets.ArrowDownThin} alt="Scroll to bottom" className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Reply Preview */}
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

        {/* Edit Preview */}
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

        {/* Input Section - hide if can't send messages or in selection mode */}
        {canSendMessages && !isSelectionMode && (
          <div
            className={`relative p-3 flex items-center gap-2 border-t transition-all duration-300`}
            style={{ borderColor: "#bababa" }}
          >
            {/* Emoji and File buttons */}
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
                    setMessage((prev) => prev + emojiData.emoji);
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

            {/* Message Input */}
            <div
              className="flex items-center flex-1 border rounded-full px-3 py-1"
              style={{ borderColor: "#4C0D68" }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={editingMessage ? "Edit your message..." : "write down the message"}
                value={editingMessage ? editText : message}
                onChange={(e) => {
                  if (editingMessage) {
                    setEditText(e.target.value);
                  } else {
                    setMessage(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingMessage) {
                      handleSaveEdit();
                    } else {
                      handleSend();
                      setShowEmojiPicker(false);
                    }
                  }
                }}
                className="flex-1 text-sm outline-none"
              />
              <button 
                onClick={editingMessage ? handleSaveEdit : handleSend}
                disabled={editingMessage ? !editText.trim() : !message.trim()}
                className={`transition-opacity ${
                  (editingMessage ? !editText.trim() : !message.trim()) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-80'
                }`}
              >
                <img
                  src={editingMessage ? assets.Check || assets.Send : assets.Send}
                  alt={editingMessage ? "save" : "send"}
                  className="w-6 h-6 cursor-pointer"
                />
              </button>
            </div>
          </div>
        )}

        {/* Custom Footer */}
        {customFooter && (
        <div>
            {customFooter}
        </div>
        )} 
      </div>

      {/* File Upload Popup */}
      <FileUploadPopup
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSend={(fileData) => {
          const newMessage = {
            type: "sender",
            sender: "Anda",
            time: new Date().toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }).replace(':', '.'),
            ...(replyingMessage && { reply: replyingMessage })
          };

          if (fileData.type === 'image') {
            newMessage.image = fileData.file.preview;
            if (fileData.caption) newMessage.message = fileData.caption;
          } else {
            newMessage.file = {
              name: fileData.file.name,
              size: fileData.file.size,
              url: URL.createObjectURL(fileData.file.file)
            };
            if (fileData.caption) newMessage.message = fileData.caption;
          }

          addMessage(actualChatId, newMessage);
          setReplyingMessage(null);
        }}
        fileButtonRef={fileButtonRef}
      />

      {/* Updated Delete Modal with conditional behavior */}
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
                    onClick={handleConfirmDelete}
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