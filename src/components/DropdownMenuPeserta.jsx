import React from "react";
import { assets } from "../assets/assets";

const DropdownMenuPeserta = ({
  open,
  onReply,
  onPin,
  onUnpin,
  onStar,
  onUnstar,
  onCopy,
  onEdit,
  onSelect,
  onDelete,
  isStarred,
  isPinned,
  isSender,
  hasMessage,
  groupChatMode = false,
}) => {
  if (!open) return null;

  // 1. Definisikan semua kemungkinan item menu
  const allMenuItems = groupChatMode
    ? [
        // Mode grup: hanya tampilkan star, select, dan delete
        isStarred
          ? { label: "unstar", icon: assets.Unstar, action: onUnstar }
          : { label: "star", icon: assets.Star, action: onStar },
        { label: "select", icon: assets.Select, action: onSelect },
        { label: "delete", icon: assets.Trash, action: onDelete },
      ]
    : [
        // Mode chat biasa: tampilkan semua opsi
        { label: "reply", icon: assets.Reply, action: onReply },
        isStarred
          ? { label: "unstar", icon: assets.Unstar, action: onUnstar }
          : { label: "star", icon: assets.Star, action: onStar },
        isPinned
          ? { label: "unpin", icon: assets.Unpin, action: onUnpin }
          : { label: "pin", icon: assets.Pin, action: onPin },
        { label: "copy", icon: assets.Copy, action: onCopy },
        ...(isSender && hasMessage
          ? [{ label: "edit", icon: assets.Edit, action: onEdit }]
          : []),
        { label: "select", icon: assets.Select, action: onSelect },
        { label: "delete", icon: assets.Trash, action: onDelete },
      ];

  // 2. Filter item menu yang aksinya tidak valid (null atau undefined)
  const visibleMenuItems = allMenuItems.filter(item => typeof item.action === 'function');

  return (
    <div
      className="absolute mt-2 left-1/2 -translate-x-1/2 rounded-lg shadow-md overflow-hidden text-black z-50"
      style={{
        width: "174px",
        backgroundColor: "#F3F3F3",
        border: "1px solid #4C0D68",
        color: "#000",
        zIndex: 9999,
      }}
    >
      {/* 3. Tampilkan hanya item menu yang visible */}
      {visibleMenuItems.map((item, index) => (
        <React.Fragment key={index}>
          <button
            onClick={item.action}
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-200 w-full text-left"
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-4 h-4 object-contain"
            />
            <span className="capitalize">{item.label}</span>
          </button>
          {index < visibleMenuItems.length - 1 && (
            <div className="border-t border-gray-200"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DropdownMenuPeserta;