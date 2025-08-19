import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { assets } from '../assets/assets';
import { BsChatSquareText } from "react-icons/bs";
import { MdOutlineGroups } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaRegStar, FaUserCircle } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useChatContext } from '../api/use_chat_context';
import NewMessagePopup from '../components/new_message'; 
import ProfilePopup from '../components/profile_popup';

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
          transition-all duration-300 ease-out
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
              transition-all duration-300 ease-in-out
              ${isOpen ? "w-[calc(95%)]" : "w-[40px]"}
            `}
          />
        )}

        {/* Individual Active indicator */}
        {isActive && (
          <span
            className="
              absolute left-0
              top-1/2 -translate-y-1/2
              bg-[#FFB400]
              w-[3px] h-[20px]
              rounded-full
              transition-all duration-300 ease-out
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
              transition-all duration-300 ease-out text-left
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
              transition-all duration-300 ease-out
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

// Desktop Sidebar Component
const DesktopSidebar = ({ isOpen, toggleSidebar, activeRoute, onNavigate, onProfileClick, profileImage, isDefaultProfile, isNewMessageOpen, isProfilePopupOpen }) => {
  const menuItems = [
    { icon: <BsChatSquareText size={20} />, label: "Chats", badge: 10, route: "/chats" },
    { icon: <MdOutlineGroups size={25} />, label: "Group", route: "/group" },
    { icon: <FiEdit size={20} />, label: "New Message", route: "/new-message", isPopup: true },
  ];

  const extraItems = [
    { 
      icon: <FaRegStar size={20} />, 
      label: "Starred Messages", 
      route: "/starred"
    },
  ];

  // Helper function to determine if an item should be active
  const isItemActive = (route, isPopup = false) => {
    if (isPopup && route === '/new-message') {
      return isNewMessageOpen;
    }
    
    if (isNewMessageOpen || isProfilePopupOpen) {
      return false;
    }
    
    return activeRoute === route;
  };

  return (
    <aside
      className={`
        hidden md:block bg-white
        fixed top-16 left-0 z-50 shadow-lg
        ${isOpen ? 'w-60' : 'w-16'}
        transition-all duration-300 ease-out
      `}
      style={{ height: 'calc(100vh - 64px)' }} 
    >
      {/* Body */}
      <div className={`flex flex-col flex-1 overflow-hidden pt-4 h-full`}>
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

          {/* Extra items */}
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
            
            {/* Profile Item with Custom Styling */}
            <div className="px-2 my-1">
              <button
                onClick={onProfileClick}
                className={`
                  relative w-full flex px-3
                  py-2.5
                  hover:bg-gray-100 rounded-lg
                  transition-all duration-300 ease-out
                  ${isProfilePopupOpen ? "bg-gray-100" : ""}
                `}
              >
                {/* Individual Active indicator for Profile */}
                {isProfilePopupOpen && (
                  <span
                    className="
                      absolute left-0
                      top-1/2 -translate-y-1/2
                      bg-[#FFB400]
                      w-[3px] h-[20px]
                      rounded-full
                      transition-all duration-300 ease-out
                    "
                  />
                )}

                {/* Profile Icon/Image */}
                <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
                  {isDefaultProfile ? (
                    <CgProfile className="text-gray-600 transition-colors duration-300 ease-out" style={{ fontSize: '18px' }} />
                  ) : (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                </div>

                {/* Label */}
                <div className="overflow-hidden flex-1 ml-3">
                  <span 
                    className={`
                      block text-[14px] text-[#333] whitespace-nowrap
                      transition-all duration-300 ease-out text-left
                      ${isOpen 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-4'
                      }
                    `}
                  >
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

// Desktop Header Component
const DesktopHeader = () => {
  return (
    <div className="hidden md:flex items-center justify-between px-4 py-4 bg-white h-16 relative z-30">
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
    <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 bg-white">
      <h1 className="ml-0.5 text-xl font-semibold text-purple-800 mt-5">Hi! username</h1>
      <button onClick={() => onNavigate('/starred')} className="mt-5 mr-0.5">
        <img src={assets.star_fill} alt="Starred Messages" className="w-[30px] h-[30px]" />
      </button>
    </div>
  );
};

// Mobile Bottom Navigation Component
const MobileBottomNav = ({ activeRoute, onNavigate, onProfileClick, profileImage, isDefaultProfile, isProfilePopupOpen }) => {
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
      isProfile: true,
    },
  ];

  return (
    <>
      {/* Floating New Message Button */}
      <button
        className="md:hidden fixed bottom-[120px] right-4 z-20"
        onClick={() => onNavigate("/new-message")}
      >
        <img src={assets.new_message} alt="New Message" className="w-12 h-12" />
      </button>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#f2f2f2] py-1 border-t border-gray-200 z-50">
        <div className="flex items-center justify-around relative">
          {tabs.map((tab) => {
            const isActive = isProfilePopupOpen ? tab.isProfile : activeRoute === tab.route;
            
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.isProfile) {
                    onProfileClick();
                  } else {
                    onNavigate(tab.route);
                  }
                }}
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
                        z-30
                      "
                    />
                  )}
                  {tab.isProfile && !isDefaultProfile ? (
                    <img
                      src={profileImage}
                      alt={tab.label}
                      className={`${isActive ? "w-10 h-10 z-30 rounded-full object-cover" : "w-10 h-10 rounded-full object-cover"} transition-all duration-300`}
                    />
                  ) : (
                    <img
                      src={isActive ? tab.iconActive : tab.icon}
                      alt={tab.label}
                      className={`${isActive ? "w-10 h-10 z-30" : "w-10 h-10"} transition-all duration-300`}
                    />
                  )}
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
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const { clearActiveChat, setActiveChat } = useChatContext();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chats/') && location.pathname !== '/chats' || location.pathname.startsWith('/group/') && location.pathname !== '/group';

  // Auto-redirect to /chats if on root path
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      navigate('/chats', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Load profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const isDefaultProfile = profileImage === "";

  const handleProfileClick = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
    // Close new message popup if it's open
    if (isNewMessageOpen) {
      setIsNewMessageOpen(false);
    }
  };

  const handleProfileUpdate = (newProfileImage) => {
    setProfileImage(newProfileImage);
  };

  const handleNavigate = (route) => {
    if (route === "/new-message") {
      setIsNewMessageOpen(true);
      // Close profile popup if it's open
      if (isProfilePopupOpen) {
        setIsProfilePopupOpen(false);
      }
      return;
    }

    // Close all popups IMMEDIATELY when navigating to a regular route
    setIsNewMessageOpen(false);
    setIsProfilePopupOpen(false);

    const currentIsGroupPage = location.pathname.startsWith('/group');
    const targetIsGroupPage = route.startsWith('/group');
      
    if (currentIsGroupPage !== targetIsGroupPage) {
      clearActiveChat();
    }

    navigate(route);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      
      // If switching from mobile to desktop
      if (!currentIsMobile) {
        const pathname = location.pathname;
        
        // Handle individual chat routes
        if (pathname.startsWith('/chats/') && pathname !== '/chats') {
          const chatId = pathname.split('/chats/')[1];
          // Navigate to main chats page and set active chat for split view
          navigate('/chats', { replace: true });
          // Small delay to ensure navigation completes before setting active chat
          setTimeout(() => {
            setActiveChat(chatId);
          }, 50);
        }
        
        // Handle individual group routes
        else if (pathname.startsWith('/group/') && pathname !== '/group') {
          const groupId = pathname.split('/group/')[1];
          // Navigate to main group page and set active chat for split view
          navigate('/group', { replace: true });
          // Small delay to ensure navigation completes before setting active chat
          setTimeout(() => {
            setActiveChat(groupId);
          }, 50);
        }
      }
      // If switching from desktop to mobile, clear active chat
      else {
        clearActiveChat();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, setActiveChat, clearActiveChat, location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Full-width Desktop Header */}
      <DesktopHeader onNavigate={handleNavigate} />
      
      {/* Mobile Header */}
      {!isChatRoute && <MobileHeader onNavigate={handleNavigate} />}

      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeRoute={location.pathname}
          onNavigate={handleNavigate}
          onProfileClick={handleProfileClick}
          profileImage={profileImage}
          isDefaultProfile={isDefaultProfile}
          isNewMessageOpen={isNewMessageOpen}
          isProfilePopupOpen={isProfilePopupOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 md:ml-16">
          {/* Main Content Area - Where all pages render */}
          <main className={`flex-1 overflow-y-auto ${isChatRoute ? 'pb-0' : 'pb-20'} md:pb-0 md:border-l-2 md:border-t-2 md:border-grey-600 md:rounded-tl-lg`}>
            <div className="h-full bg-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {!isChatRoute && (
        <MobileBottomNav
          activeRoute={location.pathname}
          onNavigate={handleNavigate}
          onProfileClick={handleProfileClick}
          profileImage={profileImage}
          isDefaultProfile={isDefaultProfile}
          isProfilePopupOpen={isProfilePopupOpen}
        />
      )}

      {/* New Message Popup */}
      <NewMessagePopup 
        isOpen={isNewMessageOpen} 
        onClose={() => setIsNewMessageOpen(false)} 
      />

      {/* Profile Popup */}
      {isProfilePopupOpen && (
        <ProfilePopup
          isOpen={isProfilePopupOpen}
          onClose={() => setIsProfilePopupOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default MainLayout;