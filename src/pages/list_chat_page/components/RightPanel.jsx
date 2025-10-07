import React from 'react';
import PesertaChatPage from '../../PesertaChatPage'; // Path disesuaikan
import GroupChatPeserta from '../../GroupChatPeserta'; // Path disesuaikan
import { assets } from '../../../assets/assets'; // Path disesuaikan
import { HiUserCircle } from "react-icons/hi2";

const RightPanel = ({ 
    activeChat, 
    pageConfig, 
    isStarPage, 
    highlightId,
    highlightMessageId, 
    clearActiveChat,
    setHighlightMessageId 
}) => {
  if (activeChat) {
    if (activeChat.room_type === 'group') {
      return (
        <GroupChatPeserta
          chatId={activeChat.room_id}
          isEmbedded={true}
          onClose={() => {
            clearActiveChat();
            if (isStarPage) setHighlightMessageId(null);
          }}
          highlightMessageId={isStarPage ? highlightMessageId : highlightId}
          onMessageHighlight={isStarPage ? () => setHighlightMessageId(null) : null}
        />
      );
    } else {
      return (
        <PesertaChatPage
          chatId={activeChat.room_id}
          isEmbedded={true}
          onClose={() => {
            clearActiveChat();
            if (isStarPage) setHighlightMessageId(null);
          }}
          highlightMessageId={isStarPage ? highlightMessageId : highlightId}
          onMessageHighlight={isStarPage ? () => setHighlightMessageId(null) : null}
        />
      );
    }
  }

  return (
    <div className="w-full h-full border border-t-0 border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-32 h-32 mb-4 text-gray-300 flex items-center justify-center">
        {assets.logo ? (
            <img src={assets.logo} alt="placeholder" className="w-full h-full object-contain opacity-60" />
        ) : (
            <HiUserCircle className="w-full h-full" />
        )}
    </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Gypem Indonesia</h3>
      <p className="text-center text-gray-500 max-w-md text-sm">
        {pageConfig.placeholderText}
      </p>
    </div>
  );
};

export default RightPanel;