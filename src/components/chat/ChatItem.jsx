import React from 'react';
import { assets } from '../../assets/assets';
import { formatTime } from '../../api/roomService';
import { escapeRegex } from '../../utils/regex';

const ChatItem = ({
    room_id,
    room_member_id,
    room_type,
    name,
    description,
    url_photo,
    last_message,
    last_time,
    unread_count,
    is_archived,
    is_pinned,
    // API fields for starred messages
    message_id,
    content,
    sender,
    created_at,
    file_type,
    file_path,
    reply_to_message,
    message_status,
    // Component props
    onContextMenu,
    isSelected,
    highlightQuery,
    onClick,
    isStarredItem = false,
    chatName
}) => {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("/api/", "");

    const getPhotoUrl = (url) => {
        if (!url) return assets.user;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}/uploads/${url}`;
    };

    const highlightText = (text, query) => {
        if (!isStarredItem || !query) return text;
        const q = query.trim();
        if (!q) return text;

        const tokens = q.split(/\s+/).filter(Boolean).map(t => t.toLowerCase());
        if (tokens.length === 0) return text;

        const pattern = tokens.map(escapeRegex).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');

        const parts = String(text).split(regex);
        return parts.map((part, i) => {
            if (!part) return part;
            const lower = part.toLowerCase();
            const isMatch = tokens.some(tok => tok === lower);
            if (isMatch) {
                return (
                    <span key={i} className="font-semibold" style={{ color: '#4C0D68' }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    // Long press for mobile
    let pressTimer = null;

    const handleTouchStart = (e) => {
        if (onContextMenu) {
            pressTimer = setTimeout(() => {
                onContextMenu(e, room_member_id);
            }, 600);
        }
    };

    const handleTouchEnd = () => {
        if (pressTimer) clearTimeout(pressTimer);
    };

    // Different layout for starred items
    if (isStarredItem) {
        const displayTime = formatTime(created_at);
        const displayMessage = content;
        const displayName = chatName || sender;

        return (
            <div
                onClick={() => onClick && onClick(message_id)}
                role="button"
                tabIndex={0}
                className="w-full"
            >
                <div className="flex items-start px-4 py-3 cursor-pointer min-h-[56px] md:px-3 md:py-2 md:min-h-[52px] hover:bg-gray-100 transition-colors duration-150 mx-2 rounded-lg relative">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 py-1">
                                <h3 className="font-semibold text-gray-900 truncate text-[12px] md:text-[13px] leading-tight mb-[3px]">
                                    {highlightText(displayName, highlightQuery)}
                                    {room_type === 'group' && (
                                        <span className="ml-1 text-gray-400">(Group)</span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className="font-medium text-gray-600 text-[10px] md:text-[11px] flex-shrink-0">
                                        {sender}:
                                    </span>
                                    <p className="text-gray-400 truncate text-[10px] md:text-[11px] leading-tight min-w-0">
                                        {highlightText(displayMessage, highlightQuery)}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 ml-3 text-right">
                                <span className="text-[10px] text-gray-400 leading-tight">{displayTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 border-b border-gray-100"></div>
                </div>
            </div>
        );
    }

    // Regular chat item layout
    const displayTime = formatTime(last_time);

    return (
        <div
            onClick={() => onClick && onClick(room_id)}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, room_member_id)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick && onClick(room_id);
                }
            }}
            className="w-full"
        >
            <div
                className={`
          flex items-center px-4 py-3 cursor-pointer min-h-[70px] 
          md:px-3 md:py-2 md:min-h-[52px]
          ${isSelected ? 'bg-[#efe6f3]' : 'hover:bg-gray-100'}
          transition-colors duration-150
          rounded-lg
          mx-2
          relative
        `}
            >
                <div className="relative flex-shrink-0">
                    <img
                        src={getPhotoUrl(url_photo)}
                        alt={name}
                        className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover"
                        crossOrigin="anonymous"
                        onLoad={() => console.log("✅ Image loaded:", getPhotoUrl(url_photo))}
                        onError={(e) => {
                            console.error("❌ Image error:", getPhotoUrl(url_photo));
                            console.error("Error details:", e);
                            if (e.target.src !== assets.user) {
                                e.target.src = assets.user;
                            }
                        }}
                    />
                </div>

                <div className="flex-1 ml-4 md:ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate text-base md:text-[13px] leading-tight mb-1 md:mb-[2px]">
                                {name}
                            </h3>

                            <div className="flex items-center gap-x-1 min-w-0">
                                <p className="text-gray-500 truncate text-sm md:text-[11px] leading-tight mt-0">
                                    {last_message}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end ml-3 shrink-0">
                            <span className="text-xs md:text-[10px] text-gray-400 leading-tight">{displayTime}</span>
                            {unread_count > 0 && (
                                <span
                                    className="bg-purple-800 text-white text-xs md:text-[9px] rounded-full w-5 h-5 md:w-4 md:h-4 flex items-center justify-center leading-none mt-1"
                                    aria-label={`${unread_count} unread`}
                                >
                                    {unread_count}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-1 right-1 border-b border-gray-100"></div>
            </div>
        </div>
    );
};

export default ChatItem;