import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { assets } from '../assets/assets';
import { BsChatSquareText } from "react-icons/bs";
import { MdOutlineGroups } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

// Desktop Sidebar Item Component
const SidebarItem = ({ icon, label, isActive, onClick, isOpen, badge }) => {
  const isStar = label === "Starred Messages";

  return (
    <div className="px-2 my-1">
      <button
        onClick={onClick}
        className={`
          relative w-full flex px-3
          py-2.5
          hover:bg-gray-100 rounded-lg
          transition-all duration-500 ease-out
          ${isActive ? "bg-gray-100" : ""}
        `}
      >
        {/* Separator line for starred messages */}
        {isStar && (
          <span
            className={`
              absolute -top-2 
              left-1
              h-[0.5px] bg-[#A59B9B] rounded-full
              transition-all duration-500 ease-in-out
              ${isOpen ? "w-[calc(95%)]" : "w-[40px]"}
            `}
          />
        )}

        {/* Active indicator */}
        {isActive && (
          <span
            className="
              absolute left-0
              top-1/2 -translate-y-1/2
              bg-[#FFB400]
              w-[3px] h-[20px]
              rounded-full
              transition-all duration-500 ease-out
            "
          />
        )}

        {/* Icon container */}
        <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
          <span className="text-gray-600 transition-colors duration-300 ease-out" style={{ fontSize: '18px' }}>
            {icon}
          </span>

          {/* Badge when sidebar is closed */}
          {badge != null && !isOpen && (
            <span
              className="
                absolute -top-1 -right-1
                w-4 h-4
                bg-[#FFB400]
                text-white text-[10px]
                leading-none
                rounded-full
                flex items-center justify-center
                transition-all duration-300 ease-out
              "
            >
              {badge}
            </span>
          )}
        </div>

        {/* Label */}
        <div className="overflow-hidden flex-1 ml-3">
          <span 
            className={`
              block text-[14px] text-[#333] whitespace-nowrap
              transition-all duration-500 ease-out text-left
              ${isOpen 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-4'
              }
            `}
          >
            {label}
          </span>
        </div>

        {/* Badge when sidebar is open */}
        {badge != null && isOpen && (
          <span
            className={`
              absolute top-1/2 -translate-y-1/2
              right-4
              w-4 h-4
              bg-[#FFB400]
              text-white text-[10px]
              leading-none
              rounded-full
              flex items-center justify-center
              transition-all duration-500 ease-out
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          >
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

// Desktop Sidebar Component (without header)
const DesktopSidebar = ({ isOpen, toggleSidebar, activeRoute, onNavigate }) => {
  const menuItems = [
    { 
      icon: <BsChatSquareText size={20} />, 
      label: "Chats", 
      badge: 10, 
      route: "/chats" 
    },
    { 
      icon: <MdOutlineGroups size={25} />, 
      label: "Group", 
      route: "/group" 
    },
    { 
      icon: <FiEdit size={20} />, 
      label: "New Message", 
      route: "/new-message" 
    },
  ];

  const extraItems = [
    { 
      icon: <FaRegStar size={20} />, 
      label: "Starred Messages", 
      route: "/starred" 
    },
    { 
      icon: <CgProfile size={20} />, 
      label: "Profile", 
      route: "/profile" 
    },
  ];

  return (
    <aside
      className={`
        hidden md:flex flex-col bg-white border-r border-gray-200
        ${isOpen ? 'w-60 fixed top-16 left-0 z-50 shadow-lg' : 'w-16 relative'}
        transition-all duration-500 ease-out
      `}
      style={{ height: 'calc(100vh - 64px)' }} 
    >
      {/* Body */}
      <div className={`flex flex-col flex-1 overflow-hidden pt-4`}>
        {/* Toggle button */}
        <div className="px-2 mb-0">
          <button
            onClick={toggleSidebar}
            className={`
              flex items-center px-3 py-2.5 hover:bg-gray-100 rounded-lg w-full
              transition-all duration-300 ease-out
            `}
          >
            <div className="flex items-center justify-center w-7 h-6 flex-shrink-0">
              <img src={assets.menu} alt="Menu" className="object-contain" />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col justify-between flex-1 w-full">
          {/* Main menu items */}
          <div className="-mt-4">
            {menuItems.map(({ icon, label, badge, route }) => (
              <SidebarItem
                key={route}
                icon={icon}
                label={label}
                badge={badge}
                isOpen={isOpen}
                isActive={activeRoute === route}
                onClick={() => onNavigate(route)}
              />
            ))}
          </div>

          {/* Extra items */}
          <div className="mt-auto">
            {extraItems.map(({ icon, label, route }) => (
              <SidebarItem
                key={route}
                icon={icon}
                label={label}
                isOpen={isOpen}
                isActive={activeRoute === route}
                onClick={() => onNavigate(route)}
              />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

// Desktop Header Component (Full-width)
const DesktopHeader = () => {
  return (
    <div className="hidden md:flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 h-16 relative z-30">
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
        <span className="ml-3 mt-2 text-[16px] font-medium text-[#4c0d68] whitespace-nowrap">
          Hi! Username
        </span>
      </div>
    </div>
  );
};

// Mobile Header Component
const MobileHeader = ({ onNavigate }) => {
  return (
    <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 bg-white border-b border-gray-200">
      <h1 className="ml-0.5 text-xl font-semibold text-purple-800 mt-5">Hi! username</h1>
      <button 
        onClick={() => onNavigate('/starred')}
        className="mt-5 mr-0.5"
      >
        <img
          src={assets.star_fill}
          alt="Starred Messages"
          className="w-[30px] h-[30px]"
        />
      </button>
    </div>
  );
};

// Mobile Bottom Navigation Component
const MobileBottomNav = ({ activeRoute, onNavigate }) => {
  const tabs = [
    {
      key: "group",
      label: "Group",
      icon: assets.grouplight,
      iconActive: assets.groupfill,
      route: "/group",
    },
    {
      key: "chat",
      label: "Chats", 
      icon: assets.chat,
      iconActive: assets.chat_click,
      route: "/chats",
      badge: 3,
    },
    {
      key: "profile",
      label: "Profile",
      icon: assets.user,
      iconActive: assets.user_click,
      route: "/profile",
    },
  ];

  return (
    <>
      {/* Floating New Message Button */}
      <button
        className="
          md:hidden fixed 
          bottom-[120px] right-4
          z-20
        "
        onClick={() => onNavigate("/new-message")}
      >
        <img
          src={assets.new_message}
          alt="New Message"
          className="w-12 h-12"
        />
      </button>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#f2f2f2] py-1 border-t border-gray-200 z-10">
        <div className="flex items-center justify-around relative">
          {tabs.map((tab) => {
            const isActive = activeRoute === tab.route;
            return (
              <button
                key={tab.key}
                onClick={() => onNavigate(tab.route)}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 ease-in-out
                    ${isActive ? "w-16 h-16 -translate-y-8" : "w-10 h-10"}
                  `}
                >
                  {isActive && (
                    <span
                      className="
                        absolute inset-0
                        rounded-full
                        bg-white
                        border-2 border-gray-300
                        flex items-center justify-center
                        shadow-xl
                        z-20
                      "
                    />
                  )}
                  <img
                    src={isActive ? tab.iconActive : tab.icon}
                    alt={tab.label}
                    className={`${isActive ? "w-6 h-6 z-30" : "w-6 h-6"} transition-all duration-300`}
                  />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFB400] text-white text-[10px] rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-sm text-purple-600 font-bold -mt-7"
                      : "text-sm text-gray-500 mt-1"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Main Layout Component
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (route) => {
    navigate(route);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Full-width Desktop Header */}
      <DesktopHeader onNavigate={handleNavigate} />
      
      {/* Mobile Header */}
      <MobileHeader onNavigate={handleNavigate} />

      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeRoute={location.pathname}
          onNavigate={handleNavigate}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ease-out ${isSidebarOpen ? '' : 'md:ml-0'}`}>

          {/* Main Content Area - Where all pages render */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="h-full bg-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeRoute={location.pathname}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default MainLayout;