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
    isDeleted,
    // ✅ NEW: Selection mode props
    isSelectionMode,
    isSelected,
    onStartSelection,
    onToggleSelection
  } = props;

  const isSender = type === "sender";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  };

  const handlePin = () => {
    if (props.onPin) {
      props.onPin({ sender: isSender ? "You" : "Other User", message, image, file });
    }
    setIsPinned(true);
    setDropdownOpen(false);
  };

  const handleUnpin = () => {
    setIsPinned(false);
    if (props.onUnpin) {
      props.onUnpin();
    }
    setDropdownOpen(false);
  };

  const handleStar = () => {
    setIsStarred(true);
    setDropdownOpen(false);
  };
  
  const handleUnstar = () => {
    setIsStarred(false);
    setDropdownOpen(false);
  };

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 5000);
    }
    setDropdownOpen(false);
  };

  const handleEdit = () => {
    console.log("Edit clicked");
    setDropdownOpen(false);
  };
  
  // ✅ MODIFIED: Handle select - start selection mode
  const handleSelect = () => {
    if (onStartSelection) {
      onStartSelection();
    }
    setDropdownOpen(false);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDropdownOpen(false);
  };

  // ✅ NEW: Handle bubble click in selection mode
  const handleBubbleClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection();
    }
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
            src={assets.StarFill} 
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

  return (
    <>
      <div
        className={`flex items-start mb-2 relative`}
        onMouseEnter={() => !isSelectionMode && setIsHovering(true)}
        onMouseLeave={() => !isSelectionMode && setIsHovering(false)}
      >
        {/* ✅ NEW: Glass-like purple overlay for selected items - in front of bubble */}
        {isSelectionMode && isSelected && (
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none z-30" 
            style={{
              background: 'rgba(76, 13, 104, 0.15)',
              border: '1px solid rgba(76, 13, 104, 0.2)'
            }}
          />
        )}

        {/* ✅ MODIFIED: Rectangle checkbox always on the left with 8px border radius */}
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
              onClick={isSelectionMode ? handleBubbleClick : undefined}
            >
              {reply && (
                <div className="mb-1 p-1 border-l-4 border-[#4C0D68] bg-gray-50 text-xs text-gray-500 rounded">
                  <span className="font-semibold text-[#4C0D68]">
                    {reply.sender}:
                  </span>{" "}
                  {reply.message}
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
                        className="px-3 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
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
                        className="px-3 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
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
                <p className={`text-sm flex items-center gap-1 ${isDeleted ? "italic" : ""} ${
                  isSender ? "text-white" : "text-black"
                }`}>
                  {isDeleted && (
                    <img src={assets.Tarik} alt="deleted" className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{message}</span>

                  {!isDeleted && (
                    <>
                      {renderStatusIcons()}
                    </>
                  )}
                </p>
              )}

              {/* ✅ MODIFIED: Dropdown button - hide in selection mode */}
              {hasContent && (isHovering || dropdownOpen) && !isDeleted && !isSelectionMode && (
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
                    onClick={toggleDropdown}
                    style={{
                      width: "26px",
                      height: "22px",
                      borderRadius: "10px",
                      border: "1px solid #4C0D68",
                      backgroundColor: "#E6E1E1",
                      padding: 0
                    }}
                    className="flex items-center justify-center"
                  >
                    <img src={assets.Down} alt="dropdown" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* ✅ Timestamp - hide in selection mode */}
          {(isLastFromSender || isLastFromReceiver) && !isSelectionMode && (
            <span className="text-[10px] text-gray-500 mt-1">{time}</span>
          )}
        </div>
      </div>

      {/* ✅ Dropdown menu - hide in selection mode */}
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
              top: `${buttonRef.current?.getBoundingClientRect().bottom + window.scrollY + 5}px`,
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
            />
          </div>
        </div>
      )}

      {/* ✅ Toast notification */}
      {showCopied && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#4C0D68] text-white px-4 py-2 rounded-[20px] text-sm shadow-lg"
          style={{
            backgroundColor: "#4C0D68",
            borderRadius: "20px"
          }}
        >
          Message is copied
        </div>
      )}
    </>
  );
}