import React from "react";
import { assets } from "../../../assets/assets";
import MessageStatus from "./MessageStatus";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;

const BubbleTail = ({ isSender, shouldHaveTail }) => {
  if (!shouldHaveTail()) return null;

  return (
    <div
      className="absolute"
      style={{
        bottom: '2px',
        ...(isSender
          ? {
              right: '2px',
              width: '0',
              height: '0',
              borderLeft: '8px solid #4C0D68',
              borderTop: '8px solid transparent',
              borderBottom: '2px solid transparent',
            }
          : {
              left: '2px',
              width: '0',
              height: '0',
              borderRight: '8px solid white',
              borderTop: '8px solid transparent',
              borderBottom: '2px solid transparent',
            }),
      }}
    />
  );
};

const MessageRenderer = (props) => {
  const {
    isSender,
    // --- UBAH PROPS DI SINI ---
    is_deleted_globally, // Gunakan prop ini dari data API
    content,
    searchQuery,
    highlightSearchTerm,
    isExpanded,
    setIsExpanded,
    attachment,
    reply_to_message,
    handleImageClick,
    imageLoading,
    imageLoadError,
    handleImageLoad,
    handleImageError,
    handleFileDownload,
    getSenderColor,
    sender_name,
    shouldShowSenderName,
    shouldHaveTail,
  } = props;

  const getFullUrl = (urlPath) => {
    if (!urlPath || urlPath.startsWith("http")) return urlPath;
    return `${API_BASE_URL}/uploads/${urlPath}`;
  };

  const image =
    attachment?.file_type === "image" && attachment.url && !is_deleted_globally
      ? getFullUrl(attachment.url)
      : null;

  const file =
    attachment?.file_type === "dokumen" && !is_deleted_globally
      ? {
          name: attachment.original_filename,
          size: "1MB",
          url: getFullUrl(attachment.url),
        }
      : null;

  const reply = reply_to_message
    ? {
        sender: reply_to_message.sender_name,
        message: reply_to_message.content,
        message_id: reply_to_message.reply_to_message_id,
      }
    : null;

  const renderReply = () => {
    if (!reply) return null;

    const formatReplyMessage = (text) => {
      if (!text) return null;
      const lines = text.split("\n");
      return lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    };

    if (!isSender) {
      return (
        <div className="mb-1 p-1 border-l-4 border-[#4C0D68] bg-gray-50 text-xs text-gray-500 rounded break-all">
          <div className="font-semibold text-[#4C0D68] break-words">
            {reply.sender}
          </div>
          <div className="break-words">
            {formatReplyMessage(reply.message)}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-1 p-1 border-l-4 border-[#bd2cfc] bg-gray-50 text-xs text-gray-500 rounded break-all">
        <div className="font-semibold text-[#bd2cfc] break-all">
          {reply.sender}
        </div>
        <div className="break-all">
          {formatReplyMessage(reply.message)}
        </div>
      </div>
    );
  };

  const renderMessageText = () => {
    // --- UBAH KONDISI DI SINI ---
    if (is_deleted_globally) {
      return (
        <div
          className={`text-sm italic flex items-center gap-2 ${
            isSender ? "text-white opacity-80" : "text-gray-500"
          }`}
        >
          <img
            src={assets.Tarik}
            alt="deleted"
            className="w-4 h-4 flex-shrink-0"
            style={{
              filter: isSender
                ? "brightness(0) saturate(100%) invert(1)"
                : "brightness(0) saturate(100%) invert(0.5)",
            }}
          />
          <span>
            {isSender
              ? "You deleted this message"
              : "This message was deleted"}
          </span>
        </div>
      );
    }

    if (!content) {
      return null;
    }

    const MAX_LINES = 15;
    const countLines = (text) => (text ? text.split("\n").length : 0);
    const truncateToLines = (text, maxLines) => {
      if (!text) return "";
      const lines = text.split("\n");
      if (lines.length <= maxLines) return text;
      return lines.slice(0, maxLines).join("\n") + "...";
    };
    const shouldShowReadMore = (text) =>
      countLines(text) > MAX_LINES || (text && text.length > 500);

    const needsReadMore = shouldShowReadMore(content);
    const displayText =
      needsReadMore && !isExpanded
        ? truncateToLines(content, MAX_LINES)
        : content;

    const linkifyText = (text) => {
      if (!text) return text;

      const urlRegex =
        /((?:https?:\/\/|www\.)[^\s]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}[^\s]*)/gi;
      const fileExtensionBlacklist = [
        "jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx",
        "ppt", "pptx", "zip", "rar", "mp3", "mp4", "avi",
      ];

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = urlRegex.exec(text)) !== null) {
        const url = match[0];
        const isBareDomain = !url.startsWith("http") && !url.startsWith("www");
        const charBefore = text[match.index - 1];

        if (isBareDomain) {
          const extension = url.split(".").pop().toLowerCase().replace(/[^a-z0-9]/gi, "");
          if (fileExtensionBlacklist.includes(extension)) {
            continue;
          }
          if (charBefore && /\S/.test(charBefore)) {
            continue;
          }
        }

        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        let cleanUrl = url;
        let trailingChars = "";
        const punctuation = ".,;!?";
        while (punctuation.includes(cleanUrl.slice(-1))) {
          trailingChars = cleanUrl.slice(-1) + trailingChars;
          cleanUrl = cleanUrl.slice(0, -1);
        }

        const href = cleanUrl.startsWith("http")
          ? cleanUrl
          : `https://${cleanUrl}`;

        parts.push(
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {cleanUrl}
          </a>
        );

        if (trailingChars) {
          parts.push(trailingChars);
        }

        lastIndex = urlRegex.lastIndex;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : [text];
    };

    const lines = displayText.split("\n");
    const formattedText = lines.map((line, index) => (
      <React.Fragment key={index}>
        {searchQuery && highlightSearchTerm
          ? highlightSearchTerm(line, searchQuery)
          : linkifyText(line)}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));

    return (
      <div>
        {formattedText}
        {needsReadMore && !isExpanded && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                isSender ? "text-white" : "text-[#4C0D68]"
              }`}
            >
              Read more
            </button>
          </div>
        )}
        {needsReadMore && isExpanded && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`text-xs font-medium underline hover:opacity-80 transition-opacity ${
                isSender ? "text-white" : "text-[#4C0D68]"
              }`}
            >
              Show less
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <>
    <BubbleTail isSender={isSender} shouldHaveTail={shouldHaveTail} />
      {shouldShowSenderName() && (
        <div
          className="font-semibold text-[14px]"
          style={{
            color: getSenderColor ? getSenderColor(sender_name) : "#4C0D68",
          }}
        >
          {sender_name}
        </div>
      )}

      {renderReply()}

      {image && (
        <div className={`w-64 ${isSender ? "" : ""}`}>
          <div
            className={`relative overflow-hidden aspect-square ${
              content && !is_deleted_globally ? "rounded-t-lg" : "rounded-lg"
            }`}
          >
            {imageLoading && !imageLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            )}

            {imageLoadError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 border border-gray-300">
                <svg
                  className="w-10 h-10 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-gray-500">
                  Image unavailable
                </span>
                <button
                  onClick={() => {
                    setImageLoadError(false);
                    setImageLoading(true);
                  }}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Retry
                </button>
              </div>
            ) : (
              <img
                src={image}
                alt="chat-img"
                crossOrigin="anonymous"
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleImageClick}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}

            {!content && !is_deleted_globally && (
              <div className="absolute bottom-1 right-1 flex items-center gap-1 p-1 rounded bg-black/50">
                <MessageStatus {...props} />
              </div>
            )}
          </div>

          {content && !is_deleted_globally && (
            <div
              className={`p-1 rounded-b-lg ${
                isSender ? "bg-[#4C0D68] text-white" : "bg-white text-black"
              }`}
            >
              <div className="flex items-end justify-between gap-2">
                <div className="flex-1 break-all leading-relaxed text-sm">
                  {renderMessageText()}
                </div>
                <MessageStatus {...props} />
              </div>
            </div>
          )}
        </div>
      )}

      {file && (
        <div className="mb-1">
          <div
            className={`flex flex-col gap-2 rounded-md p-2 ${
              isSender ? "bg-white" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src={assets.File}
                alt="file"
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="flex flex-col text-sm text-black min-w-0 flex-1">
                <span className="font-semibold break-words">{file.name}</span>
                <span className="text-xs text-gray-500">{file.size}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-6 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.url, "_blank");
                }}
              >
                Open
              </button>
              <button
                className="px-6 py-1 text-xs rounded-md border border-[#4C0D68] text-[#4C0D68] hover:bg-[#4C0D68] hover:text-white transition"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileDownload(file.url, file.name);
                }}
              >
                Save
              </button>
            </div>
          </div>
          {!content && !is_deleted_globally && (
            <div className="flex justify-end mt-1">
              <MessageStatus {...props} />
            </div>
          )}
        </div>
      )}

      {!image && (content || is_deleted_globally) && (
        <div
          className={`text-sm ${
            isSender ? "text-white" : "text-black"
          }`}
        >
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1 break-words leading-relaxed">
              {renderMessageText()}
            </div>
            {!is_deleted_globally && <MessageStatus {...props} />}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageRenderer;