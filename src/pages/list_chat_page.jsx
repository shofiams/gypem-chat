import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatContext } from '../api/use_chat_context';
import { assets } from '../assets/assets';
import { MdDoneAll } from 'react-icons/md';
import { FiX, FiSearch, FiTrash2 } from 'react-icons/fi';
import PesertaChatPage from './PesertaChatPage';
import GroupChatPeserta from './GroupChatPeserta';
import { formatTime } from '../api/roomService';
import { useRooms, useRoomOperations } from '../hooks/useRooms';
import { useStarredMessages, useStarredMessagesSearch } from '../hooks/useStarredMessages';
import { useGlobalSearch } from '../hooks/useSearch';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const highlightId = urlParams.get('highlight');
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Tambahkan state loading

  // Determine page type based on location
  const isGroupPage = location.pathname.startsWith('/group');
  const isStarPage = location.pathname === '/starred';
  
  // Use appropriate hooks based on page type
  const { 
    rooms: allRooms, 
    loading: roomsLoading, 
    error: roomsError,
    refetch: refetchRooms 
  } = useRooms();
  
  const { 
    data: starredMessages, 
    loading: starredLoading, 
    error: starredError,
    refetch: refetchStarred 
  } = useStarredMessages({ manual: isStarPage ? false : true });
  
  const { 
    deleteRooms,
    loading: deleteLoading,
    error: deleteError 
  } = useRoomOperations();

  const {
    searchResults,
    loading: searchLoading,
    performSearch,
    clearSearch: clearGlobalSearch
  } = useGlobalSearch();

  const {
    searchResults: starredSearchResults,
    loading: starredSearchLoading,
    performSearch: performStarredSearch,
    clearSearch: clearStarredSearch
  } = useStarredMessagesSearch();

  // Get appropriate data based on page type
  const getPageData = () => {
    if (isStarPage) {
      return {
        data: starredMessages || [],
        loading: starredLoading,
        error: starredError
      };
    } else {
      const filteredRooms = isGroupPage 
        ? allRooms?.filter(room => room.room_type === 'group') || []
        : allRooms || [];
      
      return {
        data: filteredRooms,
        loading: roomsLoading,
        error: roomsError
      };
    }
  };

  const { data: chats, loading, error } = getPageData();

  // Context menu and delete confirmation states
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const menuRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const confirmRef = useRef(null);

  // Clear search when navigating between different page types
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const currentPathname = location.pathname;
    const prevPathname = prevPathnameRef.current;
    
    const getPageType = (pathname) => {
      if (pathname === '/starred') return 'starred';
      if (pathname.startsWith('/group') && pathname === '/group') return 'group';
      if (pathname.startsWith('/chats') && pathname === '/chats') return 'chats'; 
      if (pathname === '/chats' || pathname === '/') return 'chats';
      return null;
    };
    
    const currentPageType = getPageType(currentPathname);
    const prevPageType = getPageType(prevPathname);
    
    if (currentPageType && prevPageType && currentPageType !== prevPageType) {
      setSearchQuery('');
      clearGlobalSearch();
      clearStarredSearch();
    }
    
    prevPathnameRef.current = currentPathname;
  }, [location.pathname, clearGlobalSearch, clearStarredSearch]);

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        if (isStarPage) {
          performStarredSearch(searchQuery);
        } else {
          performSearch(searchQuery);
        }
      } else {
        clearGlobalSearch();
        clearStarredSearch();
      }
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, isStarPage, performSearch, performStarredSearch, clearGlobalSearch, clearStarredSearch]);

  // Get current search results based on page type
  const getCurrentSearchResults = () => {
    if (!searchQuery.trim()) return null;
    
    if (isStarPage) {
      return { starredMessages: starredSearchResults };
    } else {
      return searchResults;
    }
  };

  const currentSearchResults = getCurrentSearchResults();

  // Helper functions
  const setActiveChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const clearActiveChat = () => {
    setActiveChatId(null);
  };

  const getChatById = (chatId) => {
    return chats.find(chat => chat.room_id === chatId);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    clearGlobalSearch();
    clearStarredSearch();
  }, [clearGlobalSearch, clearStarredSearch]);

  // Handle chat click
  const handleChatClick = (itemId) => {
    if (isStarPage) {
      const starredItem = chats.find(item => item.message_id === itemId);
      if (!starredItem) return;

      const currentIsMobile = window.innerWidth < 768;
      
      if (currentIsMobile) {
        navigate(`/chats/${starredItem.room_id}?highlight=${starredItem.message_id}`);
      } else {
        setActiveChat(starredItem.room_id);
        setHighlightMessageId(starredItem.message_id);
      }
    } else {
      const chat = chats.find(c => c.room_id === itemId);
      const currentIsMobile = window.innerWidth < 768;
      
      if (currentIsMobile) {
        if (chat?.room_type === 'group') {
          navigate(`/group/${itemId}`);
        } else {
          navigate(`/chats/${itemId}`);
        }
      } else {
        setActiveChat(itemId);
      }
    }
  };

  // Handle context menu
  const handleContextMenu = (e, roomMemberId) => {
    if (isStarPage) return;
    
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 160;
    const menuHeight = 50;
    let clickX = e.clientX || e.touches?.[0]?.clientX || 100;
    let clickY = e.clientY || e.touches?.[0]?.clientY || 100;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (clickX + menuWidth + 8 > winW) clickX = winW - menuWidth - 8;
    if (clickY + menuHeight + 8 > winH) clickY = winH - menuHeight - 8;

    setContextMenu({ visible: true, x: clickX, y: clickY, chatId: roomMemberId });
  };

  // Delete operations
  const openConfirm = (roomMemberId) => {
    setConfirmOpen(true);
    setChatToDelete(roomMemberId);
    setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
  };

  const doDelete = async () => {
    if (chatToDelete != null) {
      setIsDeleting(true); // Set loading state ke true
      
      clearActiveChat();
      
      try {
        const result = await deleteRooms([chatToDelete]);
        if (result.success) {
          // Refresh data after successful delete
          if (isStarPage) {
            refetchStarred();
          } else {
            refetchRooms();
          }
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      } finally {
        setIsDeleting(false); // Set loading state ke false setelah selesai
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

  // Handle mobile/desktop transitions
  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      const prevIsMobile = isMobile;
      
      setIsMobile(currentIsMobile);
      
      if (prevIsMobile && !currentIsMobile) {
        const pathname = location.pathname;
        
        if (pathname.startsWith('/chats/') && pathname !== '/chats') {
          const chatId = pathname.split('/chats/')[1];
          setActiveChat(chatId);
        }
        else if (pathname.startsWith('/group/') && pathname !== '/group') {
          const groupId = pathname.split('/group/')[1];
          setActiveChat(groupId);
        }
      }
      else if (!prevIsMobile && currentIsMobile) {
        clearActiveChat();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && activeChatId && !isMobile) {
        clearActiveChat();
        if (isStarPage) setHighlightMessageId(null);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeChatId, isMobile, isStarPage]);

  // Handle clicks outside context menu and confirm dialog
  useEffect(() => {
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(cm => ({ ...cm, visible: false, chatId: null }));
      }
      if (confirmOpen && confirmRef.current && !confirmRef.current.contains(e.target)) {
        closeConfirm();
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') {
        setContextMenu(cm => ({ ...cm, visible: false, chatId: null }));
        if (confirmOpen) closeConfirm();
      }
    }
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onEsc);
    };
  }, [confirmOpen]);

  // Handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const activeChat = urlParams.get('activeChat');
    
    if (activeChat && !isMobile) {
      setActiveChat(activeChat);
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('activeChat');
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, isMobile]);

  // Ensure to clear the state after delete chat
  useEffect(() => {
    // Check if the current active chat still exists
    if (activeChatId && !isMobile) {
      const activeChat = getChatById(activeChatId);
      if (!activeChat) {
        // Active chat was deleted, clear it
        clearActiveChat();
        setHighlightMessageId(null);
      }
    }
  }, [activeChatId, chats, getChatById, clearActiveChat, isMobile]);

  useEffect(() => {
    // Listen untuk perubahan URL yang mengindikasikan chat baru dibuat
    const urlParams = new URLSearchParams(location.search);
    const refreshChat = urlParams.get('refreshChat');
    
    if (refreshChat === 'true') {
      // Refresh data
      if (isStarPage) {
        refetchStarred();
      } else {
        refetchRooms();
      }
      
      // Clean up URL parameter
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('refreshChat');
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, isStarPage, refetchRooms, refetchStarred]);

  useEffect(() => {
    const handleChatListRefresh = () => {
      console.log("Received chat list refresh event");
      if (isStarPage) {
        refetchStarred();
      } else {
        refetchRooms();
      }
    };

    // Listen untuk custom event
    window.addEventListener('chatListRefresh', handleChatListRefresh);
    
    return () => {
      window.removeEventListener('chatListRefresh', handleChatListRefresh);
    };
  }, [isStarPage, refetchRooms, refetchStarred]);

  // Enhanced scrollbar styling
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .elegant-scrollbar { 
        scrollbar-width: thin !important; 
        scrollbar-color: rgba(156, 163, 175, 0.3) transparent !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar { 
        width: 4px !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-track { 
        background: transparent !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-track-piece { 
        margin: 16px 0 !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-thumb { 
        background-color: rgba(156, 163, 175, 0.25) !important; 
        border-radius: 4px !important; 
        transition: background-color 0.2s ease !important; 
      }
      .elegant-scrollbar:hover::-webkit-scrollbar-thumb { 
        background-color: rgba(156, 163, 175, 0.5) !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-button { 
        display: none !important; 
        height: 0 !important; 
        width: 0 !important; 
      }
      .elegant-scrollbar::-webkit-scrollbar-corner {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const renderChatItems = (chats, options = {}) => {
    const {
      sectionTitle,
      onContextMenu = handleContextMenu,
      isSelected = (chat) => activeChatId === (chat.room_id || chat.message_id),
      isStarredItem = false,
      highlightQuery = searchQuery,
      showSectionHeader = false
    } = options;

    if (!chats || chats.length === 0) return null;

    return (
      <>
        {showSectionHeader && <SectionHeader title={sectionTitle} />}
        <div>
          {chats.map(chat => (
            <ChatItem
              key={isStarredItem ? chat.message_id : chat.room_id}
              // API fields for rooms
              room_id={chat.room_id}
              room_member_id={chat.room_member_id}
              room_type={chat.room_type}
              name={chat.name}
              description={chat.description}
              url_photo={chat.url_photo}
              last_message={chat.last_message}
              last_time={chat.last_time}
              unread_count={chat.unread_count}
              is_archived={chat.is_archived}
              is_pinned={chat.is_pinned}
              // API fields for starred messages
              message_id={chat.message_id}
              content={chat.content}
              sender={chat.sender}
              created_at={chat.created_at}
              file_type={chat.file_type}
              file_path={chat.file_path}
              reply_to_message={chat.reply_to_message}
              message_status={chat.message_status}
              // Component props
              onContextMenu={isStarredItem ? null : onContextMenu}
              onClick={handleChatClick}
              isSelected={!isMobile && (isStarredItem ? false : isSelected(chat))}
              highlightQuery={highlightQuery}
              isStarredItem={isStarredItem}
              chatName={isStarredItem ? `Room ${chat.room_id}` : chat.name} // Temporary, should get actual room name
            />
          ))}
        </div>
      </>
    );
  };

  // Get page title and placeholder text based on current page
  const getPageConfig = () => {
    if (isStarPage) {
      return {
        title: 'Starred Messages',
        searchPlaceholder: 'Search starred messages',
        emptyMessage: 'No starred messages found',
        placeholderText: 'Click on a starred message to view the conversation.'
      };
    } else if (isGroupPage) {
      return {
        title: 'Group',
        searchPlaceholder: 'Search here',
        emptyMessage: 'No chats found',
        placeholderText: 'Select a group to view messages.'
      };
    } else {
      return {
        title: 'Chats',
        searchPlaceholder: 'Search here',
        emptyMessage: 'No chats found',
        placeholderText: 'Select a chat to view messages.'
      };
    }
  };

  const pageConfig = getPageConfig();

  const SectionHeader = ({ title }) => (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{title}</span>
    </div>
  );

  const getFilteredChats = () => {
      if (isGroupPage) {
        return chats.filter(chat => chat.room_type === 'group');
      }
      return chats;
    };

  const displayChats = searchQuery.trim() ? null : getFilteredChats();

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
                {/* Gunakan sender_name dari API search result */}
                {highlightText(item.sender_name || 'Unknown', highlightQuery)}
              </h3>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-gray-600 text-sm md:text-[11px] flex-shrink-0">
                  {item.sender_name}:
                </span>
                <p className="text-gray-500 truncate text-sm md:text-[11px] leading-tight">
                  {/* Gunakan content dari API */}
                  {highlightText(item.content, highlightQuery)}
                </p>
              </div>
              {/* Tampilkan file info jika ada */}
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

  // Mobile-first layout
  return (
    <div className="h-full flex bg-white">
      <aside className="w-full md:w-[320px] md:max-w-xs md:border-r md:border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 md:px-4 md:pt-3 md:pb-2">
          <h2 className="text-xl font-semibold text-gray-800 md:text-lg">
            {pageConfig.title}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3 md:p-2">
          <div className="relative group">
            <div className="relative rounded-xl md:rounded-lg border border-gray-200 bg-gray-50 md:bg-white overflow-hidden">
              <div className="absolute left-4 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <FiSearch className="w-5 h-5 md:w-4 md:h-4" />
              </div>
              <input
                type="text"
                placeholder={pageConfig.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') clearSearch(); }}
                className="w-full pl-12 md:pl-10 pr-12 md:pr-10 py-3 md:py-2 bg-transparent rounded-xl md:rounded-lg text-base md:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5 md:w-4 md:h-4" />
                </button>
              )}
              <span className="absolute left-0 right-0 bottom-0 h-1 transform scale-x-0 origin-left 
                bg-[#4C0D68] pointer-events-none group-focus-within:scale-x-100"
              />
            </div>
          </div>
        </div>

        {/* Messages Label for star page */}
        {isStarPage && (
          <div className="px-4 pt-2 pb-1">
            <span className="text-[14px] text-gray-400">Messages</span>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 elegant-scrollbar">
          {searchQuery.trim() ? (
            // Search results view
            <>
              {isStarPage ? (
                // Starred messages search results - menggunakan API structure langsung
                searchResults?.starredMessages?.length === 0 ? (
                  <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                    No starred messages found
                  </div>
                ) : (
                  renderChatItems(searchResults?.starredMessages, { 
                    isStarredItem: true 
                  })
                )
              ) : (
                // Chat and Group search results - menggunakan API structure
                <>
                  {/* One-to-One Chats - filter dari searchResults.rooms */}
                  {searchResults?.rooms?.filter(room => room.room_type === 'one_to_one')?.length > 0 && (
                    renderChatItems(searchResults.rooms.filter(room => room.room_type === 'one_to_one'))
                  )}
                  
                  {/* Groups - filter dari searchResults.rooms */}
                  {searchResults?.rooms?.filter(room => room.room_type === 'group')?.length > 0 && (
                    renderChatItems(searchResults.rooms.filter(room => room.room_type === 'group'), { 
                      sectionTitle: "Groups", 
                      showSectionHeader: true 
                    })
                  )}

                  {/* Messages Section - menggunakan API structure */}
                  {searchResults?.messages?.length > 0 && (
                    <>
                      <SectionHeader title="Messages" />
                      <div>
                        {searchResults.messages.map(message => (
                          <MessageItem
                            key={message.message_id}
                            item={message}
                            highlightQuery={searchQuery}
                            onClick={(id) => {
                              // Navigate berdasarkan message, cari room_id dari context atau API
                              const currentIsMobile = window.innerWidth < 768;
                              if (currentIsMobile) {
                                navigate(`/chats/${message.room_id || id}?highlight=${message.message_id}`);
                              } else {
                                setActiveChat(message.room_id || id);
                                setHighlightMessageId(message.message_id);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* No results message */}
                  {(!searchResults?.rooms?.length && !searchResults?.messages?.length) && (
                    <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                      {pageConfig.emptyMessage}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Default view (no search) - filter berdasarkan room_type
            displayChats?.length === 0 ? (
              <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
                {pageConfig.emptyMessage}
              </div>
            ) : (
              renderChatItems(displayChats, { isStarredItem: isStarPage })
            )
          )}
        </div>
      </aside>

      {/* Desktop Right Panel */}
      <main className="flex-1 hidden md:block">
        {activeChatId && getChatById(activeChatId) ? (
          (() => {
            const activeChat = getChatById(activeChatId);
            if (activeChat?.type === 'group') {
              return (
                <GroupChatPeserta 
                  chatId={activeChatId} 
                  isEmbedded={true} 
                  onClose={() => {
                    clearActiveChat();
                    if (isStarPage) setHighlightMessageId(null);
                  }}
                  highlightMessageId={isStarPage ? highlightMessageId : highlightId}
                  onMessageHighlight={isStarPage ? () => setHighlightMessageId(null) : null}
                />
              );
            } else {
              return (
                <PesertaChatPage 
                  chatId={activeChatId} 
                  isEmbedded={true} 
                  onClose={() => {
                    clearActiveChat();
                    if (isStarPage) setHighlightMessageId(null);
                  }}
                  highlightMessageId={isStarPage ? highlightMessageId : highlightId}
                  onMessageHighlight={isStarPage ? () => setHighlightMessageId(null) : null}
                />
              );
            }
          })()
        ) : (
          <div className="w-full h-full border border-t-0 border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-32 h-32 mb-4 bg-white rounded-md flex items-center justify-center overflow-hidden">
              <img src={assets.logo || assets.user} alt="placeholder" className="w-full h-full object-contain opacity-60" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gypem Indonesia</h3>
            <p className="text-center text-gray-500 max-w-md text-sm">
              {pageConfig.placeholderText}
            </p>
          </div>
        )}
      </main>

      {/* Context Menu */}
      {!isStarPage && contextMenu.visible && (
        <div
          ref={menuRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed z-50 w-[160px] rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => openConfirm(contextMenu.chatId)}
            className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {!isStarPage && confirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          <div ref={confirmRef} className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <div className="text-center">
              <h4 className="text-base text-gray-700 mb-4">
                Delete chat with <span className="font-semibold">&ldquo;{getChatToDeleteName()}&rdquo;</span> ?
              </h4>
              <div className="mx-auto w-28 h-28 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                <img src={assets.popup_delete} alt="popup delete" className="w-35 h-35 object-contain" />
              </div>
              <div className="flex items-center justify-center gap-3 mt-1">
                <button
                  onClick={doDelete}
                  disabled={isDeleting}
                  className="px-10 py-2 text-sm rounded-md bg-amber-400 text-white font-medium shadow-sm hover:bg-amber-500 hover:scale-105 active:scale-95 active:bg-amber-600 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-amber-400 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  onClick={closeConfirm}
                  disabled={isDeleting}
                  className="px-10 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white font-medium shadow-sm hover:bg-gray-100 hover:scale-105 active:scale-95 active:bg-gray-200 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>    
          </div>
        </div>
      )}
    </div>
  );
}