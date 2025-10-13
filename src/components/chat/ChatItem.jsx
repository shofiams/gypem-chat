// src/components/chat/ChatItem.jsx
import React from 'react';
import { assets } from '../../assets/assets';
import { formatTime } from '../../api/roomService';
import { escapeRegex } from '../../utils/regex';
import { useChatContext } from '../../api/use_chat_context';

const ChatItem = ({
    room_id,
    room_member_id,
    room_type,
    name,
    description,
    url_photo,
    last_message,
    last_message_type,
    last_time,
    unread_count,
    is_archived,
    is_pinned,
    is_last_message_mine,
    last_message_status,
    last_message_updated_at,
    last_message_created_at,
    last_message_is_starred,
    last_message_is_pinned,
    last_message_is_deleted,
    message_id,
    content,
    sender,
    created_at,
    file_type,
    file_path,
    reply_to_message,
    message_status,
    onContextMenu,
    isSelected,
    highlightQuery,
    onClick,
    isStarredItem = false,
    chatName,
    admin_id,
}) => {

    const { onlineUsers } = useChatContext();

    const onlineUserKey = `admin-${admin_id}`;
    const isOnline = room_type === 'one_to_one' && onlineUsers.has(onlineUserKey);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("/api/", "");

    const getPhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}/uploads/${url}`;
    };

    const renderLastMessageContent = () => {
        const messageType = last_message_type || 'text';
        
        if (messageType === 'image') {
            return (
                <div className="flex items-center gap-1">
                    <img 
                        src={assets.ImageIcon || assets.DefaultAvatar} 
                        alt="image" 
                        className="w-4 h-4 md:w-3.5 md:h-3.5"
                    />
                    <span>{last_message || 'Photo'}</span>
                </div>
            );
        }
        
        if (messageType === 'dokumen') {
            return (
                <div className="flex items-center gap-1">
                    <img 
                        src={assets.DocumentIcon || assets.DefaultAvatar} 
                        alt="document" 
                        className="w-4 h-4 md:w-3.5 md:h-3.5"
                    />
                    <span>{last_message || 'Document'}</span>
                </div>
            );
        }
        
        return <span>{last_message}</span>;
    };

    const renderLastMessageStatus = () => {
        if (!is_last_message_mine) return null;
        
        const wasEdited = last_message_updated_at && 
            new Date(last_message_updated_at) > new Date(last_message_created_at);
        
        return (
            <div className="flex items-center gap-0.5 flex-shrink-0 mr-1">
                {wasEdited && (
                    <span className="text-[9px] md:text-[8px] opacity-70 mr-0.5">diedit</span>
                )}

                {last_message_is_starred && !last_message_is_deleted && (
                    <img
                        src={assets.StarFill2}
                        alt="starred"
                        className="w-3 h-3 md:w-2.5 md:h-2.5"
                        style={{
                            filter: "brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)",
                        }}
                    />
                )}

                {last_message_is_pinned && !last_message_is_deleted && (
                    <img
                        src={assets.PinFill}
                        alt="pinned"
                        className="w-3 h-3 md:w-2.5 md:h-2.5"
                        style={{
                            filter: "brightness(0) saturate(100%) invert(14%) sepia(71%) saturate(2034%) hue-rotate(269deg) brightness(92%) contrast(100%)",
                        }}
                    />
                )}

                <img
                    src={assets.Ceklis}
                    alt="sent"
                    className="w-4 h-4 md:w-3.5 md:h-3.5"
                    style={{
                        filter: "brightness(0) saturate(100%) invert(48%) sepia(85%) saturate(1374%) hue-rotate(186deg) brightness(97%) contrast(96%)",
                    }}
                />
            </div>
        );
    };

    const highlightText = (text, query) => {
        if (!isStarredItem || !query) return text;
        const q = query.trim();
        if (!q) return text;

        const tokens = q.split(/\s+/).filter(Boolean).map(t => t.toLowerCase());
        if (tokens.length === 0) return text;

        const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
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
            <div className="relative flex-shrink-0 w-12 h-12 md:w-10 md:h-10">
                <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                        src={url_photo ? getPhotoUrl(url_photo) : assets.DefaultAvatar}
                        alt={name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                </div>
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 md:w-3 md:h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                )}
            </div>

                <div className="flex-1 ml-4 md:ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate text-base md:text-[13px] leading-tight mb-1 md:mb-[2px]">
                                {name}
                            </h3>

                            <div className="flex items-center gap-x-1 min-w-0">
                                {renderLastMessageStatus()}
                                
                                <p className="text-gray-500 truncate text-sm md:text-[11px] leading-tight mt-0 flex items-center">
                                    {renderLastMessageContent()}
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