import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatHeader } from "../../hooks/useChatHeader";
import { useMessagesByRoom, usePinnedMessagesByRoom, useMessageOperations } from "../../hooks/useMessages";
import { messageService } from "../../api/messageService";
import FileUploadPopup from "../../components/FileUploadPopup";
import ChatBubblePeserta from "../../components/ChatBubblePeserta"; 

// --- Import Hooks & Komponen Modular ---
import { useChatState } from "./hooks/useChatState";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { useScrollManager } from "./hooks/useScrollManager";
import ChatHeader from "./components/ChatHeader";
import PinnedMessage from "./components/PinnedMessage";
import MessageList from "./components/MessageList";
import ChatFooter from "./components/ChatFooter";
import DeleteMessageModal from "./components/DeleteMessageModal";
import { assets } from "../../assets/assets";
import ImageViewerModal from "../../components/ChatBubblePeserta/components/ImageViewerModal";

const formatMessageTime = (created_at) => {
  if (!created_at) return "";
  const date = new Date(created_at);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(':', '.');
};

const getTimeGroupingProps = (currentMsg, currentIndex, allMessages) => {
  const nextMsg = allMessages[currentIndex + 1];
  const previousMsg = currentIndex > 0 ? allMessages[currentIndex - 1] : null;

  const currentSender = currentMsg.sender_type === 'peserta' ? "You" : currentMsg.sender_name;
  const nextSender = nextMsg ? (nextMsg.sender_type === 'peserta' ? "You" : nextMsg.sender_name) : null;
  const previousSender = previousMsg ? (previousMsg.sender_type === 'peserta' ? "You" : previousMsg.sender_name) : null;

  const currentTime = formatMessageTime(currentMsg.created_at);
  const nextTime = nextMsg ? formatMessageTime(nextMsg.created_at) : null;

  const isLastInTimeGroup = !nextMsg ||
    nextSender !== currentSender ||
    nextTime !== currentTime;

  return {
    showTime: isLastInTimeGroup,
    nextMessageTime: nextTime,
    nextMessageSender: nextSender,
    previousMessageSender: previousSender,
  };
};


const BaseChatPage = ({
  isEmbedded = false,
  onClose,
  chatId: propChatId,
  isGroupChat = false,
  canSendMessages = true,
  showSenderNames = false,
  getSenderColor,
  highlightMessageId: propHighlightMessageId,
  onMessageHighlight,
  customChatBubbleProps = {},
  onGroupHeaderClick,
  customFooter
}) => {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const actualChatId = isEmbedded ? propChatId : paramChatId;

  const { data: contextMessages, refetch: refetchMessages } = useMessagesByRoom(actualChatId);
  const { refetch: refetchPinnedMessages } = usePinnedMessagesByRoom(actualChatId);
  const { pinMessage, unpinMessage, starMessages, unstarMessages } = useMessageOperations();
  const chatInfo = useChatHeader(actualChatId, isGroupChat);

  const {
    replyingMessage, setReplyingMessage,
    editingMessage, setEditingMessage,
    editText, setEditText,
    isSelectionMode, setIsSelectionMode,
    selectedMessages, setSelectedMessages,
    showEmojiPicker, setShowEmojiPicker,
    showFileUpload, setShowFileUpload,
    message, setMessage,
    showDeleteModal, setShowDeleteModal,
    messageToDelete, setMessageToDelete,
    inputRef,
    fileButtonRef,
  } = useChatState();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const searchHighlightTimer = useRef(null);
  
  const {
    handleSend,
    handleSaveEdit,
    handleInputChange,
    handleCancelEdit,
    handleKeyDown,
    handleFinalDelete,
    selectedDeleteOption,
    setSelectedDeleteOption
  } = useMessageHandler({
      actualChatId, message, setMessage, replyingMessage, setReplyingMessage,
      editingMessage, setEditingMessage, editText, setEditText, refetchMessages,
      isSelectionMode, selectedMessages, setIsSelectionMode, setSelectedMessages,
      messageToDelete, setMessageToDelete, setShowDeleteModal,
      flattenedMessages: contextMessages,
      inputRef 
  });

  const { messagesContainerRef, showScrollButton, scrollToBottom } = useScrollManager(contextMessages, actualChatId);

  const flattenedMessages = useMemo(() => {
    if (!contextMessages || contextMessages.length === 0) return [];
    return contextMessages.flat().filter(msg => {
        if (msg.is_deleted_globally) return true;
        return !(!msg.message_status || msg.message_status.is_deleted_for_me);
    });
  }, [contextMessages]);
  
  // --- AWAL PERUBAHAN UNTUK IMAGE VIEWER ---
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImagesInChat = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;
    return flattenedMessages
      .filter(msg => msg.attachment?.file_type === 'image' && msg.attachment.url && !msg.is_deleted_globally)
      .map(msg => ({
        url: `${API_BASE_URL}/uploads/${msg.attachment.url}`,
        message_id: msg.message_id
      }));
  }, [flattenedMessages]);

  const openImageViewer = (clickedMessageId) => {
    const imageIndex = allImagesInChat.findIndex(img => img.message_id === clickedMessageId);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
      setImageViewerOpen(true);
    }
  };

  const closeImageViewer = () => setImageViewerOpen(false);

  const navigateImageViewer = (direction) => {
    setCurrentImageIndex(prevIndex => {
      if (direction === 'next') {
        return (prevIndex + 1) % allImagesInChat.length;
      } else {
        return (prevIndex - 1 + allImagesInChat.length) % allImagesInChat.length;
      }
    });
  };
  // --- AKHIR PERUBAHAN UNTUK IMAGE VIEWER ---

  const clientSidePinnedMessages = useMemo(() => {
    if (!flattenedMessages) return [];
    return flattenedMessages.filter(msg => msg.message_status?.is_pinned);
  }, [flattenedMessages]);

  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const messageRefs = useRef({});

  useEffect(() => {
    if (clientSidePinnedMessages && currentPinnedIndex >= clientSidePinnedMessages.length) {
      setCurrentPinnedIndex(0);
    }
  }, [clientSidePinnedMessages, currentPinnedIndex]);

  const navigatePinnedMessage = (direction) => {
    if (!clientSidePinnedMessages || clientSidePinnedMessages.length <= 1) return;

    setCurrentPinnedIndex(prevIndex => {
      if (direction === 'next') {
        return (prevIndex + 1) % clientSidePinnedMessages.length;
      } else {
        return (prevIndex - 1 + clientSidePinnedMessages.length) % clientSidePinnedMessages.length;
      }
    });
  };

  const handlePinnedMessageClick = () => {
    if (!clientSidePinnedMessages || clientSidePinnedMessages.length === 0) return;

    const validIndex = currentPinnedIndex < clientSidePinnedMessages.length ? currentPinnedIndex : 0;
    const currentPin = clientSidePinnedMessages[validIndex];

    if (currentPin && messageRefs.current[currentPin.message_id]) {
      messageRefs.current[currentPin.message_id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const element = messageRefs.current[currentPin.message_id];
      element.style.transition = 'background-color 0.5s';
      element.style.backgroundColor = 'rgba(255, 229, 100, 0.5)';
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 1500);
    }
  };

  const handleStartSelection = (messageId) => {
    setIsSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const handleToggleSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) newSet.delete(messageId);
      else newSet.add(messageId);
      if (newSet.size === 0) setIsSelectionMode(false);
      return newSet;
    });
  };

  const getDeleteBehavior = () => {
    const messagesToConsider = isSelectionMode ? Array.from(selectedMessages) : [messageToDelete?.message_id];
    if (messagesToConsider.some(id => flattenedMessages.find(m => m.message_id === id)?.sender_type !== 'peserta')) {
        return 'receiver-included';
    }
    return 'sender-only';
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

    const results = flattenedMessages.filter(msg => 
      msg.content && msg.content.toLowerCase().includes(query.toLowerCase())
    ).reverse();

    setSearchResults(results);
    
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      scrollToMessage(results[0].message_id);
      
      searchHighlightTimer.current = setTimeout(() => {
        setHighlightedMessageId(null);
        searchHighlightTimer.current = null;
      }, 1500);
    } else {
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
    }
  }, [flattenedMessages]);
  
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
    scrollToMessage(searchResults[newIndex].message_id);
    
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

  const renderMessage = useCallback((msg, idx, arr) => {
    const timeGroupingProps = getTimeGroupingProps(msg, idx, arr);

    return (
      <div ref={(el) => (messageRefs.current[msg.message_id] = el)} key={msg.message_id}>
        <ChatBubblePeserta
          {...msg}
          onReply={(replyData) => setReplyingMessage(replyData)}
          // --- TAMBAHKAN PROP BARU UNTUK IMAGE VIEWER ---
          onImageClick={() => openImageViewer(msg.message_id)}
          // ---
          onPin={async (messageStatusId) => {
            const result = await pinMessage(messageStatusId);
            if(result.success) {
                refetchMessages();
                refetchPinnedMessages();
            } else {
                alert('Gagal menyematkan pesan: ' + result.error);
            }
          }}
          onUnpin={async (messageId, messageStatusId) => {
             const result = await unpinMessage(messageId, messageStatusId);
             if(result.success) {
                refetchMessages();
                refetchPinnedMessages();
             } else {
                alert('Gagal melepas sematan pesan: ' + result.error);
             }
          }}
          onStar={(messageId, messageStatusId, isCurrentlyStarred) => {
              const action = isCurrentlyStarred ? unstarMessages : starMessages;
              action([messageStatusId]).then(() => refetchMessages());
          }}
          onDelete={(messageId, messageStatusId, senderType) => {
            setMessageToDelete({ message_id: messageId, message_status_id: messageStatusId, sender_type: senderType });
            setShowDeleteModal(true);
          }}
          onEdit={(messageId) => {
              const messageToEdit = flattenedMessages.find(m => m.message_id === messageId);
              if (messageToEdit) {
                  setEditingMessage(messageId);
                  setEditText(messageToEdit.content);
                  inputRef.current?.focus();
              }
          }}
          isSelectionMode={isSelectionMode}
          isSelected={selectedMessages.has(msg.message_id)}
          onStartSelection={handleStartSelection}
          onToggleSelection={() => handleToggleSelection(msg.message_id)}
          isPinned={msg.message_status?.is_pinned}
          isStarred={msg.message_status?.is_starred}
          showSenderName={showSenderNames && msg.sender_type !== 'peserta' && (idx === 0 || arr[idx - 1].sender_name !== msg.sender_name)}
          getSenderColor={getSenderColor}
          isLastBubble={idx === arr.length - 1}
          searchQuery={searchQuery}
          {...timeGroupingProps} 
          {...customChatBubbleProps}
        />
      </div>
    );
  }, [isSelectionMode, selectedMessages, flattenedMessages, customChatBubbleProps, showSenderNames, getSenderColor, setReplyingMessage, setEditingMessage, setEditText, pinMessage, unpinMessage, refetchMessages, refetchPinnedMessages, searchQuery]);


  return (
    <div className="flex flex-col h-full overflow-hidden border-l">
      <ChatHeader
        chatInfo={chatInfo}
        isEmbedded={isEmbedded}
        onClose={onClose}
        isGroupChat={isGroupChat}
        onGroupHeaderClick={onGroupHeaderClick}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedMessages.size}
        onCancelSelection={() => { setIsSelectionMode(false); setSelectedMessages(new Set()); }}
        onDeleteSelection={() => setShowDeleteModal(true)}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        searchResults={searchResults}
        currentSearchIndex={currentSearchIndex}
        navigateSearchResults={navigateSearchResults}
      />

      {!isSelectionMode && clientSidePinnedMessages && clientSidePinnedMessages.length > 0 && (
          <PinnedMessage
            pinnedMessages={clientSidePinnedMessages}
            currentIndex={currentPinnedIndex}
            onNavigate={navigatePinnedMessage}
            onClick={handlePinnedMessageClick}
          />
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        <MessageList
            messages={flattenedMessages}
            messagesContainerRef={messagesContainerRef}
            renderMessage={renderMessage}
            onBackgroundClick={() => setShowEmojiPicker(false)} 
        />

        {showScrollButton && !isSelectionMode && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-5 z-40 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <img src={assets.ArrowDownThin} alt="Scroll to bottom" className="w-6 h-6" />
          </button>
        )}

        {!isSelectionMode && (
            <ChatFooter
                message={message}
                editingMessage={editingMessage}
                editText={editText}
                replyingMessage={replyingMessage}
                showEmojiPicker={showEmojiPicker}
                inputRef={inputRef}
                fileButtonRef={fileButtonRef}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onSaveEdit={handleSaveEdit}
                onCancelReply={() => setReplyingMessage(null)}
                onCancelEdit={handleCancelEdit}
                onToggleEmojiPicker={() => setShowEmojiPicker(prev => !prev)}
                onShowFileUpload={() => setShowFileUpload(true)}
                canSendMessages={canSendMessages}
                customFooter={customFooter}
            />
        )}
      </div>

      <FileUploadPopup
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSend={async (fileData) => {
            const messageData = {
                file: fileData.file.file,
                content: fileData.caption.trim() || '',
                reply_to_message_id: replyingMessage ? replyingMessage.message_id : null
            };
            const result = await messageService.sendMessage(actualChatId, messageData);
            if (result.success) {
                setReplyingMessage(null);
                refetchMessages();
                setTimeout(scrollToBottom, 100);
            }
        }}
        fileButtonRef={fileButtonRef}
      />

      <DeleteMessageModal
        isOpen={showDeleteModal}
        onClose={() => {
            setShowDeleteModal(false);
            setMessageToDelete(null);
        }}
        onConfirm={handleFinalDelete}
        isSelectionMode={isSelectionMode}
        selectedMessagesCount={selectedMessages.size}
        deleteBehavior={getDeleteBehavior()}
        selectedDeleteOption={selectedDeleteOption}
        onSetDeleteOption={setSelectedDeleteOption}
      />
      
      {/* --- TAMBAHKAN KOMPONEN IMAGE VIEWER DI SINI --- */}
      <ImageViewerModal
        isImageModalOpen={isImageViewerOpen}
        handleImageClick={closeImageViewer}
        handleImagePrevious={() => navigateImageViewer('prev')}
        handleImageNext={() => navigateImageViewer('next')}
        image={allImagesInChat[currentImageIndex]?.url}
        images={allImagesInChat}
      />
      {/* --- --- */}
    </div>
  );
};

export default BaseChatPage;