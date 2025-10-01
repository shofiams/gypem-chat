import React from 'react';
import { assets } from '../../../assets/assets';

const PinnedMessage = ({ pinnedMessages, currentIndex, onNavigate, onClick }) => {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const currentPin = pinnedMessages[currentIndex];

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-[#4C0D68] text-white">
      <img src={assets.PinFill} alt="pinned" className="w-4 h-4" />
      <div className="flex-1 cursor-pointer min-w-0" onClick={onClick}>
        <p className="text-xs font-semibold">{currentPin.sender_name}</p>
        <p className="text-xs truncate">{currentPin.content || "Media"}</p>
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