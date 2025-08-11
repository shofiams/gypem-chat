// src/pages/chat_page.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { assets } from '../assets/assets';
import { FiX, FiSearch } from 'react-icons/fi';

// Komponen ChatItem
const ChatItem = ({
  id,
  name,
  lastMessage,
  time,
  isSelected,
  highlightQuery
}) => {
  const highlightText = (text, query) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ color: "#4C0D68", fontWeight: "bold" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`flex items-start px-4 py-3 cursor-pointer border-b border-gray-100 min-h-[56px]
        ${isSelected ? 'bg-[#efe6f3]' : 'hover:bg-gray-50'}`}
      role="button"
      tabIndex={0}
    >
      {/* Text area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-[12px] leading-tight mb-[3px]">
              {highlightText(name, highlightQuery)}
            </h3>
            <p className="text-gray-400 truncate text-[10px] leading-tight">
              {highlightText(lastMessage, highlightQuery)}
            </p>
          </div>
          <div className="shrink-0 ml-3 text-right">
            <span className="text-[10px] text-gray-400 leading-tight">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats] = useState([
    { id: 1, name: "Class All", lastMessage: "Admin WIB : link pengumpulan.......", time: "yesterday" },
    { id: 2, name: "Olympiad Star", lastMessage: "Admin WIT : Jangan lupa pada......", time: "27/07/2025" },
    { id: 3, name: "Olympiad Moon", lastMessage: "Admin Gypem : Pendaftaran Olympiad......", time: "10/06/2025" },
    { id: 4, name: "Admin Gypem", lastMessage: "Sudah dibaca", time: "10:15" },
  ]);

  // Filter chat sesuai query
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

  return (
    <div className="h-full flex bg-white">
      {/* SIDEBAR */}
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
                placeholder="Search starred messages"
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

        {/* Label */}
        <div className="px-4 pt-2 pb-1">
          <span className="text-[14px] text-gray-400">Messages</span>
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
                  name={chat.name}
                  lastMessage={chat.lastMessage}
                  time={chat.time}
                  isSelected={false}
                  highlightQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN PANEL */}
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
    </div>
  );
}
