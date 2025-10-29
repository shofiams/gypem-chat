import React from 'react';
import { assets } from "../../../assets/assets";
import { HiUserCircle } from "react-icons/hi2";

const MobileBottomNav = ({ activeRoute, onNavigate, onProfileClick, profileImage, isDefaultProfile, isProfilePopupOpen, chatBadgeCount, groupBadgeCount }) => {
  const tabs = [
    { key: "group", label: "Group", icon: assets.grouplight, iconActive: assets.groupfill, route: "/group", badge: groupBadgeCount },
    { key: "chat", label: "Chats", icon: assets.chat, iconActive: assets.chat_click, route: "/chats", badge: chatBadgeCount },
    { key: "profile", label: "Profile", iconActive: assets.user_click, route: "/profile", isProfile: true },
  ];

  return (
    <>
      <button
        className="md:hidden fixed bottom-[120px] right-4 z-20"
        onClick={() => onNavigate("/new-message")}
      >
        <img src={assets.new_message} alt="New Message" className="w-12 h-12" />
      </button>

      <div className="md:hidden fixed bottom-0 w-full bg-[#f2f2f2] py-1 border-t border-gray-200 z-50">
        <div className="flex items-center justify-around relative">
          {tabs.map((tab) => {
            const isActive = isProfilePopupOpen ? tab.isProfile : activeRoute === tab.route;
            return (
              <button
                key={tab.key}
                onClick={() => tab.isProfile ? onProfileClick() : onNavigate(tab.route)}
                className="relative flex flex-col items-center"
              >
                <div className={`relative flex items-center justify-center transition-all duration-300 ease-in-out ${isActive ? "w-16 h-16 -translate-y-8" : "w-10 h-10"}`}>
                  {isActive && <span className="absolute inset-0 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-xl z-30" />}
                  {tab.isProfile ? (
                    isDefaultProfile ? (
                        <HiUserCircle className={`${isActive ? "text-purple-600" : "text-gray-500"} ${isActive ? "w-10 h-10 z-30" : "w-10 h-10"} transition-all duration-300`} />
                    ) : (
                        <img src={profileImage} alt={tab.label} className={`${isActive ? "w-10 h-10 z-30 rounded-full object-cover" : "w-10 h-10 rounded-full object-cover"} transition-all duration-300`} />
                    )
                  ) : (
                    <img src={isActive ? tab.iconActive : tab.icon} alt={tab.label} className={`${isActive ? "w-10 h-10 z-30" : "w-10 h-10"} transition-all duration-300`} />
                  )}
      
                  {tab.badge != null && tab.badge > 0 && !isActive && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFB400] text-white text-[10px] rounded-full flex items-center justify-center">{tab.badge}</span>}
                </div>
                <span className={`transition-all duration-300 ${isActive ? "text-sm text-purple-600 font-bold -mt-7" : "text-sm text-gray-500 mt-1"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;