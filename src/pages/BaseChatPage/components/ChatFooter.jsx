import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import { assets } from '../../../assets/assets';

const ChatFooter = ({
  message,
  editingMessage,
  editText,
  replyingMessage,
  showEmojiPicker,
  showFileUpload,
  inputRef,
  fileButtonRef,
  onInputChange,
  onKeyDown,
  onSend,
  onSaveEdit,
  onCancelReply,
  onCancelEdit,
  onToggleEmojiPicker,
  onShowFileUpload,
  canSendMessages,
  customFooter
}) => {
  if (!canSendMessages) {
    return customFooter ? <div>{customFooter}</div> : null;
  }

  const renderReplyPreview = () => {
    // Prioritas 1: Jika membalas gambar
    if (replyingMessage.image) {
      return (
        <div className="flex items-center gap-1.5">
          <img
            src={assets.ImageIcon}
            alt="image icon"
            className="w-4 h-4 flex-shrink-0"
            style={{ filter: 'brightness(0) opacity(0.6)' }}
          />
          <span>Photo</span>
        </div>
      );
    }
    // Prioritas 2: Jika membalas file
    if (replyingMessage.file) {
      return (
        <div className="flex items-center gap-1.5">
          <img
            src={assets.File}
            alt="file icon"
            className="w-4 h-4 flex-shrink-0"
            style={{ filter: 'grayscale(1) opacity(0.5)' }}
          />
          <span className="truncate">{replyingMessage.file.name}</span>
        </div>
      );
    }
    // Fallback: Jika membalas teks biasa
    return <span className="truncate">{replyingMessage.message}</span>;
  };
  // --- AKHIR PERUBAHAN ---

  return (
    <div className="border-t">
      {replyingMessage && (
        <div className="flex items-center justify-between bg-gray-100 px-3 py-2 border-l-4 border-[#bd2cfc]">
          <div>
            <p className="text-xs font-semibold text-[#bd2cfc]">
              {replyingMessage.sender || "You"}
            </p>
            {/* Menggunakan fungsi render yang baru */}
            <div className="text-xs text-gray-600 w-48">
              {renderReplyPreview()}
            </div>
          </div>
          <button onClick={onCancelReply} className="hover:opacity-80 transition">
            <img src={assets.Cancel} alt="Cancel" className="w-6 h-6" />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="flex items-center justify-between bg-[#4C0D68]/10 px-3 py-2 border-l-4 border-[#4C0D68]">
          <div>
            <p className="text-xs font-semibold text-[#4C0D68]">
              Editing Message
            </p>
            <p className="text-xs text-gray-600 truncate w-48">
              {/* Anda mungkin perlu meneruskan pesan asli untuk ditampilkan di sini */}
            </p>
          </div>
          <button onClick={onCancelEdit} className="hover:opacity-80 transition">
            <img src={assets.Cancel} alt="Cancel" className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="relative p-3 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={onToggleEmojiPicker}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <img src={assets.Happy} alt="emoji" className="w-6 h-6" />
          </button>
          {showEmojiPicker && (
            <div 
              className="absolute bottom-12 left-0 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <EmojiPicker onEmojiClick={(emojiData) => {
                 const textarea = inputRef.current;
                 const start = textarea.selectionStart;
                 const end = textarea.selectionEnd;
                 const currentValue = editingMessage ? editText : message;
                 const newValue = currentValue.substring(0, start) + emojiData.emoji + currentValue.substring(end);
                 
                 onInputChange({ target: { value: newValue } });
                 
                 setTimeout(() => {
                   textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
                   textarea.focus();
                 }, 0);
              }} />
            </div>
          )}
        </div>

        {!editingMessage && (
          <button
            ref={fileButtonRef}
            onClick={onShowFileUpload}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <img src={assets.File} alt="file" className="w-6 h-6" />
          </button>
        )}

        <div className="flex-1 border rounded-2xl px-3 py-1 flex items-center border-[#4C0D68]">
          <textarea
            ref={inputRef}
            placeholder={editingMessage ? "Edit your message..." : "Write down the message"}
            value={editingMessage ? editText : message}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            rows="1"
            className="flex-1 text-sm outline-none resize-none min-h-[24px] max-h-[120px] leading-6 bg-transparent"
          />
          <button
            onClick={editingMessage ? onSaveEdit : onSend}
            disabled={editingMessage ? !editText.trim() : !message.trim()}
            className="ml-2 p-1 rounded-full transition-opacity disabled:opacity-50"
          >
            <img src={assets.Send} alt="Send" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatFooter;