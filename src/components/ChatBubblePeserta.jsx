import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import DropdownMenuPeserta from "./DropdownMenuPeserta";

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
  } = props;

  const isSender = type === "sender";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('below');
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdownButton, setShowDropdownButton] = useState(false);
  
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

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'below';
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = 280;
    
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
    setIsPinned(true);
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleUnpin = () => {
    setIsPinned(false);
    if (props.onUnpin) {
      props.onUnpin();
    }
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };

  const handleStar = () => {
    setIsStarred(true);
    setDropdownOpen(false);
    if (isMobile) setShowDropdownButton(false);
  };
  
  const handleUnstar = () => {
    setIsStarred(false);
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

  const renderStatusIcons = () => {
    if (isDeleted) return null;
    
    const hasMediaContent = image || file;
    const iconPositionClass = hasMediaContent ? 'top-[40px]' : 'top-[8px]';
    
    return (
      <>
        {isStarred && (
          <img 
            src={assets.StarFill2} 
            alt="star" 
            className={`w-4 h-4 relative ${iconPositionClass}`} 
          />
        )}
        {isPinned && (
          <img 
            src={assets.PinFill} 
            alt="pin" 
            className={`w-4 h-4 relative ${iconPositionClass}`} 
          />
        )}
        {isSender && (
          <img
            src={assets.Ceklis}
            alt="sent"
            className={`w-3 h-3 relative ${iconPositionClass}`}
          />
        )}
      </>
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

  // ✅ NEW: Function to get sender color
  const getSenderNameColor = () => {
    if (getSenderColor && sender) {
      return getSenderColor(sender);
    }
    return "#4C0D68"; // Default color
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
              className={`relative max-w-xs p-2 rounded-lg cursor-pointer transition-all ${
                isSender
                  ? `bg-[#4C0D68] text-white ${
                      isLastFromSender ? "rounded-br-none" : ""
                    } ${isDeleted ? "italic opacity-80" : ""}`
                  : `bg-white text-black ${
                      isLastFromReceiver ? "rounded-bl-none" : ""
                    }`
              } ${
                isSelectionMode ? 'hover:opacity-80' : ''
              }`}
              onClick={handleBubbleClick}
            >
              {/* ✅ NEW: Tampilkan nama pengirim di dalam bubble jika showSenderName true */}
              {showSenderName && sender && !isSender && (
                <div 
                  className="text-xs font-semibold text-[16px]"
                  style={{ color: getSenderNameColor() }}
                >
                  {sender}
                </div>
              )}

              {reply && (
                <div className="mb-1 p-1 border-l-4 border-[#4C0D68] bg-gray-50 text-xs text-gray-500 rounded">
                  <div className="font-semibold text-[#4C0D68]">
                    {reply.sender}
                  </div>
                  <div>
                    {reply.message}
                  </div>
                </div>
              )}

              {image && (
                <div className="flex items-center gap-1">
                  <img
                    src={image}
                    alt="chat-img"
                    className="max-w-[200px] rounded-md mb-1"
                  />
                  {renderStatusIcons()}
                </div>
              )}

              {file && (
                <div className="flex items-center gap-1">
                  <div
                    className={`flex flex-col gap-2 rounded-md p-2 mb-1 ${
                      isSender ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={assets.File} alt="file" className="w-8 h-8" />
                      <div className="flex flex-col text-sm text-black">
                        <span className="font-semibold">{file.name}</span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                  {renderStatusIcons()}
                </div>
              )}

              {message && (
                <div className={`text-sm ${isDeleted ? "italic" : ""} ${
                  isSender ? "text-white" : "text-black"
                }`}>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex items-center gap-1 flex-1">
                      {isDeleted && (
                        <img src={assets.Tarik} alt="deleted" className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="flex-1">{message}</span>
                    </div>

                    {!isDeleted && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isEdited && isSender && (
                          <span className="text-[10px] opacity-70 mr-1">diedit</span>
                        )}
                        
                        {isStarred && (
                          <img 
                            src={assets.StarFill2} 
                            alt="star" 
                            className="w-4 h-4" 
                          />
                        )}
                        {isPinned && (
                          <img 
                            src={assets.PinFill} 
                            alt="pin" 
                            className="w-4 h-4" 
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
                    )}
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
          
          {/* Timestamp - hide in selection mode */}
          {(isLastFromSender || isLastFromReceiver) && !isSelectionMode && (
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
                ? `${buttonRef.current?.getBoundingClientRect().top + window.scrollY - 240}px`
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