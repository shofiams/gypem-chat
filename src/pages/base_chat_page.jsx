import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  customChatBubbleProps = {}
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
    markChatAsRead 
  } = useChatContext();
  
  // Get chat info and messages from context
  const chatInfo = getChatById(actualChatId);
  const contextMessages = getChatMessages(actualChatId);

  // Updated state for multiple pinned messages
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]); // Changed from single to array
  const [currentPinnedMessage, setCurrentPinnedMessage] = useState(null); // Currently displayed pinned message
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedDeleteOption, setSelectedDeleteOption] = useState('me');
  const messageRefs = useRef({});
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileButtonRef = useRef(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [messages, setMessages] = useState(contextMessages);

  // Update messages when context messages change
  useEffect(() => {
    setMessages(contextMessages);
  }, [contextMessages]);

  // Check if chatId is valid and mark as read
  useEffect(() => {
    if (!actualChatId) return;
    
    const currentChatInfo = getChatById(actualChatId);
    if (!currentChatInfo) {
      if (!isEmbedded) {
        navigate('/chats');
      }
      return;
    }
    
    // Mark chat as read when opening
    markChatAsRead(actualChatId);
  }, [actualChatId, isEmbedded]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      
      // If we're in embedded mode and switched to desktop, ensure proper state
      if (isEmbedded && !isMobile) {
        // Force re-render to update button visibility
        setMessages(prev => [...prev]);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isEmbedded]);

  // New functions for handling multiple pins
  const handlePinMessage = (message) => {
    const messageWithId = { ...message, id: message.id };
    
    // Check if message is already pinned
    const isAlreadyPinned = pinnedMessages.some(pin => pin.id === message.id);
    
    if (!isAlreadyPinned) {
      const newPinnedMessages = [...pinnedMessages, messageWithId];
      setPinnedMessages(newPinnedMessages);
      // Set the newly pinned message as current
      setCurrentPinnedMessage(messageWithId);
    }
  };

  const handleUnpinMessage = (messageId) => {
    const updatedPinnedMessages = pinnedMessages.filter(pin => pin.id !== messageId);
    setPinnedMessages(updatedPinnedMessages);
    
    // If the unpinned message was currently displayed, show the previous one
    if (currentPinnedMessage?.id === messageId) {
      if (updatedPinnedMessages.length > 0) {
        // Show the most recent pinned message (last in array)
        setCurrentPinnedMessage(updatedPinnedMessages[updatedPinnedMessages.length - 1]);
      } else {
        setCurrentPinnedMessage(null);
      }
    }
  };

  // Function to check if a message is pinned
  const isMessagePinned = (messageId) => {
    return pinnedMessages.some(pin => pin.id === messageId);
  };

  // Function to navigate through pinned messages
  const navigatePinnedMessage = (direction) => {
    if (pinnedMessages.length <= 1) return;
    
    const currentIndex = pinnedMessages.findIndex(pin => pin.id === currentPinnedMessage?.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= pinnedMessages.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? pinnedMessages.length - 1 : currentIndex - 1;
    }
    
    setCurrentPinnedMessage(pinnedMessages[newIndex]);
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
  };

  // Handle edit message
  const handleEdit = (messageId) => {
    const messageToEdit = messages.find(msg => msg.id === messageId);
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

  // Update delete functions to handle multiple messages and pinned messages
  const handleDeleteRequest = (messageId, messageType) => {
    if (isSelectionMode) {
      // In selection mode, toggle selection instead of delete
      handleToggleSelection(messageId);
      return;
    }
    
    setMessageToDelete(messageId);
    setDeleteType(messageType);
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
    setDeleteType(null);
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
    setDeleteType(null);
    setSelectedDeleteOption('me');
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowDeleteOptions(false);
    setMessageToDelete(null);
    setDeleteType(null);
    setSelectedDeleteOption('me');
  };

  // Function to determine if sender name should be shown in bubble
  const shouldShowSenderNameInBubble = (message, index) => {
    if (!showSenderNames) return false;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    return !prevMessage || prevMessage.sender !== message.sender;
  };

  // Render message function with group chat support
  const renderMessage = (msg, idx, arr) => {
    const nextMsg = arr[idx + 1];
    const isLastFromSender = !nextMsg || nextMsg.type !== msg.type || (isGroupChat && nextMsg.sender !== msg.sender);
    const isLastFromReceiver = !nextMsg || nextMsg.type !== msg.type || (isGroupChat && nextMsg.sender !== msg.sender);
    const showSenderNameInBubble = shouldShowSenderNameInBubble(msg, idx);

    return (
      <div key={msg.id} className="mb-4">
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
          className={highlightedMessageId === msg.id ? "animate-pulse bg-yellow-200 rounded-lg p-1 transition" : ""}
        >
          <ChatBubblePeserta
            {...msg}
            isLastFromSender={isLastFromSender}
            isLastFromReceiver={isLastFromReceiver}
            hideTime={!isLastFromSender}
            onCopy={() => {}}
            onReply={canSendMessages ? () => setReplyingMessage(msg) : null}
            onPin={() => handlePinMessage(msg)}
            onUnpin={() => handleUnpinMessage(msg.id)}
            onDelete={() => handleDeleteRequest(msg.id, msg.type)}
            onEdit={canSendMessages ? () => handleEdit(msg.id) : null} 
            isEdited={msg.isEdited}
            isPinned={isMessagePinned(msg.id)}
            isDeleted={msg.isDeleted}
            isSelectionMode={isSelectionMode}
            isSelected={selectedMessages.has(msg.id)}
            onStartSelection={() => handleStartSelection(msg.id)}
            onToggleSelection={() => handleToggleSelection(msg.id)}
            // Group chat specific props
            showSenderName={showSenderNameInBubble}
            sender={msg.sender}
            getSenderColor={getSenderColor}
            isGroupChat={isGroupChat}
            // Custom props from parent
            {...customChatBubbleProps}
          />
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
          src={chatInfo.avatar || groupPhoto}
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        {chatInfo.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full"
            style={{ backgroundColor: "#FFB400" }}
          ></span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{chatInfo.name}</p>
        {isGroupChat && chatInfo.members ? (
          <div className="text-xs text-gray-500 leading-4">
            <span>{chatInfo.members.join(', ')}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">{chatInfo.isOnline ? 'Online' : 'Offline'}</p>
        )}
      </div>
      <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition">
        <img src={assets.Search} alt="Search" className="w-5 h-5" />
      </button>
    </div>
  );

  if (!chatInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Chat not found</p>
          <button 
            onClick={() => navigate('/chats')}
            className="mt-2 px-4 py-2 bg-[#4C0D68] text-white rounded"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      {/* Enhanced Pinned Message Section */}
      {currentPinnedMessage && !isSelectionMode && (
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
                if (messageRefs.current[currentPinnedMessage.id]) {
                  messageRefs.current[currentPinnedMessage.id].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  setHighlightedMessageId(currentPinnedMessage.id);
                  setTimeout(() => setHighlightedMessageId(null), 2000);
                }
              }}
            >
              <p className="text-xs font-semibold">
                {currentPinnedMessage?.type === "sender" ? "You" : currentPinnedMessage?.sender}
              </p>
              <p className="text-xs truncate max-w-xs">
                {currentPinnedMessage?.message || currentPinnedMessage?.file?.name || "Gambar"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className={`flex-1 overflow-y-auto p-4 relative transition-all duration-300 ${
            showDeleteModal ? 'blur-sm' : ''
          }`}
          style={{
            backgroundImage: `url(${chatBg})`,
            backgroundSize: "cover",
          }}
          onClick={() => {
            if (showEmojiPicker) setShowEmojiPicker(false);
          }}
        >
          {messages.length > 0 ? (
            <>
              <DateSeparator>Today</DateSeparator>
              {messages.map((msg, idx, arr) => renderMessage(msg, idx, arr))}
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

        {/* Reply Preview */}
        {replyingMessage && !isSelectionMode && canSendMessages && (
          <div className={`flex items-center justify-between bg-gray-100 px-3 py-2 border-l-4 border-[#4C0D68] transition-all duration-300 ${
            showDeleteModal ? 'blur-sm' : ''
          }`}>
            <div>
              <p className="text-xs font-semibold text-[#4C0D68]">
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
            className={`flex items-center justify-between bg-[#4C0D68]/10 px-3 py-2 border-l-4 border-[#4C0D68] transition-all duration-300 ${
            showDeleteModal ? 'blur-sm' : ''
            }`}
        >
            <div>
            <p className="text-xs font-semibold text-[#4C0D68]">
                Editing Message
            </p>
            <p className="text-xs text-gray-600 truncate w-48">
                {messages.find(msg => msg.id === editingMessage)?.message}
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
            className={`relative p-3 flex items-center gap-2 border-t transition-all duration-300 ${
              showDeleteModal ? 'blur-sm' : ''
            }`}
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
                onKeyPress={(e) => {
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

        {/* Read-only footer untuk yang tidak bisa kirim pesan */}
        {!canSendMessages && !customFooter && (
        <div
            className="text-center text-white text-sm py-4 font-medium"
            style={{ backgroundColor: "#4C0D68" }}
        >
            Only admins can send messages.
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

      {/* Delete Modal - same as existing */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-200">
            {deleteType === 'receiver' ? (
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
      )}
    </div>
  );
};

export default BaseChatPage;