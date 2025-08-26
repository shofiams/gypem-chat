import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Users,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowLeft,
} from "react-feather";

import logo from "../../assets/logo.png";

import GroupOverview from "./GroupOverview";
import GroupMembers from "./GroupMembers";
import GroupMedia from "./GroupMedia";
import GroupFiles from "./GroupFiles";
import GroupLinks from "./GroupLinks";

export default function GroupPopup({ onClose }) {
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

  const tabs = [
    { id: "overview", label: "Overview", icon: Grid },
    { id: "members", label: "Members", icon: Users },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "files", label: "Files", icon: FileText },
    { id: "links", label: "Links", icon: LinkIcon },
  ];

  const files = [
    { name: "Juknis Olympiade Star", type: "pdf", url: "/files/juknis1.pdf" },
    { name: "Juknis Olympiade Star", type: "pdf", url: "/files/juknis2.pdf" },
    { name: "Panduan Acara", type: "word", url: "/files/panduan.docx" },
    { name: "Formulir Pendaftaran", type: "word", url: "/files/formulir.docx" },
    { name: "Materi Presentasi", type: "pdf", url: "/files/materi.pdf" },
    { name: "Surat Undangan", type: "word", url: "/files/undangan.docx" },
  ];

  const links = Array(8).fill("https://www.flaticon.com/free-icon/folder_1092218");

  const members = [
    { name: "You", isAdmin: true, photo: logo },
    { name: "Shafira", photo: logo },
    { name: "Maulana", photo: logo },
    { name: "Jamil", photo: logo },
    { name: "Aku", photo: logo },
    { name: "Anak", photo: logo },
    { name: "Poliwangi", photo: logo },
    { name: "Jinggo", photo: logo },
    { name: "Yes", photo: logo },
    { name: "Yesss", photo: logo },
  ];

  const mediaFiles = import.meta.glob("../../assets/*.{JPG,jpg,png,mp4}", { eager: true });
  const mediaList = Object.values(mediaFiles).map((mod) => {
    const url = mod.default;
    const ext = url.split(".").pop().toLowerCase();
    return { type: ext === "mp4" ? "video" : "image", url };
  });

  const descriptionText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. " +
    "Lorem Ipsum has been the industry's standard dummy text ever since. " +
    "Additional text to simulate a longer description when see more is clicked. " +
    "Even more text to test scrolling in the main content area.".repeat(5);

  const handleExit = () => {
    setExitLoading(true);
    setTimeout(() => {
      setExitLoading(false);
      setExitText("Delete Group");
    }, 1500);
  };

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
                groupLogo={logo}
                seeMore={seeMore}
                setSeeMore={setSeeMore}
                descriptionText={descriptionText}
                handleExit={handleExit}
                exitLoading={exitLoading}
                exitText={exitText}
                setExitText={setExitText}
                groupPhoto={logo}
              />
            )}
            {activeTab === "members" && (
              <GroupMembers
                members={members}
                seeAllMembers={seeAllMembers}
                setSeeAllMembers={setSeeAllMembers}
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
