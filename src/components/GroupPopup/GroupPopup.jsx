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
import { authService } from "../../api/auth";
import logo from "../../assets/DefaultAvatar.svg";
import GroupOverview from "./GroupOverview";
import GroupMembers from "./GroupMembers";
import GroupMedia from "./GroupMedia";
import GroupFiles from "./GroupFiles";
import GroupLinks from "./GroupLinks";

export default function GroupPopup({ onClose, roomId, onLeaveSuccess }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [seeMore, setSeeMore] = useState(false);
  const [seeAllMembers, setSeeAllMembers] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const scrollRef = useRef(null);
  const popupRef = useRef(null);
  const hideTimeout = useRef(null);

  const currentUser = useMemo(() => authService.getCurrentUser(), []);

  const { roomDetails, loading: roomLoading, error: roomError, refetch: refetchRoomDetails } = useRoomDetails(roomId);
  
  const currentUserMemberInfo = useMemo(() => {
    if (!roomDetails?.members || !currentUser) {
      return { id: null, isLeft: false };
    }
    
    const currentUserId = currentUser?.user_id || currentUser?.admin_id;
    
    if (!currentUserId) {
      return { id: null, isLeft: false };
    }
    
    // Filter semua member dengan member_id yang sama dengan user_id
    const matchingMembers = roomDetails.members.filter(m => m.member_id === currentUserId);
    
    // Prioritas: peserta yang tidak is_left, lalu yang terbaru
    const member = matchingMembers.find(m => !m.is_left && m.member_type === 'peserta') ||
                   matchingMembers.find(m => m.member_type === 'peserta') ||
                   matchingMembers[matchingMembers.length - 1]; // fallback ke yang terakhir

    return {
      id: member ? member.room_member_id : null,
      isLeft: member ? member.is_left : false,
    };
  }, [roomDetails, currentUser]);

  const handleActionSuccess = (isDelete = false) => {
    if (isDelete) {
      onClose();
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
    } else {
      refetchRoomDetails();
      if (onLeaveSuccess){
        onLeaveSuccess();
      }
    }
  };

  const { 
    mediaList, 
    files, 
    links, 
    loading: mediaLoading, 
    error: mediaError,
    refetch: refetchMedia 
  } = useRoomMedia(roomId);

  useEffect(() => {
    const handleMessagesUpdate = (event) => {
      if (event.detail.roomId === roomId) {
        refetchMedia();
      }
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    return () => {
      window.removeEventListener('messagesUpdated', handleMessagesUpdate);
    };
  }, [roomId, refetchMedia]);
  
  const loading = roomLoading || mediaLoading;
  const error = roomError || mediaError;
  
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

 const processedMembers = useMemo(() => {
    if (!roomDetails?.members) return [];
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE; 
    const activeMembers = roomDetails.members.filter(member => !member.is_left);
    
    const mappedMembers = activeMembers.map(member => {
      let photoUrl = null;
      if (member.profile_photo) {
        photoUrl = member.profile_photo.startsWith('http://') || member.profile_photo.startsWith('https://') 
          ? member.profile_photo 
          : `${API_BASE_URL}/uploads/${member.profile_photo}`;
      }
      return {
        name: member.name,
        isAdmin: member.member_type === 'admin',
        photo: photoUrl
      };
    });
    return mappedMembers.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    });
  }, [roomDetails]);

  const roomInfo = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FILE;

    if (!roomDetails) {
      return {
        logo: logo,
        name: 'Loading...',
        description: 'Loading description...'
      };
    }

    const photoPath = roomDetails.room?.description?.url_photo;
    const fullLogoUrl = photoPath ? `${API_BASE_URL}/uploads/${photoPath}` : logo;
    
    return {
      logo: fullLogoUrl,
      name: roomDetails.room?.description?.name || 'Group',
      description: roomDetails.room?.description?.description || 'No description available'
    };
  }, [roomDetails]);

  const handleRefreshData = () => {
    if (refetchMedia) {
      refetchMedia();
    }
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
          <div className="flex space-x-2">
            <button 
              onClick={handleRefreshData}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Retry
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Grid },
    { 
      id: "members", 
      label: `Members`, 
      icon: Users 
    },
    { 
      id: "media", 
      label: `Photos`, 
      icon: ImageIcon 
    },
    { 
      id: "files", 
      label: `Files`, 
      icon: FileText 
    },
    { 
      id: "links", 
      label: `Links`, 
      icon: LinkIcon 
    },
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
          ${isMobile ? "top-0 left-0 w-full h-full" : "h-[450px] w-[650px] top-[10px] left-[390px] rounded-xl"}`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={onClose} className="mr-3">
              <ArrowLeft size={24} strokeWidth={2} />
            </button>
            <h2 className="font-semibold text-lg truncate">{roomInfo.name}</h2>
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
                onActionSuccess={handleActionSuccess}
                currentUserRoomMemberId={currentUserMemberInfo.id}
                isLeft={currentUserMemberInfo.isLeft}
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
            {activeTab === "links" && (
              <GroupLinks 
                links={links || []} 
              />
            )}
            {activeTab === "media" && (
              <GroupMedia 
                mediaList={mediaList || []} 
                openLightbox={openLightbox} 
              />
            )}
            {activeTab === "files" && (
              <GroupFiles 
                files={files || []} 
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}