import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import groupPhoto from '../../../assets/admin-profile.png';

const ChatHeader = ({
  // Props untuk header normal
  chatInfo,
  isEmbedded,
  onClose,
  onGroupHeaderClick,
  isGroupChat,

  // Props untuk header mode seleksi (dari kode lama Anda)
  isSelectionMode,
  selectedCount,
  onCancelSelection,
  onDeleteSelection
}) => {
  const navigate = useNavigate();

  // Jika dalam mode seleksi, tampilkan header seleksi
  if (isSelectionMode) {
    return (
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{selectedCount} Selected</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={onDeleteSelection}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <img src={assets.Trash} alt="Delete" className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onCancelSelection}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Jika tidak, tampilkan header chat normal
  return (
    <div className="flex items-center gap-3 p-3 border-b">
      <button
        onClick={() => {
          if (isEmbedded && !window.matchMedia('(max-width: 768px)').matches) {
            onClose();
          } else {
            navigate(isGroupChat ? '/group' : '/chats');
          }
        }}
        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-all"
      >
        <img src={assets.ArrowLeft} alt="Back" className="w-5 h-5" />
      </button>
      <img
        src={chatInfo?.avatar || groupPhoto}
        alt="profile"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div
        className={`flex-1 ${isGroupChat && onGroupHeaderClick ? 'cursor-pointer' : ''}`}
        onClick={isGroupChat ? onGroupHeaderClick : undefined}
      >
        <p className="font-semibold text-sm">{chatInfo?.name}</p>
        <p className="text-xs text-gray-500 truncate">{chatInfo?.subtitle}</p>
      </div>
      {/* Anda bisa menambahkan tombol search di sini jika perlu */}
    </div>
  );
};

export default ChatHeader;