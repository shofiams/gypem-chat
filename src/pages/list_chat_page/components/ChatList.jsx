import React from 'react';
import ChatItem from '../../../components/chat/ChatItem'; // Path disesuaikan
import { formatTime } from '../../../api/roomService'; // Path disesuaikan

const SectionHeader = ({ title }) => (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600">{title}</span>
    </div>
);

const MessageItem = ({ item, highlightQuery, onClick }) => {
    const highlightText = (text, query) => {
        if (!query) return text;
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

    return (
        <div
            onClick={() => onClick && onClick(item.message_id)}
            className="flex items-start px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
            role="button"
            tabIndex={0}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate text-base md:text-[13px] leading-tight mb-1">
                            {highlightText(item.sender_name || 'Unknown', highlightQuery)}
                        </h3>
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="font-medium text-gray-600 text-sm md:text-[11px] flex-shrink-0">
                                {item.sender_name}:
                            </span>
                            <p className="text-gray-500 truncate text-sm md:text-[11px] leading-tight">
                                {highlightText(item.content, highlightQuery)}
                            </p>
                        </div>
                        {item.file_type && item.file_type !== 'text' && (
                            <div className="mt-1">
                                <span className="text-xs text-blue-600">
                                    {item.file_type}: {item.file_name}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 ml-3">
                        <span className="text-xs md:text-[10px] text-gray-400">
                            {formatTime(item.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatList = ({ 
    chats, 
    searchQuery,
    isLoading,
    searchResults,
    isStarPage,
    pageConfig,
    renderChatItems,
    handleMessageClick 
}) => {
    const displayChats = searchQuery.trim() ? null : chats;

    return (
        <div className="flex-1 overflow-y-auto min-h-0 elegant-scrollbar">
            {/* --- AWAL PERUBAHAN --- */}
            {isLoading ? (
                <div className="flex items-center justify-center p-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </div>
            ) : searchQuery.trim() ? (
                <>
                    {isStarPage ? (
                        searchResults?.starredMessages?.length === 0 ? (
                            <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                                No starred messages found
                            </div>
                        ) : (
                            renderChatItems(searchResults?.starredMessages, { isStarredItem: true })
                        )
                    ) : (
                        <>
                            {searchResults?.rooms?.filter(room => room.room_type === 'one_to_one')?.length > 0 && (
                                renderChatItems(searchResults.rooms.filter(room => room.room_type === 'one_to_one'))
                            )}
                            {searchResults?.rooms?.filter(room => room.room_type === 'group')?.length > 0 && (
                                renderChatItems(searchResults.rooms.filter(room => room.room_type === 'group'), {
                                    sectionTitle: "Groups",
                                    showSectionHeader: true
                                })
                            )}
                            {searchResults?.messages?.length > 0 && (
                                <>
                                    <SectionHeader title="Messages" />
                                    <div>
                                        {searchResults.messages.map(message => (
                                            <MessageItem
                                                key={message.message_id}
                                                item={message}
                                                highlightQuery={searchQuery}
                                                onClick={handleMessageClick}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                            {(!searchResults?.rooms?.length && !searchResults?.messages?.length) && (
                                <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                                    {pageConfig.emptyMessage}
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                displayChats?.length === 0 ? (
                    <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                        {pageConfig.emptyMessage}
                    </div>
                ) : (
                    renderChatItems(displayChats, { isStarredItem: isStarPage })
                )
            )}
            {/* --- AKHIR PERUBAHAN --- */}
        </div>
    );
};

export default ChatList;