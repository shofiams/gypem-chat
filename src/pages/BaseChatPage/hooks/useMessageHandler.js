import { useCallback, useState } from 'react';
import { useMessageOperations } from '../../../hooks/useMessages';

// PERBAIKAN: Terima semua state dan fungsi yang dibutuhkan sebagai parameter
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
  flattenedMessages // Diperlukan untuk mendapatkan detail pesan yang akan dihapus
}) => {
  const { sendMessage, updateMessage, deleteMessagesForMe, deleteMessagesGlobally } = useMessageOperations();
  const [selectedDeleteOption, setSelectedDeleteOption] = useState('me');

  const autoResize = (textarea) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
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
    autoResize(e.target);
  };
  
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
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

  // --- FUNGSI HAPUS YANG DIPERBAIKI ---
  const handleFinalDelete = useCallback(async () => {
    let result;
    try {
      if (isSelectionMode) {
        // Hapus banyak pesan
        const messagesData = Array.from(selectedMessages).map(msgId => {
            const msg = flattenedMessages.find(m => m.message_id === msgId);
            return { message_id: msg?.message_id, message_status_id: msg?.message_status?.message_status_id };
        }).filter(Boolean);

        const messageIds = messagesData.map(d => d.message_id);
        const messageStatusIds = messagesData.map(d => d.message_status_id);

        result = selectedDeleteOption === 'everyone'
          ? await deleteMessagesGlobally(messageIds)
          : await deleteMessagesForMe(messageStatusIds);

      } else if (messageToDelete) {
        // Hapus satu pesan
        result = selectedDeleteOption === 'everyone'
          ? await deleteMessagesGlobally([messageToDelete.message_id])
          : await deleteMessagesForMe([messageToDelete.message_status_id]);
      }

      if (result && result.success) {
        await refetchMessages(); // Muat ulang pesan setelah berhasil
      } else {
        alert('Gagal menghapus pesan: ' + result?.error);
      }
    } catch (error) {
        alert('Gagal menghapus pesan: ' + error.message);
    } finally {
        // Reset semua state terkait hapus
        setShowDeleteModal(false);
        setMessageToDelete(null);
        setIsSelectionMode(false);
        setSelectedMessages(new Set());
        setSelectedDeleteOption('me');
    }
  }, [
    isSelectionMode, selectedMessages, messageToDelete, selectedDeleteOption,
    flattenedMessages, deleteMessagesForMe, deleteMessagesGlobally, refetchMessages,
    setShowDeleteModal, setMessageToDelete, setIsSelectionMode, setSelectedMessages
  ]);


  return {
    handleSend,
    handleSaveEdit,
    handleInputChange,
    handleCancelEdit,
    handleKeyDown,
    handleFinalDelete, // Ekspor fungsi yang sudah diperbaiki
    selectedDeleteOption, // Ekspor state ini juga
    setSelectedDeleteOption,
  };
};