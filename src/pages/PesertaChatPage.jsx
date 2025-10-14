import React from "react";
import { useLocation } from "react-router-dom"; // 1. Import useLocation
import BaseChatPage from "./BaseChatPage";

const PesertaChatPage = ({ 
  isEmbedded = false, 
  onClose, 
  chatId, 
  highlightMessageId: propHighlightMessageId = null, // Ganti nama prop
  onMessageHighlight = null 
}) => {
  
  // --- AWAL PERUBAHAN ---
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlHighlightId = queryParams.get('highlight');

  // Prioritaskan ID dari URL (untuk mobile), jika tidak ada, gunakan dari prop (untuk desktop)
  const highlightMessageId = urlHighlightId || propHighlightMessageId;
  // --- AKHIR PERUBAHAN ---

  return (
    <BaseChatPage
      isEmbedded={isEmbedded}
      onClose={onClose}
      chatId={chatId}
      isGroupChat={false}
      canSendMessages={true}
      showSenderNames={false}
      highlightMessageId={highlightMessageId} // 2. Gunakan highlightMessageId yang sudah diperbarui
      onMessageHighlight={onMessageHighlight}
    />
  );
};

export default PesertaChatPage;