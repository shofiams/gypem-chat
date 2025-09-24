import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import DropdownMenuPeserta from "./DropdownMenuPeserta";
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;

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
            crossOrigin="anonymous"
            className={`max-w-full max-h-[85vh] object-contain cursor-pointer transition-opacity duration-200 ${
              isLoading || error ? 'hidden' : 'opacity-100'
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
      // Direct API fields
      message_id,
      content,
      sender_name,
      sender_type,
      created_at,
      attachment,
      reply_to_message,
      is_deleted_globally,
      message_status,
      
      // UI props
      isLastFromSender,
      isLastFromReceiver,
      onReply,
      onDelete,
      onEdit,
      isSelectionMode,
      isSelected,
      onStartSelection,
      onToggleSelection,
      isLastBubble,
      showSenderName = false,
      getSenderColor,
      searchQuery,
      highlightSearchTerm,
      showTime = false,
      nextMessageTime = null,
      nextMessageSender = null,
      previousMessageSender = null,
      isFirstFromSender = false,
      
      isEdited = false,

      // FIX: Add missing image props with defaults
      images = [], // Array of image URLs for multiple images
      imageIndex = 0, // Current image index
      onImageNavigation = null, // Function to handle image navigation
  } = props;

  console.log('Message pin status:', {
    message_id,
    messageStatusId: message_status?.message_status_id, // <- langsung akses dari message_status
    isPinned: props.isPinned,
    message_status_is_pinned: message_status?.is_pinned
  });

  const currentUserId = "current_user_id"; // Get from auth context
  const isSender = sender_type === 'peserta'; // Adjust based on your logic
  const message = content;
  const sender = sender_name;
  const isDeleted = is_deleted_globally;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isStarred = props.isStarred !== undefined ? props.isStarred : (message_status?.is_starred || false);
  const isPinned = props.isPinned !== undefined ? props.isPinned : (message_status?.is_pinned || false);
  const messageStatusId = message_status?.message_status_id;
  const [showCopied, setShowCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('below');
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdownButton, setShowDropdownButton] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // FIX: Add missing state
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const bubbleRef = useRef(null);
  const longPressTimer = useRef(null);

  console.log('ChatBubble render data:', {
    message_id,
    messageStatusId,
    sender_type,
    message_status,
    hasOnDelete: !!onDelete
  });

  const canDelete = message_id && messageStatusId && sender_type && onDelete;
  
  if (!canDelete) {
    console.warn('ChatBubble: Missing required data for delete:', {
      message_id: !!message_id,
      messageStatusId: !!messageStatusId,
      sender_type: !!sender_type,
      onDelete: !!onDelete
    });
  }

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

  const time = React.useMemo(() => {
    const date = new Date(created_at);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }).replace(':', '.');
  }, [created_at]);

  const getFullUrl = (urlPath) => {
    if (!urlPath || urlPath.startsWith("http")) return urlPath;
    return `${API_BASE_URL}/uploads/${urlPath}`;
  };

  const image = attachment?.file_type === 'image' && attachment.url && !isDeleted 
    ? getFullUrl(attachment.url) 
    : null;

  const file = attachment?.file_type === 'dokumen' && !isDeleted ? {
    name: attachment.original_filename, // <-- Menggunakan "original_filename"
    size: '1MB', // Note: Ukuran file masih hardcoded
    url: getFullUrl(attachment.url)     // <-- Menggunakan "url"
  } : null;

  const reply = reply_to_message ? {
    sender: reply_to_message.sender_name,
    message: reply_to_message.content,
    message_id: reply_to_message.reply_to_message_id
  } : null;

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
    const baseClasses = "relative max-w-xs p-2 transition-all break-words";
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

    // Nonaktifkan interaksi untuk deleted message
    if (isDeleted) {
      return;
    }

    if (isMobile && !isSelectionMode) {
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

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    setImageLoadError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', image);
    setImageLoadError(false);
    setImageLoading(false);
  };

  // Handle image navigation in modal
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
        message_id: message_id,
        sender: isSender ? "You" : sender,
        message: content,
        image,
        file
      });
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handlePin = () => {
    console.log('handlePin called, messageStatusId:', messageStatusId);
    if (props.onPin && messageStatusId) {
      props.onPin(messageStatusId);
    } else {
      console.error('onPin not available or messageStatusId missing');
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleUnpin = () => {
    console.log('handleUnpin called with:', { message_id, messageStatusId, isPinned });
    
    if (props.onUnpin && message_id && messageStatusId) {
      props.onUnpin(message_id, messageStatusId);
    } else {
      console.error('onUnpin handler missing or IDs incomplete:', {
        hasOnUnpin: !!props.onUnpin,
        message_id,
        messageStatusId
      });
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleStar = () => {
    console.log('handleStar called:', { message_id, messageStatusId, isStarred });
    if (props.onStar && message_id && messageStatusId) {
      // Gunakan satu handler untuk star dan unstar
      props.onStar(message_id, messageStatusId, isStarred); // kirim status saat ini
    } else {
      console.error('onStar not available or IDs missing');
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };
  
  const handleUnstar = () => {
    console.log('handleUnstar called:', { message_id, messageStatusId, isStarred });
    if (props.onUnstar && message_id && messageStatusId) {
      // Gunakan satu handler untuk star dan unstar
      props.onUnstar(message_id, messageStatusId, isStarred); // kirim status saat ini
    } else {
      console.error('onUnstar not available or IDs missing');
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
    console.log('ChatBubble handleDelete called:', {
      message_id,
      messageStatusId,
      sender_type,
      onDelete: !!onDelete
    });
    
    if (onDelete) {
      // Pastikan parameter yang dikirim sesuai dengan yang dibutuhkan parent
      onDelete(message_id, messageStatusId, sender_type);
    } else {
      console.error('onDelete handler not provided');
    }
    
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  // Sisipkan fungsi ini di dalam komponen ChatBubblePeserta Anda
  const handleFileDownload = async (fileUrl, fileName) => {
      try {
        // 1. Ambil data file dari URL menggunakan fetch
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        // 2. Ubah respons menjadi Blob (representasi data file)
        const blob = await response.blob();
        
        // 3. Buat URL sementara untuk blob ini di browser
        const url = window.URL.createObjectURL(blob);
        
        // 4. Buat elemen <a> sementara di dalam memori
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download'; // Atur nama file unduhan
        
        // 5. Tambahkan link ke body, klik secara otomatis, lalu hapus
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 6. Hapus URL sementara untuk membersihkan memori
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error('File download failed:', error);
        // Fallback: Jika gagal, coba buka di tab baru.
        // Browser mungkin akan menanganinya sebagai unduhan.
        window.open(fileUrl, '_blank');
        alert('Download failed. Please try saving the file from the new tab.');
      }
    };

  const hasContent = message || image || file || reply;

  // Render status icons dengan pengondisian warna berdasarkan bubble
  const renderStatusIcons = () => {
    if (isDeleted) return null;
    
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        {isEdited && (
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
    if (isDeleted) {
      return (
        <div className={`text-sm italic flex items-center gap-2 ${
          isSender ? "text-white opacity-80" : "text-gray-500"
        }`}>
          <img src={assets.Tarik} alt="deleted" className="w-4 h-4 flex-shrink-0" 
          style={{
            filter: isSender 
              ? 'brightness(0) saturate(100%) invert(1)' // Ikon jadi putih untuk bubble sender
              : 'brightness(0) saturate(100%) invert(0.5)' // Ikon jadi abu-abu untuk bubble receiver
          }}
          />
          <span>
            {isSender ? "You deleted this message" : "This message was deleted"}
          </span>
        </div>
      );
    }

    // Setelah itu baru cek apakah ada konten
    if (!message) {
      return null;
    }
    
    // Jika tidak dihapus dan ada konten teks, jalankan logika normal.
    if (searchQuery && highlightSearchTerm) {
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
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${ isSender ? 'text-white' : 'text-[#4C0D68]' }`}
              >
                Read more
              </button>
            </div>
          )}
          {needsReadMore && isExpanded && (
            <div className="mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${ isSender ? 'text-white' : 'text-[#4C0D68]' }`}
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

    const linkifyText = (text) => {
    if (!text) return text;

    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}[^\s]*)/gi;
    // Daftar ekstensi file umum untuk diabaikan
    const fileExtensionBlacklist = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'mp3', 'mp4', 'avi'];
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const isBareDomain = !url.startsWith('http') && !url.startsWith('www');
      const charBefore = text[match.index - 1];

      // --- PERUBAHAN UTAMA ADA DI SINI ---
      if (isBareDomain) {
        // Cek 1: Jika ini adalah ekstensi file dari daftar hitam, lewati.
        const extension = url.split('.').pop().toLowerCase().replace(/[^a-z0-9]/gi, ''); // Ambil ekstensi dan bersihkan dari tanda baca
        if (fileExtensionBlacklist.includes(extension)) {
          continue;
        }

        // Cek 2: Lewati jika ini bagian dari kata lain (misal: nama file dengan underscore)
        if (charBefore && /\S/.test(charBefore)) {
          continue;
        }
      }
      
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      let cleanUrl = url;
      let trailingChars = '';
      const punctuation = '.,;!?';
      while (punctuation.includes(cleanUrl.slice(-1))) {
        trailingChars = cleanUrl.slice(-1) + trailingChars;
        cleanUrl = cleanUrl.slice(0, -1);
      }

      const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      
      parts.push(
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {cleanUrl}
        </a>
      );

      if (trailingChars) {
        parts.push(trailingChars);
      }

      lastIndex = urlRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };
    
    const formattedText = lines.map((line, index) => (
      <React.Fragment key={index}>
        {/* Gunakan fungsi linkifyText di sini */}
        {linkifyText(line)}
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
    if (images && images.length > 0 && imageIndex < images.length) {
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
        <div className="font-semibold text-[#4C0D68] break-words">
            {reply.sender}
          </div>
          <div className="break-words">
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
        {isSelectionMode && !isDeleted && (
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
                  style={{ color: getSenderColor ? getSenderColor(sender) : "#4C0D68" }}
                >
                  {sender}
                </div>
              )}

              {/* Render reply dengan pengondisian styling */}
              {renderReply()}

              {image && (
                // Kontainer utama untuk bubble gambar + caption
                <div className={`w-64 ${isSender ? '' : ''}`}>
                  {/* Bagian Gambar */}
                  <div 
                    className={`relative overflow-hidden aspect-square ${
                      message && !isDeleted ? 'rounded-t-lg' : 'rounded-lg' // Sudut membulat penuh jika tanpa caption
                    }`}
                  >
                    {imageLoading && !imageLoadError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                      </div>
                    )}

                    {imageLoadError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 border border-gray-300">
                        {/* Error SVG and text */}
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500">Image unavailable</span>
                        <button onClick={() => { setImageLoadError(false); setImageLoading(true); }} className="text-xs text-blue-500 hover:underline mt-1">
                          Retry
                        </button>
                      </div>
                    ) : (
                      <img
                        src={image}
                        alt="chat-img"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handleImageClick}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    )}

                    {/* Ikon status HANYA jika tidak ada caption */}
                    {!message && !isDeleted && (
                       <div className="absolute bottom-1 right-1 flex items-center gap-1 p-1 rounded bg-black/50">
                          {renderStatusIcons()}
                       </div>
                    )}
                  </div>

                  {/* Bagian Caption (hanya muncul jika ada pesan) */}
                  {message && !isDeleted && (
                    <div 
                      className={`p-1 rounded-b-lg ${
                        isSender ? "bg-[#4C0D68] text-white" : "bg-white text-black"
                      }`}
                    >
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex-1 break-all leading-relaxed text-sm">
                          {renderMessageText()}
                        </div>
                        {/* Ikon status berada di sini bersama caption */}
                        {renderStatusIcons()}
                      </div>
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
                      <button
                        className="px-6 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation(); // Mencegah event lain terpicu
                          handleFileDownload(file.url, file.name); // Panggil fungsi download baru
                        }}
                      >
                        Save
                      </button>
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

              {!image && (message || isDeleted) && (
              <div className={`text-sm ${
                isSender ? "text-white" : "text-black"
              }`}>
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1 break-words leading-relaxed">
                  {renderMessageText()}
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
              // onDelete={handleDelete}
              onDelete={canDelete ? handleDelete : null}
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
        hasMultiple={images && images.length > 1}
        onPrevious={images && images.length > 1 ? handleImagePrevious : null}
        onNext={images && images.length > 1 ? handleImageNext : null}
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