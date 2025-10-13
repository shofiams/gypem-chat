import React from 'react';
import { assets } from '../../../assets/assets';

const PinnedMessage = ({ pinnedMessages, currentIndex, onNavigate, onClick }) => {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const currentPin = pinnedMessages[currentIndex];

  const renderPinnedContent = () => {
    const hasCaption = currentPin.content && currentPin.content.trim() !== '';

    // Pesan dengan gambar
    if (currentPin.attachment?.file_type === 'image') {
      return (
        <div className="flex items-center gap-1.5">
          <img 
            src={assets.ImageIcon} 
            alt="image" 
            className="w-4 h-4 flex-shrink-0" 
            style={{ filter: 'brightness(0) invert(1)' }} 
          />
          <span className="truncate">
            {hasCaption ? currentPin.content : 'Image'}
          </span>
        </div>
      );
    }

    // Pesan dengan file/dokumen
    if (currentPin.attachment?.file_type === 'dokumen') {
      return (
        <div className="flex items-center gap-1.5">
          <img 
            src={assets.File} 
            alt="file" 
            className="w-4 h-4 flex-shrink-0" 
            style={{ filter: 'brightness(0) invert(1)' }} 
          />
          <span className="truncate">
            {hasCaption ? currentPin.content : (currentPin.attachment.original_filename || 'File')}
          </span>
        </div>
      );
    }

    // Pesan teks biasa
    return <p className="text-xs truncate">{currentPin.content || "Message"}</p>;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-[#4C0D68] text-white">
      <div className="bg-white p-2 rounded-lg">
        <img src={assets.PinFill} alt="pinned" className="w-4 h-4" />
      </div>
      <div className="flex-1 cursor-pointer min-w-0" onClick={onClick}>
        <p className="text-xs font-semibold">{currentPin.sender_name}</p>
        <div className="text-xs">{renderPinnedContent()}</div>
      </div>
      {pinnedMessages.length > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => onNavigate('prev')} className="p-1 hover:bg-white/20 rounded">
            <img src={assets.ArrowUp} alt="previous" className="w-6 h-6" />
          </button>
          <span className="text-xs">{currentIndex + 1}/{pinnedMessages.length}</span>
          <button onClick={() => onNavigate('next')} className="p-1 hover:bg-white/20 rounded">
            <img src={assets.ArrowDown} alt="next" className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PinnedMessage;