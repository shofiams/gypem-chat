// src/pages/chat_page.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { MdDoneAll } from 'react-icons/md';
import { FiX, FiSearch, FiTrash2 } from 'react-icons/fi';

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
  highlightQuery // <-- pass from parent; used only for lastMessage
}) => {
  const highlightLastMessage = (text, query) => {
    if (!query) return text;
    const q = query.trim();
    if (!q) return text;

    const tokens = q.split(/\s+/).filter(Boolean).map(t => t.toLowerCase());
    if (tokens.length === 0) return text;

    const pattern = tokens.map(escapeRegex).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const parts = String(text).split(regex); // split keeps matches (because of capturing group)
    return parts.map((part, i) => {
      if (!part) return part;
      // check if this part is one of the matched tokens (case-insensitive)
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
      onContextMenu={(e) => onContextMenu && onContextMenu(e, id)}
      className={`
        flex items-center px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[52px]
        ${isSelected ? 'bg-[#efe6f3]' : 'hover:bg-gray-50'}
      `}
      role="button"
      tabIndex={0}
    >
      <div className="relative flex-shrink-0">
        <img
          src={avatar || assets.profile_list || assets.user}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            {/* NAME stays unchanged */}
            <h3 className="font-medium text-gray-900 truncate text-[13px] leading-tight mb-[2px]">
              {name}
            </h3>

            <div className="flex items-center gap-x-1 min-w-0">
              {showCentang && (
                <MdDoneAll className="text-[14px] flex-shrink-0 text-blue-500" aria-hidden="true" />
              )}
              {!showCentang && showCentangAbu && (
                <MdDoneAll className="text-[14px] flex-shrink-0 text-gray-400" aria-hidden="true" />
              )}

              {/* lastMessage: highlight only here */}
              <p className="text-gray-500 truncate text-[11px] leading-tight mt-0">
                {highlightLastMessage(lastMessage, highlightQuery)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end ml-3 shrink-0">
            <span className="text-[10px] text-gray-400 leading-tight">{time}</span>
            {unreadCount > 0 && (
              <span
                className="bg-purple-800 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none mt-1"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([
    { id: 1, name: "Class All", lastMessage: "Hi, I have a problem with the...", time: "10:15", unreadCount: 3, avatar: null, isOnline: false, showCentang: false, showCentangAbu: false },
    { id: 2, name: "Olympiad Moon", lastMessage: "Pesan terkirim", time: "10:15", unreadCount: 1, avatar: null, isOnline: true, showCentang: true, showCentangAbu: false },
    { id: 3, name: "Olympiade Star", lastMessage: "Belum dibaca nih", time: "10:15", unreadCount: 11, avatar: null, isOnline: false, showCentang: false, showCentangAbu: true },
    { id: 4, name: "Admin Gypem", lastMessage: "Sudah dibaca", time: "10:15", unreadCount: 0, avatar: null, isOnline: true, showCentang: true, showCentangAbu: false },
    { id: 5, name: "Admin WITA", lastMessage: "Gimana sih itu...", time: "10:09", unreadCount: 0, avatar: null, isOnline: false, showCentang: false, showCentangAbu: true },
    { id: 6, name: "Admin WIB", lastMessage: "Mongols", time: "10:02", unreadCount: 0, avatar: null, isOnline: false, showCentang: false, showCentangAbu: false },
  ]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const menuRef = useRef(null);

  // Modal confirm state
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

  // handle right click: show context menu
  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    const menuWidth = 160;
    const menuHeight = 50;
    let clickX = e.clientX;
    let clickY = e.clientY;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (clickX + menuWidth + 8 > winW) clickX = winW - menuWidth - 8;
    if (clickY + menuHeight + 8 > winH) clickY = winH - menuHeight - 8;

    setContextMenu({ visible: true, x: clickX, y: clickY, chatId });
  };

  // open confirm modal (called when user clicks Delete in context menu)
  const openConfirm = (chatId) => {
    setConfirmOpen(true);
    setChatToDelete(chatId);
    // close context menu
    setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
  };

  // actually delete chat
  const doDelete = () => {
    if (chatToDelete != null) {
      setChats(prev => prev.filter(c => c.id !== chatToDelete));
    }
    closeConfirm();
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setChatToDelete(null);
  };

  // close menu on click outside or Esc; close modal on Esc too
  useEffect(() => {
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(cm => ({ ...cm, visible: false, chatId: null }));
      }
      // if modal open and click outside modal content -> close modal
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

  // prevent background scroll when modal open
  useEffect(() => {
    if (confirmOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [confirmOpen]);

  return (
    <div className="h-full flex bg-white">
      <aside className="w-[320px] max-w-xs border-r border-gray-100 flex flex-col">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
        </div>

        {/* SEARCH */}
        <div className="p-2">
          <div className="relative group">
            <div className="relative rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <FiSearch className="w-4 h-4" />
              </div>

              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') clearSearch(); }}
                className="w-full pl-10 pr-10 py-2 bg-transparent rounded-lg text-sm placeholder-gray-400 focus:outline-none"
                aria-label="Search chats"
              />

              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}

              <span
                className="
                  absolute left-0 right-0 bottom-0 h-[3px] bg-[#4C0D68]
                  transform scale-x-0 origin-left
                  transition-transform duration-200 ease-out
                  group-focus-within:scale-x-100
                "
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No chats</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map(chat => (
                <ChatItem
                  key={chat.id}
                  id={chat.id}
                  avatar={chat.avatar}
                  name={chat.name}
                  lastMessage={chat.lastMessage}
                  time={chat.time}
                  unreadCount={chat.unreadCount}
                  isOnline={chat.isOnline}
                  showCentang={chat.showCentang}
                  showCentangAbu={chat.showCentangAbu}
                  onContextMenu={handleContextMenu}
                  isSelected={contextMenu.visible && contextMenu.chatId === chat.id}
                  highlightQuery={searchQuery} // only used for lastMessage highlighting
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full h-full max-w-[720px] min-h-[420px] border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-6">
          <div className="w-32 h-32 mb-4 bg-white rounded-md flex items-center justify-center overflow-hidden">
            <img src={assets.logo || assets.user} alt="placeholder" className="w-full h-full object-contain opacity-60" />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gypem Indonesia</h3>
          <p className="text-center text-gray-500 max-w-md text-sm">
            Silahkan tunggu pesan dari peserta sebelum memulai percakapan.
            Admin hanya dapat membalas pesan jika peserta telah mengirimkan pesan terlebih dahulu.
          </p>
        </div>
      </main>

      {/* CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed z-50 w-[160px] rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
          role="menu"
        >
          <button
            onClick={() => openConfirm(contextMenu.chatId)}
            className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 focus:outline-none"
            role="menuitem"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          {/* Overlay: semi-transparent + slight blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            ref={confirmRef}
            className="relative z-10 w-[420px] max-w-[92%] bg-white rounded-xl shadow-2xl border border-gray-100 p-6"
          >
            <div className="text-center ">
              <h4 className="text-base text-gray-700 mb-4">
                Delete chat with <span className="font-semibold">&ldquo;{(chats.find(c=>c.id===chatToDelete)?.name) || ''}&rdquo;</span> ?
              </h4>

              {/* Larger image without blue background */}
              <div className="mx-auto w-28 h-28 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                <img
                  src={assets.popup_delete}
                  alt="popup delete"
                  className="w-35 h-35 object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-3 mt-1">
                <button
                  onClick={doDelete}
                  className="px-10 py-1.5 text-sm rounded-md bg-amber-400 text-white font-medium shadow-sm 
             hover:bg-amber-500 hover:scale-105 
             active:scale-95 active:bg-amber-600
             transition-transform duration-150"
                >
                  Delete
                </button>
                <button
                  onClick={closeConfirm}
                  className="px-10 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 bg-white font-medium shadow-sm
             hover:bg-gray-100 hover:scale-105 
             active:scale-95 active:bg-gray-200
             transition-transform duration-150"
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
