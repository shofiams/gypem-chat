import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { assets } from '../assets/assets';
import { BsChatSquareText } from "react-icons/bs";
import { MdOutlineGroups } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";


// Komponen SidebarItem
const SidebarItem = ({ icon, label, isActive, onClick, isOpen, badge }) => {
  const isStar = label === "Starred Message"; // khusus bintang

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center
        px-4 py-2 my-1
        hover:bg-gray-100 rounded
        transition-all duration-300 ease-in-out
        ${isActive ? "bg-gray-100" : ""}
      `}
    >
      {/* Garis khusus untuk icon bintang */}
      {isStar && (
        <span
          className={`
            absolute -top-1 left-[10%]
            h-[0.5px] bg-[#A59B9B] rounded-full
            transition-all duration-300
            ${isOpen ? "w-[calc(100%-32px)]" : "w-[45px]"}
          `}
        />
      )}

      {/* Indicator active (garis vertikal di kiri) */}
      {isActive && (
        <span
          className="
            absolute left-[8px]
            top-1/2 -translate-y-1/2
            bg-[#FFB400]
            w-[3px] h-[20px]
            rounded-full
          "
        />
      )}

      {/* Icon + Badge di satu container */}
      <div className="relative flex items-center justify-center" style={{ fontSize: 24 }}>
        {icon}

        {/* Badge saat sidebar tertutup */}
        {badge != null && !isOpen && (
          <span
            className="
              absolute top-0 right-0
              translate-x-1/3 -translate-y-1/3
              w-4 h-4
              bg-[#FFB400]
              text-white text-[10px]
              leading-none
              rounded-full
              flex items-center justify-center
            "
          >
            {badge}
          </span>
        )}
      </div>

      {/* Label */}
      {isOpen && (
        <span className="ml-3 text-[14px] text-[#333]">
          {label}
        </span>
      )}

      {/* Badge saat sidebar terbuka */}
      {badge != null && isOpen && (
        <span
          className="
            absolute top-1/2 -translate-y-1/2
            left-[200px]
            w-4 h-4
            bg-[#FFB400]
            text-white text-[10px]
            leading-none
            rounded-full
            flex items-center justify-center
          "
        >
          {badge}
        </span>
      )}
    </button>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    { icon: <BsChatSquareText size={18} />, label: "Chats", badge: 10, route: "/chats" },
    { icon: <MdOutlineGroups size={24} />, label: "Group", route: "/group" },
    { icon: <FiEdit size={18} />, label: "New Message", route: "/new-message" },
   
  ];

  const extraItems = [
    { icon: <FaRegStar size={18} />, label: "Starred Message", route: "/star" },
    { icon: <CgProfile size={18} />, label: "Profile", route: "/profile" },
  ];

  const handleClick = (idx, route) => {
    setActiveIndex(idx);
    navigate(route);
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-white
        ${isOpen ? 'w-64 border-r' : 'w-20'}
        transition-all duration-300
        relative
      `}
    >
      {/* HEADER-TOP */}
      <div className="relative flex items-center px-4 py-4">
        <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
        <span
          className={`
            text-[16px] font-medium text-[#4c0d68]
            absolute left-16
            whitespace-nowrap
          `}
        >
          Hi! Username
        </span>
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="flex items-center px-4 py-2 hover:bg-gray-100"
        >
          <img src={assets.menu} alt="Menu" className="w-6 h-6 object-contain" />
        </button>

        {/* Menu & Extra Items */}
        <nav className="mt-4 flex flex-col justify-between flex-1">
          {/* Group 1: menuItems */}
          <div className="-mt-4">
            {menuItems.map(({ icon, label, badge, route }, idx) => (
              <SidebarItem
                key={idx}
                icon={icon}
                label={label}
                badge={badge}
                isOpen={isOpen}
                isActive={idx === activeIndex}
                onClick={() => handleClick(idx, route)}
              />
            ))}
          </div>

          {/* Group 2: extraItems */}
          <div className="mt-auto">
            {extraItems.map(({ icon, label, route }, idx) => {
              const idxAll = menuItems.length + idx;
              return (
                <SidebarItem
                  key={`extra-${idx}`}
                  icon={icon}
                  label={label}
                  isOpen={isOpen}
                  isActive={idxAll === activeIndex}
                  onClick={() => handleClick(idxAll, route)}
                />
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(o => !o)}
      />
      <div className="flex-1 flex flex-col">
        <header className="w-full px-6 py-4">
          {/* Optional page title */}
        </header>
        <main className="flex-1 p-4">
          {/* Main content */}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
