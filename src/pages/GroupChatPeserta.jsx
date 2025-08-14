import React from "react";
import BaseChatPage from "./base_chat_page";

const GroupChatPeserta = ({ isEmbedded = false, onClose, chatId }) => {
  const getSenderColor = (sender) => {
    const colors = {
      "Admin A": "#4169E1",
      "Admin B": "#32CD32", 
      "Pimpinan A": "#FF1493",
    };
    return colors[sender] || "#4C0D68";
  };

  const readOnlyFooter = (
    <div
      className="text-center text-white text-sm py-4 font-medium"
      style={{ backgroundColor: "#4C0D68" }}
    >
      Only admins can send messages.
    </div>
  );

  const customChatBubbleProps = {
    hideReply: true,
    hidePin: true,
    hideCopy: true,
    hideEdit: true,
    showOnlyEssentials: true,
  };

  return (
    <BaseChatPage
      isEmbedded={isEmbedded}
      onClose={onClose}
      chatId={chatId}
      isGroupChat={true}
      canSendMessages={false}
      showSenderNames={true}
      getSenderColor={getSenderColor}
      customFooter={readOnlyFooter}
      customChatBubbleProps={customChatBubbleProps}
    />
  );
};

export default GroupChatPeserta;