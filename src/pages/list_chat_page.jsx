import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatContext } from '../api/use_chat_context';
import { assets } from '../assets/assets';
import { MdDoneAll } from 'react-icons/md';
import { FiX, FiSearch, FiTrash2 } from 'react-icons/fi';
import PesertaChatPage from './PesertaChatPage';
import GroupChatPeserta from './GroupChatPeserta';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ChatItem = ({
  id,
  avatar,
  name,
  lastMessage,
  time,
  unreadCount,
  isOnline,
  showCentang,
  showCentangAbu,
  onContextMenu,
  isSelected,
  highlightQuery,
  onClick
}) => {
  const highlightLastMessage = (text, query) => {
    if (!query) return text;
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
    pressTimer = setTimeout(() => {
      if (onContextMenu) onContextMenu(e, id);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <div
      onClick={() => onClick && onClick(id)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, id)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[70px]
        md:px-3 md:py-2 md:min-h-[52px]
        ${isSelected ? 'bg-[#efe6f3]' : 'hover:bg-gray-50'}
        transition-colors duration-150
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(id);
        }
      }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={avatar || assets.profile_list || assets.user}
          alt={name}
          className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-4 h-4 md:w-3 md:h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      <div className="flex-1 ml-4 md:ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate text-base md:text-[13px] leading-tight mb-1 md:mb-[2px]">
              {name}
            </h3>

            <div className="flex items-center gap-x-1 min-w-0">
              {showCentang && (
                <MdDoneAll className="text-base md:text-[14px] flex-shrink-0 text-blue-500" aria-hidden="true" />
              )}
              {!showCentang && showCentangAbu && (
                <MdDoneAll className="text-base md:text-[14px] flex-shrink-0 text-gray-400" aria-hidden="true" />
              )}

              <p className="text-gray-500 truncate text-sm md:text-[11px] leading-tight mt-0">
                {highlightLastMessage(lastMessage, highlightQuery)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end ml-3 shrink-0">
            <span className="text-xs md:text-[10px] text-gray-400 leading-tight">{time}</span>
            {unreadCount > 0 && (
              <span
                className="bg-purple-800 text-white text-xs md:text-[9px] rounded-full w-5 h-5 md:w-4 md:h-4 flex items-center justify-center leading-none mt-1"
                aria-label={`${unreadCount} unread`}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllChats, getChatById, deleteChat, activeChatId, setActiveChat, clearActiveChat } = useChatContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const allChats = getAllChats();

  const isGroupPage = location.pathname.startsWith('/group');
  const chats = isGroupPage 
    ? allChats.filter(chat => chat.type === 'group')
    : allChats;

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const menuRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const confirmRef = useRef(null);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;
    const tokens = q.split(/\s+/).filter(Boolean);
    return chats.filter(chat => {
      const hay = (chat.name + ' ' + chat.lastMessage).toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }, [searchQuery, chats]);

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  const handleChatClick = (chatId) => {
    const chat = getChatById(chatId);
    const currentIsMobile = window.innerWidth < 768;
    
    if (currentIsMobile) {
      if (chat?.type === 'group') {
        navigate(`/group/${chatId}`);
      } else {
        navigate(`/chats/${chatId}`);
      }
    } else {
      setActiveChat(chatId);
    }
  };

  const handleContextMenu = (e, chatId) => {
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

    setContextMenu({ visible: true, x: clickX, y: clickY, chatId });
  };

  const openConfirm = (chatId) => {
    setConfirmOpen(true);
    setChatToDelete(chatId);
    setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
  };

  const doDelete = () => {
    if (chatToDelete != null) {
      deleteChat(chatToDelete);
      // If deleting active chat, clear it
      if (chatToDelete === activeChatId) {
        clearActiveChat();
      }
    }
    closeConfirm();
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setChatToDelete(null);
  };

  useEffect(() => {
    clearActiveChat();
  }, [isGroupPage, clearActiveChat]);

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
  }, [isMobile, setActiveChat, clearActiveChat, location.pathname]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && activeChatId && !isMobile) {
        clearActiveChat();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeChatId, isMobile, clearActiveChat]);

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

  useEffect(() => {
    if (confirmOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [confirmOpen]);

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

  // Mobile-first layout
  return (
    <div className="h-full flex bg-white">
      <aside className="w-full md:w-[320px] md:max-w-xs md:border-r md:border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 md:px-4 md:pt-3 md:pb-2">
          <h2 className="text-xl font-semibold text-gray-800 md:text-lg">
            {isGroupPage ? 'Group' : 'Chats'}
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
                placeholder="Search here"
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
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0 elegant-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="p-4 md:p-3 text-base md:text-sm text-gray-500 text-center">
              No chats found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map(chat => (
                <ChatItem
                  key={chat.id}
                  {...chat}
                  onContextMenu={handleContextMenu}
                  onClick={handleChatClick}
                  isSelected={contextMenu.visible && contextMenu.chatId === chat.id}
                  highlightQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Desktop Right Panel */}
      <main className="flex-1 hidden md:block">
        {activeChatId ? (
          (() => {
            const activeChat = getChatById(activeChatId);
            if (activeChat?.type === 'group') {
              return <GroupChatPeserta chatId={activeChatId} isEmbedded={true} onClose={clearActiveChat} />;
            } else {
              return <PesertaChatPage chatId={activeChatId} isEmbedded={true} onClose={clearActiveChat} />;
            }
          })()
        ) : (
          <div className="w-full h-full border border-t-0 border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-32 h-32 mb-4 bg-white rounded-md flex items-center justify-center overflow-hidden">
              <img src={assets.logo || assets.user} alt="placeholder" className="w-full h-full object-contain opacity-60" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gypem Indonesia</h3>
            <p className="text-center text-gray-500 max-w-md text-sm">
              Silahkan tunggu pesan dari peserta sebelum memulai percakapan.
              Admin hanya dapat membalas pesan jika peserta telah mengirimkan pesan terlebih dahulu.
            </p>
          </div>
        )}
      </main>

      {/* Context Menu */}
      {contextMenu.visible && (
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
      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div ref={confirmRef} className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <div className="text-center">
              <h4 className="text-base text-gray-700 mb-4">
                Delete chat with <span className="font-semibold">&ldquo;{(chats.find(c=>c.id===chatToDelete)?.name) || ''}&rdquo;</span> ?
              </h4>
              <div className="mx-auto w-28 h-28 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                <img src={assets.popup_delete} alt="popup delete" className="w-35 h-35 object-contain" />
              </div>
              <div className="flex items-center justify-center gap-3 mt-1">
                <button
                  onClick={doDelete}
                  className="px-10 py-2 text-sm rounded-md bg-amber-400 text-white font-medium shadow-sm hover:bg-amber-500 hover:scale-105 active:scale-95 active:bg-amber-600 transition-transform duration-150"
                >
                  Delete
                </button>
                <button
                  onClick={closeConfirm}
                  className="px-10 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white font-medium shadow-sm hover:bg-gray-100 hover:scale-105 active:scale-95 active:bg-gray-200 transition-transform duration-150"
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