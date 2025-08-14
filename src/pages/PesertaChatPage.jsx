import React from "react";
import BaseChatPage from "./base_chat_page";

const PesertaChatPage = ({ isEmbedded = false, onClose, chatId }) => {
  return (
    <BaseChatPage
      isEmbedded={isEmbedded}
      onClose={onClose}
      chatId={chatId}
      isGroupChat={false}
      canSendMessages={true}
      showSenderNames={false}
    />
  );
};

export default PesertaChatPage;