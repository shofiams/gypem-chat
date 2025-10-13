import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRooms, useRoomOperations } from '../../hooks/useRooms';
import { useStarredMessages, useStarredMessagesSearch } from '../../hooks/useStarredMessages';
import { useGlobalSearch } from '../../hooks/useSearch';
import { useAdmins } from '../../hooks/useAdmins';
import ChatItem from '../../components/chat/ChatItem';
import { useChatContext } from '../../api/use_chat_context';

// Import komponen modular
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChatList from './components/ChatList';
import RightPanel from './components/RightPanel';
import ContextMenu from './components/ContextMenu';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const highlightId = urlParams.get('highlight');

    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [highlightMessageId, setHighlightMessageId] = useState(null);
    //const [activeChatId, setActiveChatId] = useState(null);
    const { activeChatId, setActiveChat, clearActiveChat } = useChatContext();
    const [isDeleting, setIsDeleting] = useState(false);
    const { refetch: refetchAdmins } = useAdmins({ manual: true });

    const isGroupPage = location.pathname.startsWith('/group');
    const isStarPage = location.pathname === '/starred';

    const { rooms: allRooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
    const { data: starredMessages, loading: starredLoading, error: starredError, refetch: refetchStarred } = useStarredMessages({ manual: !isStarPage });
    const { deleteRooms } = useRoomOperations();
    const { searchResults, performSearch, clearSearch: clearGlobalSearch } = useGlobalSearch();
    const { searchResults: starredSearchResults, performSearch: performStarredSearch, clearSearch: clearStarredSearch } = useStarredMessagesSearch();

     const getPageData = () => {
        if (isStarPage) {
            // Logika baru: Perkaya data starredMessages dengan room_type dari allRooms
            const augmentedStarredMessages = (starredMessages || []).map(msg => {
                const room = (allRooms || []).find(r => r.room_id === msg.room_id);
                return {
                    ...msg,
                    // Tambahkan room_type, default ke 'one_to_one' jika tidak ditemukan
                    room_type: room ? room.room_type : 'one_to_one' 
                };
            });
            return { data: augmentedStarredMessages, loading: starredLoading, error: starredError };
        }
        // Logika lama (tidak berubah)
        const filteredRooms = isGroupPage ? allRooms?.filter(room => room.room_type === 'group') || [] : allRooms || [];
        return { data: filteredRooms, loading: roomsLoading, error: roomsError };
    };

    const { data: chats } = getPageData();

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
    const menuRef = useRef(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const confirmRef = useRef(null);

    const prevPathnameRef = useRef(location.pathname);

    useEffect(() => {
        const currentPathname = location.pathname;
        const getPageType = (pathname) => {
            if (pathname === '/starred') return 'starred';
            if (pathname.startsWith('/group') && pathname === '/group') return 'group';
            if (pathname.startsWith('/chats') && pathname === '/chats') return 'chats';
            if (pathname === '/chats' || pathname === '/') return 'chats';
            return null;
        };
        if (getPageType(currentPathname) !== getPageType(prevPathnameRef.current)) {
            setSearchQuery('');
            clearGlobalSearch();
            clearStarredSearch();
        }
        prevPathnameRef.current = currentPathname;
    }, [location.pathname, clearGlobalSearch, clearStarredSearch]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery.trim()) {
                isStarPage ? performStarredSearch(searchQuery) : performSearch(searchQuery);
            } else {
                clearGlobalSearch();
                clearStarredSearch();
            }
        }, 300);
        return () => clearTimeout(delayedSearch);
    }, [searchQuery, isStarPage, performSearch, performStarredSearch, clearGlobalSearch, clearStarredSearch]);

    const currentSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        return isStarPage ? { starredMessages: starredSearchResults } : searchResults;
    }, [searchQuery, isStarPage, searchResults, starredSearchResults]);
    
    //const setActiveChat = (chatId) => setActiveChatId(chatId);
    //const clearActiveChat = () => setActiveChatId(null);
    const getChatById = (chatId) => chats.find(chat => chat.room_id === chatId);
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        clearGlobalSearch();
        clearStarredSearch();
    }, [clearGlobalSearch, clearStarredSearch]);
    
    const handleChatClick = (itemId) => {
        const currentIsMobile = window.innerWidth < 768;
        if (isStarPage) {
            const starredItem = chats.find(item => item.message_id === itemId);
            if (!starredItem) return;
           if (currentIsMobile) {
                const path = starredItem.room_type === 'group' ? '/group/' : '/chats/';
                navigate(`${path}${starredItem.room_id}?highlight=${starredItem.message_id}`);
            } else {
                setActiveChat(starredItem.room_id);
                setHighlightMessageId(starredItem.message_id);
            }
        } else {
            const chat = chats.find(c => c.room_id === itemId);
            if (currentIsMobile) {
                navigate(chat?.room_type === 'group' ? `/group/${itemId}` : `/chats/${itemId}`);
            } else {
                setActiveChat(itemId);
            }
        }
    };
    
    const handleContextMenu = (e, roomMemberId) => {
        if (isStarPage) return;
        e.preventDefault();
        e.stopPropagation();
        const { clientX: x, clientY: y } = e;
        setContextMenu({ visible: true, x, y, chatId: roomMemberId });
    };
    
    const openConfirm = (roomMemberId) => {
        setConfirmOpen(true);
        setChatToDelete(roomMemberId);
        setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
    };

    const doDelete = async () => {
        if (chatToDelete != null) {
            setIsDeleting(true);
            clearActiveChat();
            try {
                const result = await deleteRooms([chatToDelete]);
                if (result.success) {
                    isStarPage ? refetchStarred() : refetchRooms();
                    refetchAdmins();
                }
            } catch (error) {
                console.error('Failed to delete chat:', error);
            } finally {
                setIsDeleting(false);
            }
            setHighlightMessageId(null);
        }
        closeConfirm();
    };

    const closeConfirm = () => {
        setConfirmOpen(false);
        setChatToDelete(null);
    };

    const getChatToDeleteName = () => {
        if (!chatToDelete) return '';
        const chat = chats.find(c => c.room_member_id === chatToDelete);
        return chat?.name || '';
    };

    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth < 768;
            if (isMobile && !currentIsMobile) { // from mobile to desktop
                const chatId = location.pathname.split('/')[2];
                if (chatId) setActiveChat(chatId);
            } else if (!isMobile && currentIsMobile) { // from desktop to mobile
                clearActiveChat();
            }
            setIsMobile(currentIsMobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile, location.pathname]);

    // Tambahkan useEffect ini di index.jsx sekitar baris 178-183
useEffect(() => {
    const handleSetActiveChat = (event) => {
        const { chatId } = event.detail;
        console.log('setActiveChat event received, chatId:', chatId); // untuk debugging
        setActiveChat(chatId);
    };
    
    window.addEventListener('setActiveChat', handleSetActiveChat);
    
    return () => {
        window.removeEventListener('setActiveChat', handleSetActiveChat);
    };
}, [setActiveChat]);

    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                if (activeChatId && !isMobile) {
                    clearActiveChat();
                    if (isStarPage) setHighlightMessageId(null);
                }
                if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
                if (confirmOpen) closeConfirm();
            }
        };
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setContextMenu({ ...contextMenu, visible: false });
            }
            if (confirmRef.current && !confirmRef.current.contains(e.target)) {
                closeConfirm();
            }
        };
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeChatId, isMobile, isStarPage, contextMenu, confirmOpen]);
    
    useEffect(() => {
        const handleChatListRefresh = () => {
            isStarPage ? refetchStarred() : refetchRooms();
        };
        window.addEventListener('chatListRefresh', handleChatListRefresh);
        return () => window.removeEventListener('chatListRefresh', handleChatListRefresh);
    }, [isStarPage, refetchRooms, refetchStarred]);

   const renderChatItems = (items, options = {}) => {
        const { onContextMenu = handleContextMenu, isStarredItem = false } = options;
        if (!items || items.length === 0) return null;
        return (
            <div>
                {items.map(chat => (
                    <ChatItem
                        key={isStarredItem ? chat.message_id : chat.room_id}
                        {...chat}
                        onContextMenu={isStarredItem ? null : onContextMenu}
                        onClick={handleChatClick}
                        isSelected={!isMobile && activeChatId === chat.room_id}
                        highlightQuery={searchQuery}
                        isStarredItem={isStarredItem}
                        chatName={isStarredItem ? chat.room_name : chat.name}
                    />
                ))}
            </div>
        );
    };

    const pageConfig = useMemo(() => {
        if (isStarPage) return { title: 'Starred Messages', searchPlaceholder: 'Search starred messages', emptyMessage: 'No starred messages found', placeholderText: 'Click on a starred message to view the conversation.' };
        if (isGroupPage) return { title: 'Group', searchPlaceholder: 'Search here', emptyMessage: 'No chats found', placeholderText: 'Select a group to view messages.' };
        return { title: 'Chats', searchPlaceholder: 'Search here', emptyMessage: 'No chats found', placeholderText: 'Select a chat to view messages.' };
    }, [isStarPage, isGroupPage]);

    return (
        <div className="h-full flex bg-white">
            <aside className="w-full md:w-[320px] md:max-w-xs md:border-r md:border-gray-100 flex flex-col">
                <Header title={pageConfig.title} />
                <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder={pageConfig.searchPlaceholder}
                    clearSearch={clearSearch}
                />
                {isStarPage && (
                    <div className="px-4 pt-2 pb-1">
                        <span className="text-[14px] text-gray-400">Messages</span>
                    </div>
                )}
                <ChatList
                    chats={getChatById ? chats.filter(chat => isGroupPage ? chat.room_type === 'group' : true) : chats}
                    searchQuery={searchQuery}
                    searchResults={currentSearchResults}
                    isStarPage={isStarPage}
                    pageConfig={pageConfig}
                    renderChatItems={renderChatItems}
                    handleMessageClick={(id) => {
                        const message = currentSearchResults.messages.find(m => m.message_id === id);
                        if(message) {
                           const currentIsMobile = window.innerWidth < 768;
                            if (currentIsMobile) {
                                navigate(`/chats/${message.room_id}?highlight=${message.message_id}`);
                            } else {
                                setActiveChat(message.room_id);
                                setHighlightMessageId(message.message_id);
                            }
                        }
                    }}
                />
            </aside>

            <main className="flex-1 hidden md:block">
                <RightPanel
                    activeChat={getChatById(activeChatId)}
                    pageConfig={pageConfig}
                    isStarPage={isStarPage}
                    highlightId={highlightId}
                    highlightMessageId={highlightMessageId}
                    clearActiveChat={clearActiveChat}
                    setHighlightMessageId={setHighlightMessageId}
                />
            </main>

            {!isStarPage && (
                <ContextMenu
                    visible={contextMenu.visible}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    menuRef={menuRef}
                    onOpenConfirm={openConfirm}
                    chatId={contextMenu.chatId}
                />
            )}

            {!isStarPage && (
                <DeleteConfirmationModal
                    isOpen={confirmOpen}
                    onClose={closeConfirm}
                    onConfirm={doDelete}
                    confirmRef={confirmRef}
                    chatName={getChatToDeleteName()}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}