import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileList from "../assets/user.svg";
import { useAdmins } from "../hooks/useAdmins";
import { useRoomOperations } from "../hooks/useRooms";
import { useRooms } from "../hooks/useRooms";
import { useChatContext } from "../api/use_chat_context";

const NewMessagePopup = ({ isOpen, onClose, onChatCreated }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { data: admins, loading, error } = useAdmins();
  const { createPrivateRoom, loading: creatingRoom } = useRoomOperations();
  const { rooms, refetch: refetchRooms } = useRooms();
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

    try {
      const isMobile = window.innerWidth < 768;

      // PERBAIKAN 1: Refresh rooms dan tunggu hasil terbaru
      console.log('Refreshing rooms before check...');
      await refetchRooms();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // PERBAIKAN 2: Gunakan closure untuk mendapatkan data rooms terbaru
      const checkExistingRoom = async () => {
        const freshRoomsData = await refetchRooms();
        const currentRooms = freshRoomsData || rooms;
        
        return currentRooms.find(
          (room) => room.name === `Admin${contact.id}` && room.room_type === "one_to_one"
        );
      };

      const existingRoom = await checkExistingRoom();

      if (existingRoom) {
        const roomId = existingRoom.room_id || existingRoom.id;
        
        console.log('Existing room found:', roomId);
        
        onClose();
        
        if (isMobile) {
          navigate(`/chats/${roomId}`);
        } else {
          if (window.location.pathname !== "/chats") {
            navigate("/chats");
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
          
          setActiveChat(roomId);
        }
        
        setProcessingContact(null);
        return;
      }

      // PERBAIKAN 3: Buat room baru dengan error handling yang lebih baik
      console.log('Creating new room for contact:', contact.id);
      const result = await createPrivateRoom(contact.id);

      if (result.success) {
        console.log('Room created successfully');
        
        if (onChatCreated) {
          await onChatCreated();
        }

        // PERBAIKAN 4: Trigger refresh dengan delay yang cukup
        window.dispatchEvent(new CustomEvent("chatListRefresh"));
        await new Promise((resolve) => setTimeout(resolve, 300));

        // PERBAIKAN 5: Polling dengan strategi yang lebih agresif
        let newRoom = null;
        let attempts = 0;
        const maxAttempts = 8; // Tingkatkan jumlah percobaan
        const delayMs = 250; // Kurangi delay antar percobaan

        while (!newRoom && attempts < maxAttempts) {
          attempts++;
          console.log(`Attempt ${attempts}/${maxAttempts}: Searching for new room...`);
          
          // Force refresh dan ambil data terbaru
          const freshData = await refetchRooms();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          
          // Cari room dengan berbagai kemungkinan
          const currentRooms = freshData || rooms;
          
          // Coba berbagai cara pencarian
          newRoom = currentRooms.find((room) => {
            const isCorrectName = room.name === `Admin${contact.id}`;
            const isCorrectType = room.room_type === "one_to_one";
            
            // Log untuk debugging
            if (isCorrectName) {
              console.log('Found room with matching name:', room);
            }
            
            return isCorrectName && isCorrectType;
          });
          
          // Jika belum ketemu, coba cari yang paling baru dibuat
          if (!newRoom && attempts === maxAttempts) {
            console.log('Last attempt: Looking for most recent room...');
            const sortedRooms = [...currentRooms].sort((a, b) => {
              const dateA = new Date(a.created_at || a.updated_at || 0);
              const dateB = new Date(b.created_at || b.updated_at || 0);
              return dateB - dateA;
            });
            
            // Ambil room terbaru yang sesuai dengan admin
            newRoom = sortedRooms.find(room => 
              room.name === `Admin${contact.id}` && 
              room.room_type === "one_to_one"
            );
          }
          
          if (newRoom) {
            console.log('Room found:', newRoom);
            break;
          }
        }
        
        if (newRoom) {
          const roomId = newRoom.room_id || newRoom.id;
          console.log('Navigating to room:', roomId);

          onClose();

          if (isMobile) {
            navigate(`/chats/${roomId}`);
          } else {
            if (window.location.pathname !== "/chats") {
              navigate("/chats");
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
            
            // PERBAIKAN 6: Set active chat dengan delay
            setTimeout(() => {
              setActiveChat(roomId);
            }, 100);
          }
        } else {
          console.error('Room not found after', maxAttempts, 'attempts');
          console.log('Contact ID:', contact.id);
          console.log('Expected room name:', `Admin${contact.id}`);
          console.log('Available rooms:', rooms.map(r => ({
            id: r.room_id,
            name: r.name,
            type: r.room_type
          })));
          
          // PERBAIKAN 7: Tetap tutup popup dan trigger refresh final
          onClose();
          window.dispatchEvent(new CustomEvent("chatListRefresh"));
        }
      } else {
        console.error("Failed to create private room:", result.error);
        alert(result.error || "Failed to create chat. Please try again.");
      }
    } catch (error) {
      console.error("Error creating private room:", error);
      alert("An error occurred. Please try again.");
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
                  ? "bg-gray-100 opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-50 md:hover:bg-gray-100"
              }`}
            >
              <img
                src={
                  contact.profilePhoto
                    ? `${PHOTO_URL}uploads/${contact.profilePhoto}`
                    : profileList
                }
                alt="avatar"
                crossOrigin="anonymous"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = profileList;
                }}
              />
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