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

const BaseChatPage = ({
  isEmbedded = false,
  onClose,
  chatId: propChatId,
  isGroupChat = false,
  canSendMessages = true,
  showSenderNames = false,
  getSenderColor,
  highlightMessageId,
  onMessageHighlight,
  customChatBubbleProps = {},
  onGroupHeaderClick,
  customFooter
}) => {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const actualChatId = isEmbedded ? propChatId : paramChatId;

  const { data: contextMessages, refetch: refetchMessages } = useMessagesByRoom(actualChatId);
  const { data: pinnedMessagesData, refetch: refetchPinnedMessages } = usePinnedMessagesByRoom(actualChatId);
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
      flattenedMessages: contextMessages
  });
  
  const { messagesContainerRef, showScrollButton, scrollToBottom } = useScrollManager(contextMessages);

  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const messageRefs = useRef({});

  const flattenedMessages = useMemo(() => {
    if (!contextMessages || contextMessages.length === 0) return [];
    return contextMessages.flat().filter(msg => {
        if (msg.is_deleted_globally) return true;
        return !(!msg.message_status || msg.message_status.is_deleted_for_me);
    });
  }, [contextMessages]);

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

  const renderMessage = useCallback((msg, idx, arr) => {
    return (
      <div ref={(el) => (messageRefs.current[msg.message_id] = el)}>
        <ChatBubblePeserta
          {...msg}
          onReply={(replyData) => setReplyingMessage(replyData)}
          onPin={(messageStatusId) => pinMessage(messageStatusId).then(() => { refetchMessages(); refetchPinnedMessages(); })}
          onUnpin={(messageId, messageStatusId) => unpinMessage(messageId, messageStatusId).then(() => { refetchMessages(); refetchPinnedMessages(); })}
          onStar={(messageId, messageStatusId, isCurrentlyStarred) => {
              const action = isCurrentlyStarred ? unstarMessages : starMessages;
              action([messageStatusId]).then(() => refetchMessages());
          }}
          isPinned={msg.message_status?.is_pinned}
          isStarred={msg.message_status?.is_starred}
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
          showSenderName={showSenderNames && msg.sender_type !== 'peserta' && (idx === 0 || arr[idx - 1].sender_name !== msg.sender_name)}
          getSenderColor={getSenderColor}
          {...customChatBubbleProps}
        />
      </div>
    );
  }, [isSelectionMode, selectedMessages, flattenedMessages, customChatBubbleProps, showSenderNames, getSenderColor, setReplyingMessage, setEditingMessage, setEditText]);

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
      />

      {!isSelectionMode && (
          <PinnedMessage
            pinnedMessages={pinnedMessagesData}
            currentIndex={currentPinnedIndex}
            onNavigate={(dir) => setCurrentPinnedIndex(prev => (dir === 'next' ? (prev + 1) % pinnedMessagesData.length : (prev - 1 + pinnedMessagesData.length) % pinnedMessagesData.length))}
            onClick={() => {
                const pin = pinnedMessagesData[currentPinnedIndex];
                if (pin && messageRefs.current[pin.message_id]) {
                    messageRefs.current[pin.message_id].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }}
          />
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        <MessageList
            messages={flattenedMessages}
            messagesContainerRef={messagesContainerRef}
            renderMessage={renderMessage}
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
    </div>
  );
};

export default BaseChatPage;