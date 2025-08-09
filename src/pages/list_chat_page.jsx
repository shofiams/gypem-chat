// src/pages/chat_page.jsx
import React, { useState } from 'react';
import { assets } from '../assets/assets';

const ChatItem = ({ avatar, name, lastMessage, time, unreadCount, isOnline }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
      {/* Avatar */}
      <div className="relative">
        <img
          src={avatar || assets.default_avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 ml-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 text-sm">{name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{time}</span>
            {unreadCount > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{lastMessage}</p>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample chat data based on your images
  const chats = [
    {
      id: 1,
      name: "Class All",
      lastMessage: "Hi, I have a problem with the...",
      time: "10:15",
      unreadCount: 3,
      avatar: null,
      isOnline: false,
    },
    {
      id: 2,
      name: "Olympiad Moon",
      lastMessage: "Hi, I have a problem with...",
      time: "10:15",
      unreadCount: 1,
      avatar: null,
      isOnline: true,
    },
    {
      id: 3,
      name: "Olympiade Star",
      lastMessage: "Hi, I have a problem with...",
      time: "10:15",
      unreadCount: 1,
      avatar: null,
      isOnline: false,
    },
    {
      id: 4,
      name: "Admin Gypem",
      lastMessage: "mengetik...",
      time: "10:15",
      unreadCount: 0,
      avatar: null,
      isOnline: true,
    },
    // Desktop version additional chats
    {
      id: 5,
      name: "Admin WITA",
      lastMessage: "Gimana sih itu...",
      time: "10:09",
      unreadCount: 0,
      avatar: null,
      isOnline: false,
    },
    {
      id: 6,
      name: "Admin WIB",
      lastMessage: "Mongols",
      time: "10:02",
      unreadCount: 0,
      avatar: null,
      isOnline: false,
    },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No chats found</p>
            <p className="text-sm">Try searching with different keywords</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z" />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-purple-200 rounded-full opacity-50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border border-purple-100 rounded-full opacity-30"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Gypem Indonesia</h2>
            <p className="text-center text-gray-500 max-w-xs">
              Silahkan tunggu pesan dari peserta sebelum memulai percakapan.
              Admin hanya dapat membalas pesan jika peserta telah 
              mengirimkan pesan terlebih dahulu
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                avatar={chat.avatar}
                name={chat.name}
                lastMessage={chat.lastMessage}
                time={chat.time}
                unreadCount={chat.unreadCount}
                isOnline={chat.isOnline}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}