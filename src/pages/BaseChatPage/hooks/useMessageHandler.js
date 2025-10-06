import { useCallback } from 'react';
import { useMessageOperations } from '../../../hooks/useMessages';

export const useMessageHandler = ({
  actualChatId,
  message, setMessage,
  replyingMessage, setReplyingMessage,
  editingMessage, setEditingMessage,
  editText, setEditText,
  refetchMessages,
  refetchPinnedMessages,
  isSelectionMode, selectedMessages,
  setIsSelectionMode, setSelectedMessages,
  messageToDelete, setMessageToDelete,
  setShowDeleteModal,
  flattenedMessages,
  inputRef,
  selectedDeleteOption, setSelectedDeleteOption,
  scrollToBottom, // <-- Terima prop baru
}) => {
  const { sendMessage, updateMessage, deleteMessagesForMe, deleteMessagesGlobally } = useMessageOperations();

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

      // --- PERUBAIKAN UTAMA DI SINI ---
      // Panggil scroll ke bawah SECARA LANGSUNG setelah mengirim pesan.
      // Timeout memastikan scroll terjadi setelah pesan baru di-render.
      setTimeout(() => {
        if (scrollToBottom) {
          scrollToBottom('auto'); // 'auto' untuk scroll instan
        }
      }, 100);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px';
          inputRef.current.style.overflowY = 'hidden';
        }
      }, 10);

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

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = '24px';
          inputRef.current.style.overflowY = 'hidden';
        }
      }, 10);

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
    setTimeout(() => autoResize(e.target), 0);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = '24px';
        inputRef.current.style.overflowY = 'hidden';
      }
    }, 10);
  };

  const handleKeyDown = (e) => {
    // 1. Tangani penambahan baris baru secara eksplisit
    if (e.key === 'Enter' && (e.shiftKey || e.altKey)) {
      e.preventDefault(); // Mencegah perilaku default lainnya

      const textarea = e.target;
      const currentValue = editingMessage ? editText : message;
      const selectionStart = textarea.selectionStart;

      // Membuat nilai baru dengan baris baru di posisi kursor
      const newValue = 
        currentValue.substring(0, selectionStart) + 
        '\n' + 
        currentValue.substring(textarea.selectionEnd);

      // Memperbarui state yang sesuai
      if (editingMessage) {
        setEditText(newValue);
      } else {
        setMessage(newValue);
      }

      // Atur posisi kursor setelah baris baru ditambahkan
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        autoResize(textarea); // Panggil autoResize agar textarea melebar

        // Pastikan textarea scroll ke bawah agar kursor selalu terlihat
        textarea.scrollTop = textarea.scrollHeight;

      }, 0);

      return; // Hentikan eksekusi lebih lanjut
    }

    // 2. Tangani pengiriman pesan hanya dengan "Enter"
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSend();
      }
    }
  };
  
  const handleFinalDelete = useCallback(async () => {
      try {
        let messageStatusIds = [];
        let messageIds = [];

        if (isSelectionMode) {
          const messagesData = Array.from(selectedMessages).map(msgId => {
            const msg = flattenedMessages.find(m => m.message_id === msgId);
            if (!msg) {
              console.warn(`Message with ID ${msgId} not found in the current chat's flattenedMessages.`);
              return null;
            }
            return {
              message_id: msg.message_id,
              message_status_id: msg.message_status?.message_status_id,
            };
          }).filter(Boolean); 

          messageIds = messagesData.map(d => d.message_id);

          messageStatusIds = messagesData
            .map(d => d.message_status_id)
            .filter(Boolean);

        } else if (messageToDelete) {
          messageIds = [messageToDelete.message_id];
          if (messageToDelete.message_status_id) {
            messageStatusIds = [messageToDelete.message_status_id];
          }
        }

        if (selectedDeleteOption === 'everyone' && messageIds.length === 0) {
          alert('Error: Tidak ada ID pesan yang valid untuk dihapus.');
          return;
        }
        if (selectedDeleteOption === 'me' && messageStatusIds.length === 0) {
          alert('Error: Tidak dapat menemukan status pesan untuk dihapus. Cek konsol untuk info lebih lanjut.');
          console.error("Debug Info:", { messageToDelete, selectedMessages: Array.from(selectedMessages) });
          return;
        }
        
        const result = selectedDeleteOption === 'everyone'
          ? await deleteMessagesGlobally(messageIds)
          : await deleteMessagesForMe(messageStatusIds);

        if (result.success) {
          refetchMessages();
          if (refetchPinnedMessages) {
            refetchPinnedMessages();
          }
        } else {
          alert('Gagal menghapus pesan: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('Gagal menghapus pesan: ' + error.message);
      } finally {
        setShowDeleteModal(false);
        setMessageToDelete(null);
        setSelectedDeleteOption('me');
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedMessages(new Set());
        }
      }
    }, [
      isSelectionMode,
      selectedMessages,
      messageToDelete,
      selectedDeleteOption,
      flattenedMessages,
      deleteMessagesGlobally,
      deleteMessagesForMe,
      refetchMessages,
      refetchPinnedMessages,
      setShowDeleteModal,
      setMessageToDelete,
      setSelectedDeleteOption,
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
  };
};