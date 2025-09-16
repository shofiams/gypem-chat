import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import DropdownMenuPeserta from "./DropdownMenuPeserta";
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';

  // ImageViewerModal component
  const ImageViewerModal = ({ 
    isOpen, 
    onClose, 
    imageUrl, 
    imageName = 'image.jpg',
    onPrevious = null,
    onNext = null,
    hasMultiple = false 
  }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
      if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        alert('Download failed. Please try right-clicking the image and selecting "Save image as..."');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleDownload}
          className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Download image"
          disabled={isLoading || error}
        >
          <Download 
            className={`w-5 h-5 text-white ${
              isLoading || error ? 'opacity-50' : 'opacity-100'
            }`}
          />
        </button>
        
        <button
          onClick={onClose}
          className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {hasMultiple && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {hasMultiple && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Next image"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center justify-center w-96 h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center w-96 h-96 text-white">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Failed to load image</p>
              <p className="text-sm opacity-70 mt-1">The image could not be displayed</p>
            </div>
          )}
          
          <img
            src={imageUrl}
            alt="Full size view"
            className={`max-w-full max-h-[85vh] object-contain cursor-pointer transition-opacity duration-200 ${
              isLoading ? 'opacity-0 absolute' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ChatBubblePeserta component with ImageViewerModal integration
export default function ChatBubblePeserta({ ...props }) {
  const {
    type,
    message,
    time,
    image,
    reply,
    file,
    isLastFromSender,
    isLastFromReceiver,
    onReply,
    onDelete,
    onEdit,
    isDeleted,
    isEdited,
    isSelectionMode,
    isSelected,
    onStartSelection,
    onToggleSelection,
    isLastBubble,
    sender,
    showSenderName = false,
    getSenderColor,
    images = [],
    imageIndex = 0,
    onImageNavigation = null,
    searchQuery,
    highlightSearchTerm,
    showTime = false,
    nextMessageTime = null,
    nextMessageSender = null,
    // New props for handling consecutive messages from same sender
    previousMessageSender = null,
    isFirstFromSender = false, // Indicates if this is the first message in a group from the same sender
  } = props;

  const isSender = type === "sender";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isStarred = props.isStarred || false;
  const isPinned = props.isPinned || false;
  const [showCopied, setShowCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('below');
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdownButton, setShowDropdownButton] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const bubbleRef = useRef(null);
  const longPressTimer = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fungsi untuk menentukan apakah harus menampilkan waktu
  const shouldShowTime = () => {
    // Jika showTime prop diberikan secara eksplisit, gunakan itu
    if (showTime !== undefined) {
      return showTime;
    }

    // Jika ini pesan terakhir di chat, selalu tampilkan waktu
    if (isLastBubble) {
      return true;
    }

    // Untuk backward compatibility, jika tidak ada props time grouping, 
    // gunakan logika lama berdasarkan isLastFromSender/isLastFromReceiver
    if (nextMessageTime === undefined && nextMessageSender === undefined) {
      return (isSender && isLastFromSender) || (!isSender && isLastFromReceiver);
    }

    // Logika time grouping baru:
    // Tampilkan waktu hanya jika ini adalah pesan terakhir dalam grup waktu yang sama
    const currentSender = isSender ? "You" : sender;
    
    // Cek apakah pesan berikutnya dari sender yang berbeda atau waktu berbeda
    const shouldShow = !nextMessageSender || 
      nextMessageSender !== currentSender || 
      nextMessageTime !== time;
    
    return shouldShow;
  };

  // Fungsi untuk menentukan apakah harus menampilkan nama sender
  const shouldShowSenderName = () => {
    // Jika showSenderName diset ke false, jangan tampilkan nama
    if (!showSenderName) return false;
    
    // Jangan tampilkan nama untuk pesan sender (pesan sendiri)
    if (isSender) return false;
    
    // Jangan tampilkan nama jika tidak ada sender
    if (!sender) return false;

    // Jika isFirstFromSender prop tersedia, gunakan itu
    if (isFirstFromSender !== undefined) {
      return isFirstFromSender;
    }

    // Fallback: cek apakah pesan sebelumnya dari sender yang berbeda
    // Tampilkan nama jika pesan sebelumnya dari sender yang berbeda atau tidak ada
    return !previousMessageSender || 
         previousMessageSender !== sender || 
         previousMessageSender === "You";
  };

  // Fungsi untuk menentukan apakah bubble harus memiliki ekor
  const shouldHaveTail = () => {
    return shouldShowTime();
  };

  // Fungsi untuk mendapatkan class bubble dengan ekor
  const getBubbleClasses = () => {
    const baseClasses = "relative max-w-xs p-2 transition-all break-all";
    const hasTail = shouldHaveTail();
    
    if (isSender) {
      // Bubble untuk sender (ungu) - pojok kanan bawah lancip
      return `${baseClasses} bg-[#4C0D68] text-white ${
        hasTail ? "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm" : "rounded-lg"
      } ${isDeleted ? "italic opacity-80" : ""}`;
    } else {
      // Bubble untuk receiver (putih) - pojok kiri bawah lancip
      return `${baseClasses} bg-white text-black ${
        hasTail ? "rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm" : "rounded-lg"
      }`;
    }
  };

  // Bubble tail component
  const BubbleTail = () => {
    if (!shouldHaveTail()) return null;

    return (
      <div 
        className="absolute"
        style={{
          bottom: '2px',
          ...(isSender ? {
            right: '2px',
            width: '0',
            height: '0',
            borderLeft: '8px solid #4C0D68',
            borderTop: '8px solid transparent',
            borderBottom: '2px solid transparent'
          } : {
            left: '2px',
            width: '0',
            height: '0',
            borderRight: '8px solid white',
            borderTop: '8px solid transparent',
            borderBottom: '2px solid transparent'
          })
        }}
      />
    );
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'below';
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = props.groupChatMode ? 120 : 280;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'above';
    }
    
    if (isLastBubble && spaceAbove > 200) {
      return 'above';
    }
    
    return 'below';
  };

  useEffect(() => {
    if (dropdownOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [dropdownOpen, isLastBubble]);

  useEffect(() => {
    function handleClickOutside(event) {
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile]);

  // Handle long press for mobile
  const handleTouchStart = (e) => {
    if (!isMobile || isSelectionMode) return;
    
    longPressTimer.current = setTimeout(() => {
      e.preventDefault();
      setShowDropdownButton(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Handle bubble click for mobile
  const handleBubbleClick = (e) => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection();
      return;
    }

    if (isMobile && !isSelectionMode && !isDeleted) {
      e.preventDefault();
      setShowDropdownButton(prev => !prev);
    }
  };

  // Handle image click to open modal
  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!isSelectionMode && !isDeleted) {
      setIsImageModalOpen(true);
    }
  };

  // Handle image navigation in modal
  const handleImagePrevious = () => {
    if (onImageNavigation && images.length > 1) {
      const newIndex = imageIndex > 0 ? imageIndex - 1 : images.length - 1;
      onImageNavigation(newIndex);
    }
  };

  const handleImageNext = () => {
    if (onImageNavigation && images.length > 1) {
      const newIndex = imageIndex < images.length - 1 ? imageIndex + 1 : 0;
      onImageNavigation(newIndex);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isSelectionMode) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isSelectionMode) {
      setIsHovering(false);
    }
  };

  // Menu Actions
  const handleReply = () => {
    if (onReply) {
      onReply({
        sender: isSender ? "You" : "Other User",
        message,
        image,
        file
      });
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handlePin = () => {
    if (props.onPin) {
      props.onPin({ sender: isSender ? "You" : "Other User", message, image, file });
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleUnpin = () => {
    if (props.onUnpin) {
      props.onUnpin();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleStar = () => {
    if (props.onStar) {
      props.onStar();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };
  
  const handleUnstar = () => {
    if (props.onUnstar) {
      props.onUnstar();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 5000);
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };
  
  const handleSelect = () => {
    if (onStartSelection) {
      onStartSelection();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const hasContent = message || image || file || reply;

  // Render status icons dengan pengondisian warna berdasarkan bubble
  const renderStatusIcons = () => {
    if (isDeleted) return null;
    
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        {isEdited && isSender && (
          <span className="text-[10px] opacity-70 mr-1">diedit</span>
        )}
        
        {isStarred && (
          <img 
            src={assets.StarFill2} 
            alt="star" 
            className="w-4 h-4"
            style={{
              filter: isSender 
                ? 'brightness(0) saturate(100%) invert(1)' // Putih untuk bubble ungu
                : 'brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)' // Ungu #4C0D68 untuk bubble putih
            }}
          />
        )}
        {isPinned && (
          <img 
            src={assets.PinFill} 
            alt="pin" 
            className="w-4 h-4"
            style={{
              filter: isSender 
                ? 'brightness(0) saturate(100%) invert(1)' // Putih untuk bubble ungu
                : 'brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)' // Ungu #4C0D68 untuk bubble putih
            }}
          />
        )}
        {isSender && (
          <img
            src={assets.Ceklis}
            alt="sent"
            className="w-3 h-3"
          />
        )}
      </div>
    );
  };

  // Function to format message with line breaks
  const formatMessageWithLineBreaks = (text) => {
    if (!text) return null;
    
    // Split the text by line breaks and filter out empty strings
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Render message text dengan search highlighting, line breaks, dan read more
  const renderMessageText = () => {
    if (!message) return null;
    
    if (searchQuery && highlightSearchTerm) {
      // Untuk search highlighting
      const needsReadMore = shouldShowReadMore(message);
      const displayText = needsReadMore && !isExpanded 
        ? truncateToLines(message, MAX_LINES) 
        : message;
      
      const lines = displayText.split('\n');
      const highlightedContent = lines.map((line, index) => (
        <React.Fragment key={index}>
          {highlightSearchTerm(line, searchQuery)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ));

      return (
        <div>
          {highlightedContent}
          {needsReadMore && !isExpanded && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                  isSender ? 'text-white' : 'text-[#4C0D68]'
                }`}
              >
                Read more
              </button>
            </div>
          )}
          {needsReadMore && isExpanded && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                  isSender ? 'text-white' : 'text-[#4C0D68]'
                }`}
              >
                Show less
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return formatMessageWithReadMore(message);
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LINES = 15;

  // Fungsi untuk menghitung jumlah baris dalam teks
  const countLines = (text) => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  // Fungsi untuk memotong teks hingga baris tertentu
  const truncateToLines = (text, maxLines) => {
    if (!text) return '';
    
    const maxChars = 35 * maxLines; // 35 karakter per baris estimasi
    
    // Jika terlalu panjang berdasarkan karakter
    if (text.length > maxChars) {
      let truncatePos = maxChars;
      // Cari spasi terdekat untuk memotong dengan rapi
      while (truncatePos > 0 && text[truncatePos] !== ' ' && text[truncatePos] !== '\n') {
        truncatePos--;
      }
      if (truncatePos === 0) truncatePos = maxChars;
      return text.substring(0, truncatePos) + '...';
    }
    
    // Jika tidak, gunakan metode berdasarkan line break
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n');
  };

  // Fungsi untuk menentukan apakah perlu tombol "read more"
  const shouldShowReadMore = (text) => {
    if (!text) return false;
    
    const lineCount = text.split('\n').length;
    const charCount = text.length;
    
    return lineCount > MAX_LINES || charCount > 500; // 500 bisa disesuaikan
  };

  // Fungsi untuk format pesan dengan read more
  const formatMessageWithReadMore = (text) => {
    if (!text) return null;
    
    const needsReadMore = shouldShowReadMore(text);
    const displayText = needsReadMore && !isExpanded 
      ? truncateToLines(text, MAX_LINES) 
      : text;
    
    // Split the text by line breaks
    const lines = displayText.split('\n');
    
    const formattedText = lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));

    return (
      <div>
        {formattedText}
        {needsReadMore && !isExpanded && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                isSender ? 'text-white' : 'text-[#4C0D68]'
              }`}
            >
              Read more
            </button>
          </div>
        )}
        {needsReadMore && isExpanded && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                isSender ? 'text-white' : 'text-[#4C0D68]'
              }`}
            >
              Show less
            </button>
          </div>
        )}
      </div>
    );
  };

  

  // Determine when to show dropdown button
  const shouldShowDropdownButton = () => {
    if (!hasContent || isDeleted || isSelectionMode) return false;
    
    if (isMobile) {
      return showDropdownButton;
    } else {
      return isHovering || dropdownOpen;
    }
  };

  // Function to get sender color
  const getSenderNameColor = () => {
    if (getSenderColor && sender) {
      return getSenderColor(sender);
    }
    return "#4C0D68";
  };

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (images.length > 0) {
      return images[imageIndex];
    }
    return image;
  };

  // Generate image name for download
  const getImageName = () => {
    const timestamp = new Date().getTime();
    return `chat-image-${timestamp}.jpg`;
  };

  // Function to render reply with conditional styling
  const renderReply = () => {
    if (!reply) return null;

    // Format reply message with line breaks
    const formatReplyMessage = (text) => {
      if (!text) return null;
      const lines = text.split('\n');
      return lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    };

    // Untuk bubble ungu (pesan dari orang lain), reply styling abu-abu
    if (!isSender) {
      return (
        <div className="mb-1 p-1 border-l-4 border-[#4C0D68] bg-gray-50 text-xs text-gray-500 rounded break-all">
        <div className="font-semibold text-[#4C0D68] break-all">
            {reply.sender}
          </div>
          <div className="break-all">
            {formatReplyMessage(reply.message)}
          </div>
        </div>
      );
    }
    
    // Untuk bubble putih (pesan sendiri), reply styling tetap seperti kode asli
    return (
      <div className="mb-1 p-1 border-l-4 border-[#bd2cfc] bg-gray-50 text-xs text-gray-500 rounded break-all">
        <div className="font-semibold text-[#bd2cfc] break-all">
          {reply.sender}
        </div>
        <div className="break-all">
          {formatReplyMessage(reply.message)}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        ref={bubbleRef}
        className={`flex items-start mb-2 relative`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Glass-like purple overlay for selected items */}
        {isSelectionMode && isSelected && (
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none z-30" 
            style={{
              background: 'rgba(76, 13, 104, 0.15)',
              border: '1px solid rgba(76, 13, 104, 0.2)'
            }}
          />
        )}

        {/* Rectangle checkbox in selection mode */}
        {isSelectionMode && (
          <div className="flex items-center mr-2 mt-2 relative z-20">
            <div
              className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-[#4C0D68] border-[#4C0D68]' 
                  : 'bg-white border-gray-300 hover:border-[#4C0D68]'
              }`}
              onClick={handleBubbleClick}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        <div className={`${isSender ? "items-end ml-auto" : "items-start"} flex flex-col relative z-10`}>
          <div className="flex items-start">
            <div
              className={`${getBubbleClasses()} cursor-pointer ${
                isSelectionMode ? 'hover:opacity-80' : ''
              }`}
              onClick={handleBubbleClick}
            >
              {/* Bubble Tail */}
              <BubbleTail />

              {/* Show sender name hanya jika shouldShowSenderName() mengembalikan true */}
              {shouldShowSenderName() && (
                <div 
                  className="font-semibold text-[14px]"
                  style={{ color: getSenderNameColor() }}
                >
                  {sender}
                </div>
              )}

              {/* Render reply dengan pengondisian styling */}
              {renderReply()}

              {image && (
                <div className="mb-1">
                  <img
                    src={getCurrentImageUrl()}
                    alt="chat-img"
                    className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                    style={{ maxWidth: '200px' }}
                  />
                  {/* Status icons for image with caption */}
                  {!message && !isDeleted && (
                    <div className="flex justify-end mt-1">
                      {renderStatusIcons()}
                    </div>
                  )}
                </div>
              )}

              {file && (
                <div className="mb-1">
                  <div
                    className={`flex flex-col gap-2 rounded-md p-2 ${
                      isSender ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={assets.File} alt="file" className="w-8 h-8 flex-shrink-0" />
                      <div className="flex flex-col text-sm text-black min-w-0 flex-1">
                        <span className="font-semibold break-words">{file.name}</span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="px-6 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, "_blank");
                        }}
                      >
                        Open
                      </button>
                      <a
                        href={file.url}
                        download={file.name}
                        className="px-6 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Save
                      </a>
                    </div>
                  </div>
                  {/* Status icons for file with caption */}
                  {!message && !isDeleted && (
                    <div className="flex justify-end mt-1">
                      {renderStatusIcons()}
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div className={`text-sm ${isDeleted ? "italic" : ""} ${
                  isSender ? "text-white" : "text-black"
                }`}>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      {isDeleted && (
                        <img src={assets.Tarik} alt="deleted" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 break-all leading-relaxed">
                        {renderMessageText()}
                      </div>
                    </div>

                    {/* Status icons for message */}
                    {!isDeleted && renderStatusIcons()}
                  </div>
                </div>
              )}

              {/* Dropdown button */}
              {shouldShowDropdownButton() && (
                <div
                  className="absolute flex flex-col items-center"
                  style={{
                    top: "50%",
                    left: isSender ? "-30px" : "auto",
                    right: !isSender ? "-30px" : "auto",
                    transform: "translateY(-50%)"
                  }}
                >
                  <button
                    ref={buttonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown();
                    }}
                    style={{
                      width: "26px",
                      height: "22px",
                      borderRadius: "10px",
                      border: "1px solid #4C0D68",
                      backgroundColor: "#E6E1E1",
                      padding: 0
                    }}
                    className="flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <img src={assets.Down} alt="dropdown" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Timestamp dengan logika time grouping - hide in selection mode */}
          {shouldShowTime() && !isSelectionMode && (
            <span className="text-[10px] text-gray-500 mt-1">{time}</span>
          )}
        </div>

        {/* Mobile tap instruction */}
        {isMobile && !isSelectionMode && !isDeleted && !showDropdownButton && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Tap for options
            </div>
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {dropdownOpen && hasContent && !isDeleted && !isSelectionMode && (
        <div 
          className="fixed inset-0 z-[9999]" 
          style={{ pointerEvents: 'none' }}
        >
          <div 
            ref={dropdownRef} 
            className="absolute"
            style={{ 
              pointerEvents: 'auto',
              top: dropdownPosition === 'above' 
                ? `${buttonRef.current?.getBoundingClientRect().top + window.scrollY - (props.groupChatMode ? 130 : 240)}px`
                : `${buttonRef.current?.getBoundingClientRect().bottom + window.scrollY + 5}px`,
              left: isSender 
                ? `${buttonRef.current?.getBoundingClientRect().left + window.scrollX - 10}px`
                : `${buttonRef.current?.getBoundingClientRect().right + window.scrollX + 10}px`
            }}
          >
            <DropdownMenuPeserta
              open={dropdownOpen}
              isStarred={isStarred}
              isPinned={isPinned}
              onReply={handleReply}
              onPin={handlePin}
              onUnpin={handleUnpin}
              onStar={handleStar}
              onUnstar={handleUnstar}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onSelect={handleSelect}
              onDelete={handleDelete}
              isSender={isSender}
              hasMessage={!!message}
              groupChatMode={props.groupChatMode}
            />
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={getCurrentImageUrl()}
        imageName={getImageName()}
        hasMultiple={images.length > 1}
        onPrevious={images.length > 1 ? handleImagePrevious : null}
        onNext={images.length > 1 ? handleImageNext : null}
      />

      {/* Toast notification */}
      {showCopied && (
        <div
          className="fixed text-white px-4 py-2 shadow-lg z-[9999] text-sm"
          style={{
            backgroundColor: "#4C0D68",
            borderRadius: "20px",
            bottom: window.innerWidth < 768 ? '150px' : '90px',
            left: window.innerWidth < 768 ? '50%' : '60%',
            transform: window.innerWidth < 768 ? 'translateX(-50%)' : 'translate(-30%, 70%)'
          }}
        >
          Message is copied
        </div>
      )}
    </>
  );
}