import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Grid,
  Users,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowLeft,
} from "react-feather";

import { useRoomDetails } from "../../hooks/useRooms";
import { useRoomMedia } from "../../hooks/useMessages";
import logo from "../../assets/logo.png";
import GroupOverview from "./GroupOverview";
import GroupMembers from "./GroupMembers";
import GroupMedia from "./GroupMedia";
import GroupFiles from "./GroupFiles";
import GroupLinks from "./GroupLinks";

export default function GroupPopup({ onClose, roomId }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [seeMore, setSeeMore] = useState(false);
  const [seeAllMembers, setSeeAllMembers] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [exitText, setExitText] = useState("Exit Group");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const scrollRef = useRef(null);
  const popupRef = useRef(null);
  const hideTimeout = useRef(null);

  // Use hooks for data fetching
  const { roomDetails, loading: roomLoading, error: roomError } = useRoomDetails(roomId);
  const { mediaList, files, links, loading: mediaLoading, error: mediaError } = useRoomMedia(roomId);

  const loading = roomLoading || mediaLoading;
  const error = roomError || mediaError;

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-hide scrollbar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleInteraction = () => {
      setShowScrollbar(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setShowScrollbar(false), 2000);
    };

    ["scroll", "wheel", "touchstart", "pointerdown"].forEach((event) => {
      el.addEventListener(event, handleInteraction);
    });
    return () => {
      ["scroll", "wheel", "touchstart", "pointerdown"].forEach((event) => {
        el.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Process members data from API
  const processedMembers = useMemo(() => {
    if (!roomDetails?.members) return [];
    
    return roomDetails.members.map(member => ({
      name: member.nama || 'Unknown',
      isAdmin: member.member_type === 'admin',
      photo: null // API doesn't provide member photos yet
    }));
  }, [roomDetails]);

  // Get room info from API - FIXED: Always return an object with default values
  const roomInfo = useMemo(() => {
    const defaultInfo = {
      logo: logo,
      name: 'Group',
      description: 'No description available'
    };

    if (!roomDetails?.room?.description) {
      return defaultInfo;
    }
    
    const { description } = roomDetails.room;
    return {
      logo: description.url_photo || logo,
      name: description.name || 'Group',
      description: description.description || 'No description available'
    };
  }, [roomDetails]);

  // Handle exit/delete group
  const handleExit = () => {
    setExitLoading(true);
    // TODO: Implement actual API call for leave/delete group
    setTimeout(() => {
      setExitLoading(false);
      setExitText("Delete Group");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <p>Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={onClose} 
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Grid },
    { id: "members", label: "Members", icon: Users },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "files", label: "Files", icon: FileText },
    { id: "links", label: "Links", icon: LinkIcon },
  ];

  const openLightbox = (index) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      {/* Custom CSS */}
      <style>{`
        .custom-scroll { overflow-y: overlay; scrollbar-width: thin; scrollbar-color: rgba(200,200,200,0.7) transparent; scrollbar-gutter: stable; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(200,200,200,0.7); border-radius: 10px; transition: opacity 0.3s ease; }
        .custom-scroll.scroll-hidden::-webkit-scrollbar-thumb { opacity: 0; }
        .custom-scroll.scroll-visible::-webkit-scrollbar-thumb { opacity: 1; }
      `}</style>

      <div
        ref={popupRef}
        className={`fixed z-50 bg-white shadow-lg overflow-hidden 
          ${isMobile
            ? "top-0 left-0 w-full h-full"
            : "h-[450px] w-[650px] top-[10px] left-[390px] rounded-xl"}`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={onClose} className="mr-3">
              <ArrowLeft size={24} strokeWidth={2} />
            </button>
            <h2 className="font-semibold text-lg">Group Detail</h2>
          </div>
        )}

        <div className="flex h-full">
          {/* Sidebar */}
          {isMobile ? (
            <div className="w-14 min-w-[3.5rem] bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-6">
              {tabs.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  icon={Icon}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all
                    ${activeTab === id ? "bg-gray-100" : ""}`}
                >
                  {activeTab === id && (
                    <span className="absolute left-0 h-6 w-1 bg-yellow-400 rounded-r" />
                  )}
                  <Icon size={20} strokeWidth={1.5} className={activeTab === id ? "text-gray-900" : "text-gray-500"} />
                </button>
              ))}
            </div>
          ) : (
            <div className="w-52 bg-gray-50 border-r border-gray-200 flex-shrink-0">
              <nav className="flex flex-col py-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    icon={Icon}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center relative px-4 py-3 text-left rounded-r-full transition-all
                      ${activeTab === id ? "bg-white font-semibold text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {activeTab === id && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r" />
                    )}
                    <Icon size={20} strokeWidth={1} className={`mr-3 ${activeTab === id ? "text-gray-900" : "text-gray-500"}`} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Main Content */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto p-6 bg-white custom-scroll ${showScrollbar ? "scroll-visible" : "scroll-hidden"}`}
          >
            {activeTab === "overview" && (
              <GroupOverview
                groupLogo={roomInfo.logo}
                groupName={roomInfo.name}
                seeMore={seeMore}
                setSeeMore={setSeeMore}
                descriptionText={roomInfo.description}
                handleExit={handleExit}
                exitLoading={exitLoading}
                exitText={exitText}
                setExitText={setExitText}
              />
            )}
            {activeTab === "members" && (
              <GroupMembers
                members={processedMembers}
                seeAllMembers={seeAllMembers}
                setSeeAllMembers={setSeeAllMembers}
                groupLogo={roomInfo.logo}
              />
            )}
            {activeTab === "links" && <GroupLinks links={links} />}
            {activeTab === "media" && <GroupMedia mediaList={mediaList} openLightbox={openLightbox} />}
            {activeTab === "files" && <GroupFiles files={files} />}
          </div>
        </div>
      </div>
    </>
  );
}