import { useCallback, useState } from 'react';
import { useMessageOperations } from '../../../hooks/useMessages';

// Fungsi helper untuk dispatch event
const dispatchMessagesUpdate = (roomId) => {
  if (roomId) {
    window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId } }));
  }
};

export const useMessageHandler = ({
  actualChatId,
  message, setMessage,
  replyingMessage, setReplyingMessage,
  editingMessage, setEditingMessage,
  editText, setEditText,
  refetchMessages,
  isSelectionMode, selectedMessages,
  setIsSelectionMode, setSelectedMessages,
  messageToDelete, setMessageToDelete,
  setShowDeleteModal,
  flattenedMessages,
  inputRef // <-- TAMBAHKAN inputRef SEBAGAI PARAMETER
}) => {
  const { sendMessage, updateMessage, deleteMessagesForMe, deleteMessagesGlobally } = useMessageOperations();
  const [selectedDeleteOption, setSelectedDeleteOption] = useState('me');

  const autoResize = (textarea) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // Samakan dengan di komponen utama
    const minHeight = 24;  // Samakan dengan di komponen utama
    
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const messageData = {
      content: message.trim(),
      reply_to_message_id: replyingMessage ? replyingMessage.message_id : null,
    };
    const result = await sendMessage(actualChatId, messageData);
    if (result.success) {
      setMessage("");
      setReplyingMessage(null);
      refetchMessages();

      // --- TAMBAHAN: Kirim sinyal update ---
      dispatchMessagesUpdate(actualChatId);
      // --- TAMBAHKAN LOGIKA RESET TINGGI TEXTAREA DI SINI ---
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px'; // Atur ke tinggi minimal
          inputRef.current.style.overflowY = 'hidden';
        }
      }, 10);
      // --- ---

    } else {
      console.error("Failed to send message:", result.error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingMessage) return;
    const result = await updateMessage(editingMessage, editText.trim());
    if (result.success) {
      setEditingMessage(null);
      setEditText("");
      refetchMessages();

      // --- TAMBAHAN: Kirim sinyal update ---
      dispatchMessagesUpdate(actualChatId);
      // --- TAMBAHKAN LOGIKA RESET TINGGI TEXTAREA DI SINI JUGA ---
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px'; // Atur ke tinggi minimal
          inputRef.current.style.overflowY = 'hidden';
        }
      }, 10);
      // --- ---

    } else {
      console.error("Failed to update message:", result.error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (editingMessage) {
      setEditText(value);
    } else {
      setMessage(value);
    }
    // Panggil autoResize dari sini
    setTimeout(() => autoResize(e.target), 0);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
    // --- TAMBAHKAN LOGIKA RESET TINGGI SAAT BATAL EDIT ---
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = '24px';
        inputRef.current.style.overflowY = 'hidden';
      }
    }, 10);
    // --- ---
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSend();
      }
    }
  };

  // --- FUNGSI HAPUS (Tidak berubah) ---
const handleFinalDelete = useCallback(async () => {
    let result;
    if (isSelectionMode) {
      // Logic for multi-selection delete
      const messageStatusIds = Array.from(selectedMessages).map(id => flattenedMessages.find(m => m.message_id === id)?.message_status?.message_status_id).filter(Boolean);
      const messageIds = Array.from(selectedMessages);
      
      if (selectedDeleteOption === 'everyone') {
        result = await deleteMessagesGlobally(messageIds);
      } else {
        result = await deleteMessagesForMe(messageStatusIds);
      }
    } else if (messageToDelete) {
      // Logic for single message delete
      if (selectedDeleteOption === 'everyone') {
        result = await deleteMessagesGlobally([messageToDelete.message_id]);
      } else {
        result = await deleteMessagesForMe([messageToDelete.message_status_id]);
      }
    }

    if (result?.success) {
      refetchMessages();
      // --- TAMBAHAN: Kirim sinyal update ---
      dispatchMessagesUpdate(actualChatId);
      // ---
    } else {
      console.error('Failed to delete message(s):', result?.error);
    }
    
    setShowDeleteModal(false);
    setMessageToDelete(null);
    setIsSelectionMode(false);
    setSelectedMessages(new Set());
    setSelectedDeleteOption('me');

  }, [
    isSelectionMode,
    selectedMessages,
    messageToDelete,
    selectedDeleteOption,
    deleteMessagesGlobally,
    deleteMessagesForMe,
    refetchMessages,
    actualChatId,
    flattenedMessages,
    setShowDeleteModal,
    setMessageToDelete,
    setIsSelectionMode,
    setSelectedMessages,
  ]);


  return {
    handleSend,
    handleSaveEdit,
    handleInputChange,
    handleCancelEdit,
    handleKeyDown,
    handleFinalDelete,
    selectedDeleteOption,
    setSelectedDeleteOption,
  };
};