import React from 'react';
import DateSeparator from './DateSeparator';

// Import untuk gambar background
import chatBg from '../../../assets/chat-bg.png';

const MessageList = ({
  messages,
  messagesContainerRef,
  renderMessage,
  onBackgroundClick,
}) => {
  const hasMessages = Array.isArray(messages) && messages.length > 0;

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 relative transition-all duration-300 elegant-scrollbar"
      style={{
        backgroundImage: `url(${chatBg})`,
        backgroundSize: "cover",
      }}
      onClick={onBackgroundClick}
    >
      { hasMessages ? (
        messages.map((msg, idx, arr) => {
          const prevMsg = arr[idx - 1];
          const showDateSeparator = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();
          
          return (
            <React.Fragment key={msg.message_id}>
              {showDateSeparator && <DateSeparator timestamp={msg.created_at} />}
              {renderMessage(msg, idx, arr)}
            </React.Fragment>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet.</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;