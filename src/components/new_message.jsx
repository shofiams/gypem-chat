// src/components/new_message.jsx

import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdmins } from "../hooks/useAdmins";
import { useRoomOperations, useRooms } from "../hooks/useRooms";
import { useChatContext } from "../api/use_chat_context";
import { assets } from "../assets/assets"

const NewMessagePopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: admins, loading, error } = useAdmins();
  const { createPrivateRoom, loading: creatingRoom } = useRoomOperations();
  
  const { 
    rooms,
  } = useRooms();
  const { setActiveChat } = useChatContext();

  const [processingContact, setProcessingContact] = useState(null);
  const PHOTO_URL = import.meta.env.VITE_API_UPLOAD_PHOTO;

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

  const handleContactClick = async (contact) => {
    if (processingContact === contact.id || creatingRoom) return;

    setProcessingContact(contact.id);
    const isMobile = window.innerWidth < 768;
    const isOnChatPage = location.pathname === '/chats' || location.pathname.startsWith('/chats/');

    try {
      console.log('Checking for existing room...');

      // Mencari room berdasarkan nama kontak (case-insensitive)
      const existingRoom = rooms.find(
        (room) => room.name.toLowerCase() === contact.name.toLowerCase() && room.room_type === "one_to_one"
      );

      if (existingRoom) {
        const roomId = existingRoom.room_id || existingRoom.id;
        console.log('Existing room found, navigating to:', roomId);
        
        onClose();
        
        if (isMobile) {
          // Mobile: selalu navigasi ke halaman chat
          navigate(`/chats/${roomId}`);
        } else {
          // Desktop: cek apakah user di halaman chat atau bukan
          if (isOnChatPage) {
            // Jika di halaman chat, gunakan setActiveChat via event
            window.dispatchEvent(new CustomEvent('setActiveChat', { detail: { chatId: roomId } }));
          } else {
            // Jika di halaman lain (starred, group, dll), navigasi ke /chats dengan active chat
            navigate('/chats');
            // Delay untuk memastikan halaman chat sudah ter-render
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('setActiveChat', { detail: { chatId: roomId } }));
            }, 100);
          }
        }
        setProcessingContact(null);
        return; 
      }

      console.log('No existing room found. Creating a new one...');

      const result = await createPrivateRoom(contact.id);

      if (result.success && result.data && result.data.room_id) {
        const newRoomId = result.data.room_id;
        console.log('Room created successfully via API, ID:', newRoomId);
        onClose();
        window.dispatchEvent(new CustomEvent('newChatCreated', { detail: { chatId: newRoomId } }));
        if (isMobile) {
          navigate(`/chats/${newRoomId}`);
        } else if (!isOnChatPage) {
           // Jika tidak di halaman /chats, navigasi ke sana
           navigate('/chats');
        }
      } else {
        console.error("Failed to create room:", result.error);
        alert(result.error || "Failed to create chat. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleContactClick:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingContact(null);
    }
  };


  if (!isOpen) return null;

  const contacts = admins.map((admin) => ({
    id: admin.admin_id,
    name: admin.nama_admin,
    email: admin.email,
    bio: admin.bio,
    profilePhoto: admin.url_profile_photo,
  }));

  return (
    <div
      ref={popupRef}
      className={`
        bg-white rounded-lg shadow-lg border border-gray-200 z-50
        md:absolute md:top-20 md:left-16 md:w-[230px] md:h-[330px] md:translate-x-1 md:translate-y-36
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
      
      <div className="px-4 py-3 md:py-2">
        <p className="text-base text-gray-400 md:text-xs md:text-gray-500">
          Daftar kontak GyChat
        </p>
      </div>

      <div className="overflow-y-auto scrollbar-hide h-[calc(100%-110px)] bg-white md:h-[240px] md:bg-transparent">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-gray-500">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-gray-500">No contacts available</p>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors duration-200 md:gap-3 md:px-4 md:py-2 md:transition-none md:duration-0 ${
                processingContact === contact.id
                  ? "bg-gray-100 opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-50 md:hover:bg-gray-100"
              }`}
            >
             <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                <img
                    src={contact.profilePhoto ? `${PHOTO_URL}uploads/${contact.profilePhoto}` : assets.DefaultAvatar}
                    alt="avatar"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                />
            </div>
              <div className="flex-1">
                <span className="text-gray-900 text-lg font-medium block md:text-gray-800 md:text-sm md:font-normal md:inline">
                  {contact.name}
                </span>
                {index !== contacts.length - 1 && (
                  <div className="border-b border-gray-300 relative top-4 md:hidden"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewMessagePopup;