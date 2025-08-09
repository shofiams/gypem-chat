import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

export default function ChatRoomLayout({ children }) {
  const [activeTab, setActiveTab] = useState("chat");
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "group") navigate("/");
    if (tab === "chat") navigate("/group");
    if (tab === "user") navigate("/profile");
  };

  const tabs = [
    {
      key: "group",
      label: "Group",
      icon: assets.grouplight,
      iconActive: assets.groupfill,
      route: "/",
    },
    {
      key: "chat",
      label: "Chats",
      icon: assets.chat,
      iconActive: assets.chat_click,
      route: "/group",
      badge: 10,
    },
    {
      key: "user",
      label: "Profile",
      icon: assets.user,
      iconActive: assets.user_click,
      route: "/profile",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="ml-0.5 text-xl font-semibold text-purple-800 mt-5">Hi! username</h1>
        <img
          src={assets.star_fill}
          alt="Favorite"
          className="w-[30px] h-[30px] mt-5 mr-0.5 "
        />
      </div>

      {/* Konten Utama */}
      <div className="pb-24">{children}</div>

      {/* Icon New Message di pojok kanan atas navbar */}
      <button
        className="
          fixed 
          bottom-[120px]
          right-2
          z-20
          mr-2
          md:hidden
        "
        onClick={() => navigate("/new-message")}
      >
        <img
          src={assets.new_message} // pastikan ada di assets
          alt="New Message"
          className="w-12 h-12"
        />
      </button>

      {/* Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#f2f2f2] py-1 border-t border-gray-200 z-10">
        <div className="flex items-center justify-around relative">
       {tabs.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
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
                  absolute
                  inset-0
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
              className={`${isActive ? "w-22 h-22 z-20" : "w-22 h-22"} transition-all duration-300`}
            />
          </div>
         <span
  className={`transition-all duration-300 ${
    isActive
      ? "text-base text-purple-600 font-bold -mt-7"
      : "text-base text-black-500 mt-1"
  }`}
>
  {tab.label}
</span>
        </button>
      );
    })}
  </div>
</div>

    </div>
  );
}
