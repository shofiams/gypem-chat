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
                  (groupChatMode ? 130 : 240)
                }px`
              : `${
                  buttonRef.current?.getBoundingClientRect().bottom +
                  window.scrollY +
                  5
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