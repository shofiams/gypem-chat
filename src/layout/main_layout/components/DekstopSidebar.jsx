import React from 'react';
import { assets } from '../../../assets/assets';
import SidebarItem from './SidebarItem'; // <-- Import SidebarItem
import { BsChatSquareText } from "react-icons/bs";
import { MdOutlineGroups } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const DesktopSidebar = ({ isOpen, toggleSidebar, activeRoute, onNavigate, onProfileClick, profileImage, isDefaultProfile, isNewMessageOpen, isProfilePopupOpen, sidebarRef }) => {
  const menuItems = [
    { icon: <BsChatSquareText size={20} />, label: "Chats", badge: 10, route: "/chats" },
    { icon: <MdOutlineGroups size={25} />, label: "Group", route: "/group" },
    { icon: <FiEdit size={20} />, label: "New Message", route: "/new-message", isPopup: true },
  ];

  const extraItems = [
    { icon: <FaRegStar size={20} />, label: "Starred Messages", route: "/starred" },
  ];

  const isItemActive = (route, isPopup = false) => {
    if (isPopup && route === '/new-message') return isNewMessageOpen;
    if (isNewMessageOpen || isProfilePopupOpen) return false;
    return activeRoute === route;
  };

  return (
    <aside
      ref={sidebarRef}
      className={`
        hidden md:block bg-white
        fixed top-16 left-0 z-30 shadow-lg
        ${isOpen ? 'w-60' : 'w-16'}
        transition-all duration-300 ease-out
      `}
      style={{ height: 'calc(100vh - 64px)' }} 
    >
      <div className="flex flex-col flex-1 overflow-hidden pt-4 h-full">
        <div className="px-2 mb-0">
          <button
            onClick={toggleSidebar}
            className="flex items-center px-3 py-2.5 hover:bg-gray-100 rounded-lg w-full transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-center w-7 h-6 flex-shrink-0">
              <img src={assets.menu} alt="Menu" className="object-contain" />
            </div>
          </button>
        </div>
        <nav className="mt-4 flex flex-col justify-between flex-1 w-full">
          <div className="-mt-4">
            {menuItems.map(({ icon, label, badge, route, isPopup }) => (
              <SidebarItem
                key={route}
                icon={icon}
                label={label}
                badge={badge}
                isOpen={isOpen}
                isActive={isItemActive(route, isPopup)}
                onClick={() => onNavigate(route)}
              />
            ))}
          </div>
          <div className="mt-auto">
            {extraItems.map(({ icon, label, route }) => (
              <SidebarItem
                key={route}
                icon={icon}
                label={label}
                isOpen={isOpen}
                isActive={isItemActive(route)}
                onClick={() => onNavigate(route)}
              />
            ))}
            <div className="px-2 my-1">
              <button
                onClick={onProfileClick}
                className={`relative w-full flex px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out ${isProfilePopupOpen ? "bg-gray-100" : ""}`}
              >
                {isProfilePopupOpen && <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#FFB400] w-[3px] h-[20px] rounded-full transition-all duration-300 ease-out" />}
                <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
                  {isDefaultProfile ? <CgProfile className="text-gray-600" style={{ fontSize: '18px' }} /> : <img src={profileImage} alt="Profile" className="w-5 h-5 rounded-full object-cover" />}
                </div>
                <div className="overflow-hidden flex-1 ml-3">
                  <span className={`block text-[14px] text-[#333] whitespace-nowrap transition-all duration-300 ease-out text-left ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    Profile
                  </span>
                </div>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default DesktopSidebar;