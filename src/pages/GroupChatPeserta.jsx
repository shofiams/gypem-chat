import React, { useState } from "react";
import { assets } from "../assets/assets";
import ChatBubblePeserta from "../components/ChatBubblePeserta.jsx";

// ✅ Pastikan path ini sesuai lokasi file sebenarnya
import chatBgImage from "../assets/chat-bg.png";
import groupPhotoImage from "../assets/foto-profil.png";

const GroupChatPeserta = () => {
  const [messages, setMessages] = useState([
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
  ]);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleStartSelection = (messageId) => {
    setIsSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const handleToggleSelection = (messageId) => {
    const newSelected = new Set(selectedMessages);
    newSelected.has(messageId) ? newSelected.delete(messageId) : newSelected.add(messageId);
    setSelectedMessages(newSelected);

    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (isSelectionMode && selectedMessages.size > 0) {
      // Delete multiple messages
      setMessages(messages.filter((msg) => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
    } else if (messageToDelete) {
      // Delete single message
      setMessages(messages.filter((msg) => msg.id !== messageToDelete));
    }
    
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const handleDeleteSelected = () => {
    setShowDeleteModal(true);
    setMessageToDelete(null);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const handleStarMessage = (messageId) => {
    console.log("Star message:", messageId);
  };

  const getSenderColor = (sender) => {
    const colors = {
      "Admin A": "#4169E1",
      "Admin B": "#32CD32",
      "Pimpinan A": "#FF1493",
    };
    return colors[sender] || "#4C0D68";
  };

  // ✅ UPDATED: Function to check if should show sender name in bubble
  const shouldShowSenderNameInBubble = (message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    // Show sender name in bubble if:
    // 1. It's the first message OR
    // 2. Previous message is from different sender
    return !prevMessage || prevMessage.sender !== message.sender;
  };

  const renderMessage = (message, index) => {
    const isLastBubble = index === messages.length - 1;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    const isLastFromSender = !nextMessage || nextMessage.sender !== message.sender;
    const isLastFromReceiver = !nextMessage || nextMessage.sender !== message.sender;
    
    // ✅ NEW: Determine if sender name should be shown in bubble
    const showSenderNameInBubble = shouldShowSenderNameInBubble(message, index);

    return (
      <div key={message.id} className="mb-4">
        {/* ✅ UPDATED: Kondisional tampilkan nama pengirim di luar bubble 
            Hanya tampil jika nama pengirim TIDAK ditampilkan di dalam bubble */}
        {(!prevMessage || prevMessage.sender !== message.sender) && !showSenderNameInBubble && (
          <div>
            <span
              className="text-sm font-semibold"
              style={{ color: getSenderColor(message.sender) }}
            >
              {message.sender}
            </span>
          </div>
        )}

        <ChatBubblePeserta
          type={message.type}
          message={message.message}
          time={message.time}
          reply={message.reply}
          isLastFromSender={isLastFromSender}
          isLastFromReceiver={isLastFromReceiver}
          isLastBubble={isLastBubble}
          isSelectionMode={isSelectionMode}
          isSelected={selectedMessages.has(message.id)}
          onStartSelection={() => handleStartSelection(message.id)}
          onToggleSelection={() => handleToggleSelection(message.id)}
          onDelete={() => handleDeleteMessage(message.id)}
          onStar={() => handleStarMessage(message.id)}
          // ✅ UPDATED: Props untuk nama pengirim di dalam bubble
          sender={message.sender}
          showSenderName={showSenderNameInBubble} // TRUE untuk menampilkan nama di dalam bubble
          getSenderColor={getSenderColor}
          isGroupChat={true} // Menandakan ini adalah grup chat
          // Sembunyikan menu yang tidak diinginkan untuk peserta
          onReply={null}
          onPin={null}
          onUnpin={null}
          onCopy={null}
          onEdit={null}
          hideReply={true}
          hidePin={true}
          hideCopy={true}
          hideEdit={true}
          showOnlyEssentials={true}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* MAIN CONTENT WRAPPER - akan di-blur saat modal muncul */}
      <div className={`flex flex-col h-screen ${showDeleteModal ? 'blur-sm' : ''} transition-all duration-200`}>
        {/* HEADER atau SELECTION MODE */}
        {isSelectionMode ? (
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
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                style={{ fontSize: "16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* HEADER NORMAL */
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Foto Profil */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={groupPhotoImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hidden">
                  CA
                </div>
              </div>

              {/* Info Group */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 text-base mb-1">Class All</h2>
                <div className="text-xs text-gray-500 leading-4">
                  <span>Pak Ketua, Pimpinan A, Pimpinan B, Admin A, Admin B, Admin WITA</span>
                </div>
              </div>

              {/* Icon Search */}
              <div className="flex-shrink-0">
                <button className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
                  <img src={assets.Search} alt="search" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AREA CHAT */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6 relative"
          style={{
            backgroundImage: `url(${chatBgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Tanggal */}
          <div className="text-center mb-6 relative z-10">
            <span className="bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-500 rounded-[20px] shadow">
              16 Juni 2025
            </span>
          </div>

          {/* Pesan */}
          <div className="ml-2 space-y-1 relative z-10">
            {messages.map((message, index) => renderMessage(message, index))}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="text-center text-white text-sm py-4 font-medium"
          style={{ backgroundColor: "#4C0D68" }}
        >
          Only admins can send messages.
        </div>
      </div>

      {/* ✅ UPDATED: Delete Confirmation Modal dengan Blur Background */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000]">
          {/* Background overlay dengan backdrop blur saja (tanpa bg hitam) */}
          <div 
            className="absolute inset-0 backdrop-blur-md" 
            onClick={handleCancelDelete}
          ></div>
          
          {/* Modal content */}
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 relative z-10 transform transition-all duration-200 scale-100">
            <div className="p-6">
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
                  className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity rounded-[5px] shadow-sm"
                  style={{ backgroundColor: "#FFB400" }}
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px] shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPeserta;