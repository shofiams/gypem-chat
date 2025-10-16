import React from "react";
import { assets } from "../../../assets/assets";

const BubbleWrapper = React.forwardRef((props, ref) => {
  const {
    isSender,
    isSelectionMode,
    isSelected,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleBubbleClick,
    getBubbleClasses,
    children,
    shouldShowTime, // Prop fungsi dari handlers
    time,           // Prop waktu (misal: "10:30 AM")
    is_deleted_globally,
    isMobile,
    showDropdownButton,
    hasContent,
    toggleDropdown,
    buttonRef,
  } = props;

  const shouldShowDropdownButton = () => {
    if (!hasContent || is_deleted_globally || isSelectionMode) return false;
    if (isMobile) {
      return showDropdownButton;
    } else {
      return props.isHovering || props.dropdownOpen;
    }
  };

  const renderCheckbox = () => (
    <div
      className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
        isSelected
          ? "bg-[#4C0D68] border-[#4C0D68]"
          : "bg-white border-gray-300 hover:border-[#4C0D68]"
      }`}
    >
      {isSelected && (
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="flex w-full relative items-start"
      onClick={isSelectionMode ? handleBubbleClick : null}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "rgba(76, 13, 104, 0.1)" }}
        />
      )}

      <div className={`flex-shrink-0 transition-all duration-200 ${isSelectionMode ? 'w-12' : 'w-0'}`}>
        {isSelectionMode && !is_deleted_globally && (
          <div className="h-full flex items-start justify-center pt-2">
            {renderCheckbox()}
          </div>
        )}
      </div>

      <div className={`flex-1 flex flex-col min-w-0 py-1 ${isSender ? "items-end" : "items-start"}`}>
        <div className="relative">
          <div
            className={`${getBubbleClasses()} ${
              isSelectionMode ? "cursor-pointer" : ""
            }`}
            onClick={!isSelectionMode ? handleBubbleClick : undefined} // Klik bubble hanya jika tidak dalam mode seleksi
          >
            {children}
          </div>

          {shouldShowDropdownButton() && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-20"
              style={{
                left: isSender ? 'auto' : 'calc(100% + 4px)',
                right: isSender ? 'calc(100% + 4px)' : 'auto',
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
                  padding: 0,
                }}
                className="flex items-center justify-center active:scale-95 transition-transform"
              >
                <img src={assets.Down} alt="dropdown" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Tampilkan timestamp di bawah bubble jika kondisi terpenuhi */}
        {shouldShowTime() && !isSelectionMode && (
          <span className="text-[10px] text-gray-500 mt-1 px-1">{time}</span>
        )}
      </div>
    </div>
  );
});

export default BubbleWrapper;