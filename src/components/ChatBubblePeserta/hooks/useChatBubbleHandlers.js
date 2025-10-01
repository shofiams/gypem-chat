import { useEffect, useMemo } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;

export const useChatBubbleHandlers = (props, state, stateSetters) => {
  const {
    message_id,
    content,
    sender_type,
    attachment,
    reply_to_message,
    onReply,
    onDelete,
    onEdit,
    isSelectionMode,
    onToggleSelection,
    onStartSelection,
    onImageNavigation,
    images,
    imageIndex,
    isDeleted,
    message_status,
    sender_name,
    isLastBubble,
    nextMessageSender,
    nextMessageTime,
    showSenderName: showSenderNameProp,
    isFirstFromSender,
    previousMessageSender,
    onImageClick, // <-- Pastikan prop ini diterima
  } = props;

  const { isMobile, dropdownRef, buttonRef, longPressTimer } = state;
  const {
    setDropdownOpen,
    setShowDropdownButton,
    // setIsImageModalOpen, // <-- Kita tidak lagi mengatur state ini dari sini
    setShowCopied,
    setImageLoadError,
    setImageLoading,
    setIsHovering,
  } = stateSetters;

  const isSender = sender_type === 'peserta';

  const hasContent = useMemo(() => {
    const image = attachment?.file_type === 'image' && attachment.url && !isDeleted;
    const file = attachment?.file_type === 'dokumen' && !isDeleted;
    return !!(content || image || file || reply_to_message);
  }, [content, attachment, reply_to_message, isDeleted]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
    }
  };

  const shouldShowTime = () => {
    if (props.showTime !== undefined) return props.showTime;
    if (isLastBubble) return true;
    if (nextMessageTime === undefined && nextMessageSender === undefined) {
      return (
        (isSender && props.isLastFromSender) ||
        (!isSender && props.isLastFromReceiver)
      );
    }
    const currentSender = isSender ? "You" : sender_name;
    return (
      !nextMessageSender ||
      nextMessageSender !== currentSender ||
      nextMessageTime !== props.time
    );
  };

  const shouldShowSenderName = () => {
    if (!showSenderNameProp) return false;
    if (isSender) return false;
    if (!sender_name) return false;
    if (isFirstFromSender !== undefined) {
      return isFirstFromSender;
    }
    return (
      !previousMessageSender ||
      previousMessageSender !== sender_name ||
      previousMessageSender === "You"
    );
  };

  const shouldHaveTail = () => {
    return shouldShowTime();
  };

  const getBubbleClasses = () => {
    const baseClasses = "relative max-w-xs p-2 transition-all break-words";
    const hasTail = shouldHaveTail();
    if (isSender) {
      return `${baseClasses} bg-[#4C0D68] text-white ${
        hasTail
          ? "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm"
          : "rounded-lg"
      } ${isDeleted ? "italic opacity-80" : ""}`;
    } else {
      return `${baseClasses} bg-white text-black ${
        hasTail
          ? "rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm"
          : "rounded-lg"
      }`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        if (isMobile) {
          setShowDropdownButton(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, setDropdownOpen, setShowDropdownButton, buttonRef, dropdownRef]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleTouchStart = (e) => {
    if (!isMobile || isSelectionMode) return;
    longPressTimer.current = setTimeout(() => {
      e.preventDefault();
      setShowDropdownButton(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleBubbleClick = (e) => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection();
      return;
    }
    if (isDeleted) return;
    if (isMobile && !isSelectionMode) {
      e.preventDefault();
      setShowDropdownButton((prev) => !prev);
    }
  };
  
  // --- FUNGSI YANG DIPERBAIKI ---
  const handleImageClick = (e) => {
    e.stopPropagation();
    // Panggil fungsi onImageClick yang dikirim dari BaseChatPage
    if (!isSelectionMode && !isDeleted && typeof onImageClick === 'function') {
      onImageClick();
    }
  };
  // --- AKHIR PERBAIKAN ---

  const handleImageError = (e) => {
    setImageLoadError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
    setImageLoading(false);
  };

  const handleImagePrevious = () => {
    if (onImageNavigation && images && images.length > 1) {
      const newIndex = imageIndex > 0 ? imageIndex - 1 : images.length - 1;
      onImageNavigation(newIndex);
    }
  };

  const handleImageNext = () => {
    if (onImageNavigation && images && images.length > 1) {
      const newIndex = imageIndex < images.length - 1 ? imageIndex + 1 : 0;
      onImageNavigation(newIndex);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply({
        message_id: message_id,
        sender: isSender ? "You" : sender_name,
        message: content,
        image:
          attachment?.file_type === "image" &&
          attachment.url &&
          !isDeleted
            ? `${API_BASE_URL}/uploads/${attachment.url}`
            : null,
        file:
          attachment?.file_type === "dokumen" && !isDeleted
            ? {
                name: attachment.original_filename,
                size: "1MB",
                url: `${API_BASE_URL}/uploads/${attachment.url}`,
              }
            : null,
      });
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handlePin = () => {
    if (props.onPin && message_status?.message_status_id) {
      props.onPin(message_status.message_status_id);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleUnpin = () => {
    if (
      props.onUnpin &&
      message_id &&
      message_status?.message_status_id
    ) {
      props.onUnpin(message_id, message_status.message_status_id);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleStar = () => {
    if (
      props.onStar &&
      message_id &&
      message_status?.message_status_id
    ) {
      props.onStar(
        message_id,
        message_status.message_status_id,
        props.isStarred
      );
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleUnstar = () => {
    if (
      props.onStar &&
      message_id &&
      message_status?.message_status_id
    ) {
      props.onStar(
        message_id,
        message_status.message_status_id,
        props.isStarred
      );
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 5000);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message_id);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleSelect = () => {
    if (onStartSelection) {
      onStartSelection(message_id);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(
        message_id,
        message_status?.message_status_id,
        sender_type
      );
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
      window.open(fileUrl, "_blank");
      alert(
        "Download failed. Please try saving the file from the new tab."
      );
    }
  };

  return {
    isSender,
    hasContent,
    handleMouseEnter,
    handleMouseLeave,
    toggleDropdown,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleBubbleClick,
    handleImageClick,
    handleImageError,
    handleImageLoad,
    handleImagePrevious,
    handleImageNext,
    handleReply,
    handlePin,
    handleUnpin,
    handleStar,
    handleUnstar,
    handleCopy,
    handleEdit,
    handleSelect,
    handleDelete,
    handleFileDownload,
    getBubbleClasses,
    shouldShowTime,
    shouldShowSenderName,
    shouldHaveTail,
  };
};