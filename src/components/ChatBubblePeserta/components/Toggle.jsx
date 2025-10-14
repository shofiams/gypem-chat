import React from "react";
import DropdownMenuPeserta from "../../DropdownMenuPeserta";

const Toggle = (props) => {
  const {
    dropdownOpen,
    dropdownRef,
    dropdownPosition,
    buttonRef,
    isSender,
    isStarred,
    isPinned,
    handleReply,
    handlePin,
    handleUnpin,
    handleStar,
    handleUnstar,
    handleCopy,
    handleEdit,
    handleSelect,
    handleDelete,
    content,
    groupChatMode,
  } = props;

  if (!dropdownOpen) return null;

  const getDropdownHeight = () => {
    if (groupChatMode) {
      return 130;
    }
    if (isSender && !!content) {
      return 240;
    }
    return 205;
  };

  const dropdownHeight = getDropdownHeight();
  
  const gapBelow = 5; // Jarak untuk dropdown yang muncul ke Bawah (tetap)

  const gapAbove = 30; 

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={dropdownRef}
        className="absolute"
        style={{
          pointerEvents: "auto",
          top:
            dropdownPosition === "above"
              ? `${
                  buttonRef.current?.getBoundingClientRect().top +
                  window.scrollY -
                  dropdownHeight - // Mengurangi tinggi dropdown
                  gapAbove         // Menggunakan jarak untuk di ATAS
                }px`
              : `${
                  buttonRef.current?.getBoundingClientRect().bottom +
                  window.scrollY +
                  gapBelow         // Menggunakan jarak untuk di BAWAH
                }px`,
          left: isSender
            ? `${
                buttonRef.current?.getBoundingClientRect().left +
                window.scrollX -
                10
              }px`
            : `${
                buttonRef.current?.getBoundingClientRect().right +
                window.scrollX +
                10
              }px`,
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
          hasMessage={!!content}
          groupChatMode={groupChatMode}
        />
      </div>
    </div>
  );
};

export default Toggle;