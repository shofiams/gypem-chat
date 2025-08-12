import React, { useState, useRef } from "react";
import ChatBubblePeserta from "../components/ChatBubblePeserta";
import FileUploadPopup from "../components/FileUploadPopup";
import { assets } from "../assets/assets";
import groupPhoto from "../assets/admin-profile.png";
import chatBg from "../assets/chat-bg.png";
import Gambar from "../assets/gambar1.jpg";
import EmojiPicker from "emoji-picker-react";

const DateSeparator = ({ children }) => (
  <div className="flex justify-center my-3">
    <span className="bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-500 rounded-[20px] shadow">
      {children}
    </span>
  </div>
);

const PesertaChatPage = () => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedDeleteOption, setSelectedDeleteOption] = useState('me');
  const messageRefs = useRef({});
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // File upload states
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileButtonRef = useRef(null); // ✅ NEW: Ref for file button

  // Selection mode states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  const [messages, setMessages] = useState([
    { id: 1, type: "receiver", sender: "Admin", message: "Admin message", time: "16.01" },
    { id: 2, type: "sender", sender: "Anda", message: "User message", time: "16.01" },
    { id: 3, type: "sender", sender: "Anda", message: "User message", time: "16.01" },
    { id: 4, type: "receiver", sender: "Admin", message: "Admin message", time: "16.01" },
    {
      id: 5,
      type: "receiver",
      sender: "Admin",
      message: "Thank you",
      time: "16.01",
      reply: { sender: "Anda", message: "User message" },
    },
    { id: 6, type: "sender", sender: "Anda", message: "User message", time: "16.01" },
    { id: 7, type: "receiver", sender: "Admin", image: Gambar, time: "16.01" },
    {
      id: 8,
      type: "sender",
      sender: "Anda",
      file: {
        name: "Document.pdf",
        size: "2 MB",
        url: "/path/to/document.pdf"
      },
      time: "16.05"
    }
  ]);

  const handleCopy = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 5000);
  };

  const handleReply = (message) => {
    setReplyingMessage(message);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
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
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setReplyingMessage(null);
    setShowEmojiPicker(false); // Close emoji picker when sending message
  };

  // Handle file upload send
  const handleFileSend = ({ file, type, caption }) => {
    const newMessage = {
      id: messages.length + 1,
      type: "sender",
      sender: "Anda",
      time: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).replace(':', '.'),
      ...(replyingMessage && { reply: replyingMessage })
    };

    if (type === 'image') {
      newMessage.image = file.preview;
      if (caption) newMessage.message = caption;
    } else {
      newMessage.file = {
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file.file)
      };
      if (caption) newMessage.message = caption;
    }

    setMessages(prev => [...prev, newMessage]);
    setReplyingMessage(null);
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Close emoji picker after selecting
  };

  const handlePin = (msg, id) => {
    setPinnedMessage({ ...msg, id });
  };

  const handleUnpin = () => {
    setPinnedMessage(null);
    setHighlightedMessageId(null);
  };

  const scrollToPinnedMessage = () => {
    if (pinnedMessage && messageRefs.current[pinnedMessage.id]) {
      messageRefs.current[pinnedMessage.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightedMessageId(pinnedMessage.id);

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
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

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const handleDeleteSelected = () => {
    // Determine delete type based on selected messages
    const selectedMessageData = messages.filter(msg => selectedMessages.has(msg.id));
    const hasSender = selectedMessageData.some(msg => msg.type === 'sender');
    const hasReceiver = selectedMessageData.some(msg => msg.type === 'receiver');
    
    if (hasSender && !hasReceiver) {
      // Only sender messages selected - show delete options
      setDeleteType('sender');
      setShowDeleteModal(true);
    } else {
      // Only receiver messages or mixed - direct delete
      setDeleteType('receiver');
      setShowDeleteModal(true);
    }
  };

  // Update delete functions to handle multiple messages
  const handleDeleteRequest = (messageId, messageType) => {
    if (isSelectionMode) {
      // In selection mode, toggle selection instead of delete
      handleToggleSelection(messageId);
      return;
    }
    
    // Original single delete logic
    setMessageToDelete(messageId);
    setDeleteType(messageType);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      // Delete selected messages
      setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      
      // Check if any deleted message was pinned
      if (pinnedMessage && selectedMessages.has(pinnedMessage.id)) {
        setPinnedMessage(null);
        setHighlightedMessageId(null);
      }
      
      // Exit selection mode
      setIsSelectionMode(false);
      setSelectedMessages(new Set());
    } else if (messageToDelete) {
      // Original single delete logic
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      
      if (pinnedMessage?.id === messageToDelete) {
        setPinnedMessage(null);
        setHighlightedMessageId(null);
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
        setMessages(prev => prev.map(msg => 
          selectedMessages.has(msg.id)
            ? { 
                ...msg, 
                message: "You delete this message", 
                isDeleted: true,
                image: null,
                file: null,
                reply: null
              }
            : msg
        ));
      } else {
        setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      }
      
      // Check pinned message
      if (pinnedMessage && selectedMessages.has(pinnedMessage.id)) {
        setPinnedMessage(null);
        setHighlightedMessageId(null);
      }
      
      // Exit selection mode
      setIsSelectionMode(false);
      setSelectedMessages(new Set());
    } else if (messageToDelete) {
      // Original single delete logic
      if (selectedDeleteOption === 'everyone') {
        setMessages(prev => prev.map(msg => 
          msg.id === messageToDelete 
            ? { 
                ...msg, 
                message: "You delete this message", 
                isDeleted: true,
                image: null,
                file: null,
                reply: null
              }
            : msg
        ));
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      }
      
      if (pinnedMessage?.id === messageToDelete) {
        setPinnedMessage(null);
        setHighlightedMessageId(null);
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

  return (
    <div className="flex flex-col h-screen border rounded-lg overflow-hidden">
      {/* Header - conditionally show selection header or normal header */}
      {isSelectionMode ? (
        // Selection Mode Header
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">{selectedMessages.size} Selected</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedMessages.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <img src={assets.Trash} alt="Delete" className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleCancelSelection}
              className="px- py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
              style={{ fontSize: "16px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Normal Header
        <div className="flex items-center gap-3 p-3 border-b">
          <div className="relative">
            <img
              src={groupPhoto}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <span
              className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full"
              style={{ backgroundColor: "#FFB400" }}
            ></span>
          </div>
          <div>
            <p className="font-semibold text-sm">Admin WIB</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition ml-auto"
          >
            <img src={assets.Search} alt="Search" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Pinned Message - hide in selection mode */}
      {pinnedMessage && !isSelectionMode && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer"
          style={{ backgroundColor: "#4C0D68" }}
        >
          <div
            className="flex items-center gap-2 flex-1 text-white"
            onClick={scrollToPinnedMessage}
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded">
              <img src={assets.PinFill} alt="pinned" className="w-3 h-3" />
            </div>
            <div>
              <p className="text-xs font-semibold">
                {pinnedMessage?.type === "sender" ? "You" : pinnedMessage?.sender}
              </p>
              <p className="text-xs truncate max-w-xs">
                {pinnedMessage?.message || pinnedMessage?.file?.name || "Gambar"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
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
        {/* Group 1 */}
        <DateSeparator>16 Juni 2025</DateSeparator>
        {messages.slice(0, 4).map((msg, idx, arr) => {
          const nextMsg = arr[idx + 1];
          const isLastFromSender = !nextMsg || nextMsg.type !== msg.type;
          const isLastFromReceiver = !nextMsg || nextMsg.type !== msg.type;

          return (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={highlightedMessageId === msg.id ? "animate-pulse bg-yellow-200 rounded-lg p-1 transition" : ""}
            >
              <ChatBubblePeserta
                {...msg}
                isLastFromSender={isLastFromSender}
                isLastFromReceiver={isLastFromReceiver}
                hideTime={!isLastFromSender}
                onCopy={handleCopy}
                onReply={() => handleReply(msg)}
                onPin={() => handlePin(msg, msg.id)}
                onUnpin={handleUnpin}
                onDelete={() => handleDeleteRequest(msg.id, msg.type)}
                isPinned={pinnedMessage?.id === msg.id}
                isDeleted={msg.isDeleted}
                // Selection mode props
                isSelectionMode={isSelectionMode}
                isSelected={selectedMessages.has(msg.id)}
                onStartSelection={() => handleStartSelection(msg.id)}
                onToggleSelection={() => handleToggleSelection(msg.id)}
              />
            </div>
          );
        })}

        {/* Group 2 */}
        <DateSeparator>Today</DateSeparator>
        {messages.slice(4).map((msg, idx, arr) => {
          const nextMsg = arr[idx + 1];
          const isLastFromSender = !nextMsg || nextMsg.type !== msg.type;
          const isLastFromReceiver = !nextMsg || nextMsg.type !== msg.type;

          return (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={highlightedMessageId === msg.id ? "animate-pulse bg-yellow-200 rounded-lg p-1 transition" : ""}
            >
              <ChatBubblePeserta
                {...msg}
                isLastFromSender={isLastFromSender}
                isLastFromReceiver={isLastFromReceiver}
                hideTime={!isLastFromSender}
                onCopy={handleCopy}
                onReply={() => handleReply(msg)}
                onPin={() => handlePin(msg, msg.id)}
                onUnpin={handleUnpin}
                onDelete={() => handleDeleteRequest(msg.id, msg.type)}
                isPinned={pinnedMessage?.id === msg.id}
                isDeleted={msg.isDeleted}
                // Selection mode props
                isSelectionMode={isSelectionMode}
                isSelected={selectedMessages.has(msg.id)}
                onStartSelection={() => handleStartSelection(msg.id)}
                onToggleSelection={() => handleToggleSelection(msg.id)}
              />
            </div>
          );
        })}

        {/* Copy Notification */}
        {showCopiedMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#4C0D68] text-white px-4 py-2 rounded-[20px] text-sm shadow-lg">
            Pesan disalin
          </div>
        )}
      </div>

      {/* Reply Preview - hide in selection mode */}
      {replyingMessage && !isSelectionMode && (
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

      {/* Input - hide in selection mode */}
      {!isSelectionMode && (
        <div
          className={`relative p-3 flex items-center gap-2 border-t transition-all duration-300 ${
            showDeleteModal ? 'blur-sm' : ''
          }`}
          style={{ borderColor: "#4C0D68" }}
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
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside picker
              >
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          {/* File button - conditional wrapper based on showFileUpload */}
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

          <div
            className="flex items-center flex-1 border rounded-full px-3 py-1"
            style={{ borderColor: "#4C0D68" }}
          >
            <input
              type="text"
              placeholder="write down the message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                  setShowEmojiPicker(false); // Close emoji picker when pressing enter
                }
              }}
              className="flex-1 text-sm outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={!message.trim()}
              className={`transition-opacity ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
              <img
                src={assets.Send}
                alt="send"
                className="w-6 h-6 cursor-pointer"
              />
            </button>
          </div>
        </div>
      )}

      {/* File Upload Popup with fileButtonRef */}
      <FileUploadPopup
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSend={handleFileSend}
        fileButtonRef={fileButtonRef}
      />

      {/* Delete Confirmation Modal - updated for multiple messages */}
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

export default PesertaChatPage;