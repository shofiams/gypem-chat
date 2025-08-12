import React, { useEffect, useRef } from "react";
import profileList from "../assets/profile_list.svg"; // pastikan path sesuai struktur project

const NewMessagePopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);

  // Tutup popup jika klik di luar
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

  if (!isOpen) return null;

  const contacts = [
    { id: 1, name: "Admin WIB" },
    { id: 2, name: "Admin WIT" },
    { id: 3, name: "Admin WITA" },
    { id: 4, name: "Admin Gypem" },
    { id: 5, name: "Admin satu" },
    { id: 6, name: "Admin dua" },
  ];

  return (
    <div
      ref={popupRef}
      className="
        absolute top-12 left-16
        bg-white rounded-lg shadow-lg w-[230px] h-[310px] border border-gray-200
        z-50
      "
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">New Message</h2>
        <p className="text-xs text-gray-500">Daftar kontak GyChat</p>
      </div>

      {/* Contact list */}
      <div className="py-2 h-[240px] overflow-y-auto scrollbar-hide">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            <img
              src={profileList}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-800 text-xs">{contact.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewMessagePopup;
