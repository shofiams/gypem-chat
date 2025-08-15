import React, { useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import profileList from "../assets/profile_list.svg";

const NewMessagePopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);

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
        sm:absolute sm:top-20 sm:left-16 sm:w-[230px] sm:h-[330px] sm:translate-x-1 sm:translate-y-36

        /* Mobile */
        max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:right-0 max-sm:bottom-0 
        max-sm:w-full max-sm:h-full max-sm:rounded-none
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
