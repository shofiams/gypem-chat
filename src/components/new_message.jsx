// src/components/new_message.jsx

import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileList from "../assets/user.svg";
import { useAdmins } from "../hooks/useAdmins";
import { useRoomOperations, useRooms } from "../hooks/useRooms";
import { useChatContext } from "../api/use_chat_context";

const NewMessagePopup = ({ isOpen, onClose, onChatCreated }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { data: admins, loading, error } = useAdmins();
  const { createPrivateRoom, loading: creatingRoom } = useRoomOperations();
  
  const { 
    rooms, 
    refetch: refetchRooms, 
    addOptimisticRoom, 
    updateOptimisticRoom, 
    removeOptimisticRoom 
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

  // --- FUNGSI UTAMA DENGAN OPTIMISTIC UI + POLLING FALLBACK ---
  const handleContactClick = async (contact) => {
    if (processingContact === contact.id || creatingRoom) return;

    setProcessingContact(contact.id);
    const isMobile = window.innerWidth < 768;

    try {
      // STEP 1: Refresh dan cek apakah chat sudah ada
      console.log('Checking for existing room...');
      await refetchRooms();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const existingRoom = rooms.find(
        (room) => room.name === `Admin${contact.id}` && room.room_type === "one_to_one"
      );

      if (existingRoom) {
        const roomId = existingRoom.room_id || existingRoom.id;
        console.log('Existing room found:', roomId);
        
        onClose();
        if (isMobile) {
          navigate(`/chats/${roomId}`);
        } else {
          setActiveChat(roomId);
        }
        setProcessingContact(null);
        return;
      }

      // STEP 2: Buat optimistic room untuk instant feedback
      const optimisticId = `optimistic_${Date.now()}`;
      const optimisticRoom = {
        optimisticId,
        room_id: optimisticId,
        name: contact.name,
        url_photo: contact.profilePhoto,
        last_message: "Creating chat...",
        last_time: new Date().toISOString(),
        unread_count: 0,
        room_type: "one_to_one",
      };

      // STEP 3: Tambahkan ke UI secara instant
      addOptimisticRoom(optimisticRoom);
      onClose();

      if (isMobile) {
        navigate(`/chats/${optimisticId}`);
      } else {
        setActiveChat(optimisticId);
      }

      // STEP 4: Panggil API untuk membuat room sebenarnya
      console.log('Creating new room for contact:', contact.id);
      const result = await createPrivateRoom(contact.id);

      if (result.success && result.data) {
        console.log('Room created successfully:', result.data);
        
        // Trigger refresh event
        if (onChatCreated) {
          await onChatCreated();
        }
        window.dispatchEvent(new CustomEvent("chatListRefresh"));

        // STEP 5: Polling untuk menemukan room yang baru dibuat
        let newRoom = null;
        let attempts = 0;
        const maxAttempts = 10;
        const delayMs = 200;

        while (!newRoom && attempts < maxAttempts) {
          attempts++;
          console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
          
          const freshData = await refetchRooms();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          
          const currentRooms = freshData || rooms;
          
          // Cari room dengan nama yang sesuai
          newRoom = currentRooms.find((room) => {
            const isCorrectName = room.name === `Admin${contact.id}`;
            const isCorrectType = room.room_type === "one_to_one";
            const isNotOptimistic = !room.optimisticId;
            
            return isCorrectName && isCorrectType && isNotOptimistic;
          });
          
          // Di percobaan terakhir, gunakan data dari result jika ada
          if (!newRoom && attempts === maxAttempts && result.data.room_id) {
            newRoom = result.data;
            console.log('Using room data from API response:', newRoom);
          }
        }

        // STEP 6: Update optimistic room dengan data real
        if (newRoom) {
          const roomId = newRoom.room_id || newRoom.id;
          console.log('Successfully found room:', roomId);
          
          updateOptimisticRoom(optimisticId, newRoom);
          
          // Update navigation jika diperlukan
          if (isMobile) {
            navigate(`/chats/${roomId}`, { replace: true });
          } else {
            setActiveChat(currentId => currentId === optimisticId ? roomId : currentId);
          }
        } else {
          // STEP 7: Fallback - gunakan data dari API response
          console.warn('Room not found after polling, using API response data');
          
          if (result.data.room_id) {
            updateOptimisticRoom(optimisticId, result.data);
            
            if (isMobile) {
              navigate(`/chats/${result.data.room_id}`, { replace: true });
            } else {
              setActiveChat(result.data.room_id);
            }
          } else {
            // Jika benar-benar gagal, hapus optimistic room
            console.error('Failed to get room data');
            removeOptimisticRoom(optimisticId);
            
            if (isMobile) {
              navigate('/chats', { replace: true });
            } else {
              setActiveChat(null);
            }
            
            alert('Chat created but failed to load. Please refresh the page.');
          }
        }
      } else {
        // STEP 8: Handle API error
        console.error("Failed to create room:", result.error);
        alert(result.error || "Failed to create chat. Please try again.");
        
        removeOptimisticRoom(optimisticId);
        
        if (isMobile) {
          navigate('/chats', { replace: true });
        } else {
          setActiveChat(null);
        }
      }
    } catch (error) {
      console.error("Error in handleContactClick:", error);
      alert("An unexpected error occurred. Please try again.");
      
      // Cleanup jika ada error
      const optimisticId = `optimistic_${Date.now()}`;
      removeOptimisticRoom(optimisticId);
      
      if (isMobile) {
        navigate('/chats', { replace: true });
      } else {
        setActiveChat(null);
      }
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