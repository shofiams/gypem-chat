import { useState, useRef } from 'react'; // PERBAIKAN DI SINI

export const useChatState = () => {
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const inputRef = useRef(null);
  const fileButtonRef = useRef(null);

  return {
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
  };
};