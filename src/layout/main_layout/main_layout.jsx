import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useChatContext } from '../../api/use_chat_context';
import { useRooms } from '../../hooks/useRooms';
import { useStarredMessages } from '../../hooks/useStarredMessages';

// Import komponen yang sudah dimodularisasi
import DesktopSidebar from '../main_layout/components/DekstopSidebar';
import DesktopHeader from '../main_layout/components/DekstopHeader';
import MobileHeader from '../main_layout/components/MobileHeader';
import MobileBottomNav from '../main_layout/components/MobileBottomNav';

// Import popup
import NewMessagePopup from '../../components/new_message'; 
import ProfilePopup from '../../components/profile_popup';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  
  const { clearActiveChat, setActiveChat } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const isChatRoute = (location.pathname.startsWith('/chats/') && location.pathname !== '/chats') || 
                      (location.pathname.startsWith('/group/') && location.pathname !== '/group');

  const { refetch: refetchRooms } = useRooms();
  const { refetch: refetchStarred } = useStarredMessages({ manual: true });

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      navigate('/chats', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const isDefaultProfile = profileImage === "";

  const handleProfileClick = () => {
    setIsProfilePopupOpen(prev => !prev);
    if (isNewMessageOpen) setIsNewMessageOpen(false);
    setIsSidebarOpen(false);
  };

  const handleProfileUpdate = (newProfileImage) => {
    setProfileImage(newProfileImage);
  };

  const handleNavigate = (route) => {
    if (route === "/new-message") {
      setIsNewMessageOpen(true);
      if (isProfilePopupOpen) setIsProfilePopupOpen(false);
      setIsSidebarOpen(false);
      return;
    }

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

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleChatCreated = useCallback(async () => {
    try {
      await refetchRooms();
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (location.pathname === '/starred') {
        await refetchStarred();
      }
      
      if (location.pathname !== '/chats' && location.pathname !== '/group') {
        navigate('/chats');
      }
    } catch (error) {
      console.error("Error refreshing chat list:", error);
    }
  }, [refetchRooms, refetchStarred, location.pathname, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        const pathname = location.pathname;
        if (pathname.startsWith('/chats/') && pathname !== '/chats') {
          const chatId = pathname.split('/chats/')[1];
          navigate('/chats', { replace: true });
          setTimeout(() => setActiveChat(chatId), 50);
        } else if (pathname.startsWith('/group/') && pathname !== '/group') {
          const groupId = pathname.split('/group/')[1];
          navigate('/group', { replace: true });
          setTimeout(() => setActiveChat(groupId), 50);
        }
      } else {
        clearActiveChat();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, setActiveChat, clearActiveChat, location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (window.innerWidth < 768 || !isSidebarOpen || !sidebarRef.current) return;
      if (!sidebarRef.current.contains(e.target)) setIsSidebarOpen(false);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('touchstart', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopHeader />
      
      {!isChatRoute && <MobileHeader onNavigate={handleNavigate} />}

      <div className="flex flex-1 overflow-hidden relative">
        <DesktopSidebar
          sidebarRef={sidebarRef}
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

        <div className="flex flex-col flex-1 md:ml-16">
          <main className={`flex-1 overflow-y-auto ${isChatRoute ? 'pb-0' : 'pb-20'} md:pb-0 md:border-l-2 md:border-t-2 md:border-grey-600 md:rounded-tl-lg`}>
            <div className="h-full bg-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

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

      <NewMessagePopup 
        isOpen={isNewMessageOpen} 
        onClose={() => setIsNewMessageOpen(false)} 
        onChatCreated={handleChatCreated}
      />

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