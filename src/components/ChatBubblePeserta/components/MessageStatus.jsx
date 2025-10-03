import React from "react";
import { assets } from "../../../assets/assets";

const MessageStatus = (props) => {
  const {
    isSender,
    updated_at,
    created_at,
    isStarred,
    isPinned,
    // --- TAMBAHKAN PROPS BARU ---
    is_deleted_globally, 
  } = props;

  const wasMessageEdited =
    updated_at && new Date(updated_at) > new Date(created_at);

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {wasMessageEdited && (
        <span className="text-[10px] opacity-70 mr-1">diedit</span>
      )}

      {/* --- KONDISI BARU: Jangan tampilkan jika pesan dihapus --- */}
      {isStarred && !is_deleted_globally && (
        <img
          src={assets.StarFill2}
          alt="star"
          className="w-4 h-4"
          style={{
            filter: isSender
              ? "brightness(0) saturate(100%) invert(1)"
              : "brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)",
          }}
        />
      )}
      {/* --- KONDISI BARU: Jangan tampilkan jika pesan dihapus --- */}
      {isPinned && !is_deleted_globally && (
        <img
          src={assets.PinFill}
          alt="pin"
          className="w-4 h-4"
          style={{
            filter: isSender
              ? "brightness(0) saturate(100%) invert(1)"
              : "brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)",
          }}
        />
      )}
      {isSender && (
        <img src={assets.Ceklis} alt="sent" className="w-3 h-3" />
      )}
    </div>
  );
};

export default MessageStatus;