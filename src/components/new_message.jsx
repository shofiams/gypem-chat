import React, { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileList from "../assets/profile_list.svg";
import { useAdmins } from "../hooks/useAdmins";
import { useRoomOperations } from "../hooks/useRooms";
import { useRooms } from "../hooks/useRooms";

const NewMessagePopup = ({ isOpen, onClose, onChatCreated }) => {
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { data: admins, loading, error } = useAdmins();
  const { createPrivateRoom, loading: creatingRoom } = useRoomOperations();
  const { rooms, refetch: refetchRooms } = useRooms();

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

      // Refresh rooms data untuk cek existing room
      await refetchRooms();

      // Cek existing room berdasarkan adminId
      const existingRoom = rooms.find(
        (room) => room.adminId === contact.id && room.type !== "group"
      );

      if (existingRoom) {
        // Langsung redirect ke room yang sudah ada TANPA NOTIFIKASI
        if (isMobile) {
          navigate(`/chats/${existingRoom.room_id || existingRoom.id}`);
        } else {
          if (window.location.pathname !== "/chats") {
            navigate("/chats");
          }
          // Untuk desktop, dispatch event untuk set active chat
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("setActiveChat", {
                detail: { chatId: existingRoom.room_id || existingRoom.id },
              })
            );
          }, 100);
        }
        onClose(); // Tutup popup
        return; // Keluar dari fungsi
      }

      // Buat private room baru melalui API (hanya jika room belum ada)
      const result = await createPrivateRoom(contact.id);

      if (result.success) {
        if (onChatCreated) {
          await onChatCreated();
        }

        window.dispatchEvent(new CustomEvent("chatListRefresh"));

        await new Promise((resolve) => setTimeout(resolve, 300));

        await refetchRooms();

        const roomId = result.data?.room_id || result.roomId;

        if (roomId) {
          if (isMobile) {
            navigate(`/chats/${roomId}`);
          } else {
            if (window.location.pathname !== "/chats") {
              navigate("/chats");
            }
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("setActiveChat", {
                  detail: { chatId: roomId },
                })
              );
            }, 200);
          }
        } else {
          await refetchRooms();
          const newRoom = rooms.find((room) => room.adminId === contact.id);
          if (newRoom) {
            const newRoomId = newRoom.room_id || newRoom.id;
            if (isMobile) {
              navigate(`/chats/${newRoomId}`);
            } else {
              if (window.location.pathname !== "/chats") {
                navigate("/chats");
              }
              setTimeout(() => {
                window.dispatchEvent(
                  new CustomEvent("setActiveChat", {
                    detail: { chatId: newRoomId },
                  })
                );
              }, 200);
            }
          }
        }
      } else {
        console.error("Failed to create private room:", result.error);
      }
    } catch (error) {
      console.error("Error creating private room:", error);
    } finally {
      setProcessingContact(null);
      onClose();
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
                    ? `/path/to/images/${contact.profilePhoto}`
                    : profileList
                }
                alt="avatar"
                className="w-13 h-13 rounded-full object-cover md:w-8 md:h-8 md:object-none"
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