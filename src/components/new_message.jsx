import React, { useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../api/use_chat_context";
import profileList from "../assets/profile_list.svg";

const NewMessagePopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { getAllChats, createNewChat, getChatById } = useChatContext();

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleContactClick = (contact) => {
    const allChats = getAllChats();
    
    const existingChat = allChats.find(chat => 
      chat.name === contact.name && 
      chat.type !== 'group' && 
      chat.id
    );

    // Redirect to existing chat
    if (existingChat && getChatById && getChatById(existingChat.id)) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        navigate(`/chats/${existingChat.id}`);
      } else {
        navigate(`/chats?activeChat=${existingChat.id}`);
      }
    } else {
      const newChatData = {
        name: contact.name,
        avatar: profileList,
        lastMessage: "",
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }).replace(':', '.'),
        unreadCount: 0,
        isOnline: false,
        showCentang: false,
        showCentangAbu: false,
        type: 'one-to-one'
      };

      const newChatId = createNewChat(newChatData);
      
      // Redirect to new chat
      if (newChatId) {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          navigate(`/chats/${newChatId}`);
        } else {
          navigate(`/chats?activeChat=${newChatId}`);
        }
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const contacts = [
    { id: 1, name: "Admin WIB" },
    { id: 2, name: "Admin WIT" },
    { id: 3, name: "Admin WITA" },
    { id: 4, name: "Admin Gypem" },
    { id: 5, name: "Admin Satu" },
    { id: 6, name: "Admin Dua" },
    { id: 7, name: "Admin Tiga" },
  ];

  return (
    <div
      ref={popupRef}
      className={`
        bg-white rounded-lg shadow-lg border border-gray-200 z-50

        /* Desktop */
        md:absolute md:top-20 md:left-16 md:w-[230px] md:h-[330px] md:translate-x-1 md:translate-y-36

        /* Mobile */
        max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:bottom-0 
        max-md:w-full max-md:h-full max-md:rounded-none
      `}
    >

      {/* Header Desktop */}
      <div className="px-4 py-3 border-b border-gray-200 hidden md:block">
        <h2 className="text-sm font-semibold text-gray-800">New Message</h2>
      </div>

      {/* Header Mobile */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <button onClick={onClose} className="text-gray-600 text-lg">
            <FiArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Daftar Kontak
          </h2>
        </div>
      </div>

      {/* Teks sebelum list - Mobile First */}
      <div className="px-4 py-3 md:py-2">
        <p className="text-base text-gray-400 md:text-xs md:text-gray-500">
          Daftar kontak GyChat
        </p>
      </div>

      {/* Contact list - Mobile First */}
      <div className="overflow-y-auto scrollbar-hide h-[calc(100%-110px)] bg-white md:h-[240px] md:bg-transparent">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            onClick={() => handleContactClick(contact)}
            className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 md:gap-3 md:px-4 md:py-2 md:hover:bg-gray-100 md:transition-none md:duration-0"
          >
            <img
              src={profileList}
              alt="avatar"
              className="w-13 h-13 rounded-full object-cover md:w-8 md:h-8 md:object-none"
            />
            <div className="flex-1">
              <span className="text-gray-900 text-lg font-medium block md:text-gray-800 md:text-sm md:font-normal md:inline">
                {contact.name}
              </span>
              {/* Divider hanya untuk mobile dan bukan item terakhir */}
              {index !== contacts.length - 1 && (
                <div className="border-b border-gray-300 relative top-4 md:hidden"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewMessagePopup;