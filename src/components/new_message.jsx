import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../api/use_chat_context";
import profileList from "../assets/profile_list.svg";
import { useAdmins } from "../hooks/useAdmins";
import { useRoomOperations } from "../hooks/useRooms"; 
import { useRooms } from "../hooks/useRooms"; 
// Import untuk API operations

const NewMessagePopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { getAllChats, createNewChat, setActiveChat } = useChatContext();
  const { data: admins, loading, error } = useAdmins();
  const { createPrivateRoom, loading: creatingRoom } = useRoomOperations(); // Hook untuk API
  
  const { refetch: refetchRooms } = useRooms(); 

  // State untuk loading dan error handling
  const [processingContact, setProcessingContact] = useState(null);

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
    // Prevent multiple clicks
    if (processingContact === contact.id || creatingRoom) return;
    
    setProcessingContact(contact.id);
    
    try {
      const isMobile = window.innerWidth < 768;
      const allChats = getAllChats();
      
      // Cek existing chat berdasarkan adminId
      const existingChat = allChats.find(chat => 
        chat.adminId === contact.id && 
        chat.type !== 'group'
      );

      if (existingChat) {
        // Navigate to existing chat
        if (isMobile) {
          navigate(`/chats/${existingChat.id}`);
        } else {
          // For desktop: ensure we're on chats page first
          if (window.location.pathname !== '/chats') {
            navigate('/chats');
          }
          // Set active chat after a brief delay to ensure state is ready
          setTimeout(() => {
            setActiveChat(existingChat.id);
          }, 10);
        }
        onClose();
        return;
      }

      // Buat private room melalui API
      console.log("Creating private room for admin:", contact.id);
      const result = await createPrivateRoom(contact.id);
      
      if (result.success) {
        // Berhasil buat room di API, sekarang buat local chat
        const newChatData = {
          name: contact.name,
          avatar: contact.profilePhoto ? `/path/to/images/${contact.profilePhoto}` : profileList,
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
          type: 'one-to-one',
          // Tambahan data admin untuk referensi
          adminId: contact.id,
          email: contact.email,
          bio: contact.bio,
          // Data dari API response
          roomId: result.data?.room_id,
          roomMemberId: result.data?.room_member_id
        };

        const newChatId = createNewChat(newChatData);
        
        if (newChatId) {
          if (isMobile) {
            navigate(`/chats/${newChatId}`);
          } else {
            // For desktop: ensure we're on chats page first
            if (window.location.pathname !== '/chats') {
              navigate('/chats');
            }
            // Set active chat after creation with longer delay to ensure state updates
            setTimeout(() => {
              setActiveChat(newChatId);
            }, 50);
          }
        }
        
        console.log("Private room created successfully:", result.data);
      } else {
        // Handle error dari API
        console.error("Failed to create private room:", result.error);
        alert(`Failed to create chat: ${result.error}`);
      }
      
    } catch (error) {
      console.error("Error creating private room:", error);
      alert("An error occurred while creating the chat. Please try again.");
    } finally {
      setProcessingContact(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const contacts = admins.map(admin => ({
    id: admin.admin_id,
    name: admin.nama_admin,
    email: admin.email,
    bio: admin.bio,
    profilePhoto: admin.url_profile_photo
  }));

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
                  ? 'bg-gray-100 opacity-70 cursor-not-allowed' 
                  : 'hover:bg-gray-50 md:hover:bg-gray-100'
              }`}
            >
              <img
                src={contact.profilePhoto ? `/path/to/images/${contact.profilePhoto}` : profileList}
                alt="avatar"
                className="w-13 h-13 rounded-full object-cover md:w-8 md:h-8 md:object-none"
                onError={(e) => {
                  e.target.src = profileList; // Fallback to default image if profile photo fails to load
                }}
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
          ))
        )}
      </div>
    </div>
  );
};

export default NewMessagePopup;