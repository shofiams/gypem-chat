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
  const scrollRef = useRef(null);
  const hideTimeout = useRef(null);
  const popupRef = useRef(null);

  // deteksi mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleInteraction = () => {
      setShowScrollbar(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        setShowScrollbar(false);
      }, 2000);
    };
    el.addEventListener("scroll", handleInteraction);
    el.addEventListener("wheel", handleInteraction);
    el.addEventListener("touchstart", handleInteraction);
    el.addEventListener("pointerdown", handleInteraction);
    return () => {
      el.removeEventListener("scroll", handleInteraction);
      el.removeEventListener("wheel", handleInteraction);
      el.removeEventListener("touchstart", handleInteraction);
      el.removeEventListener("pointerdown", handleInteraction);
    };
  }, []);

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
    return { type: ["mp4"].includes(ext) ? "video" : "image", url };
  });

  const descriptionText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since. " +
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
      <div
        ref={popupRef}
        className={`fixed z-50 bg-white shadow-lg overflow-hidden 
        ${isMobile ? "top-0 left-0 w-full h-full" : "h-[450px] w-[650px] top-[10px] left-[390px] rounded-xl"}`}
      >
        {/* Header untuk mobile */}
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
          {/* Sidebar */}
{/* Sidebar */}
{isMobile ? (
  <div className="w-14 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-3 gap-4">
    {tabs.map((tab) => {
      const IconComp = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex items-center justify-center w-full py-3 transition-all
            ${isActive ? "bg-white" : "hover:bg-gray-100"}`}
        >
          {/* strip kuning di kiri */}
          {isActive && (
            <span className="absolute left-0 h-6 w-1 bg-yellow-400 rounded-r"></span>
          )}
          <IconComp
  size={20}
  strokeWidth={1.5}
  className={isActive ? "text-gray-900" : "text-gray-500"}
/>

        </button>
      );
    })}
  </div>
) : (
  <div className="w-52 bg-gray-50 border-r border-gray-200 flex-shrink-0">
    <nav className="flex flex-col py-2">
      {tabs.map((tab) => {
        const IconComp = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center relative px-4 py-3 text-left rounded-r-full transition-all
              ${
                activeTab === tab.id
                  ? "bg-white font-semibold text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {activeTab === tab.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r"></span>
            )}
            <IconComp
              size={20}
              strokeWidth={1}
              className={`mr-3 ${
                activeTab === tab.id ? "text-gray-900" : "text-gray-500"
              }`}
            />
            {tab.label}
          </button>
        );
      })}
    </nav>
  </div>
)}


          {/* Main Content */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto p-6 bg-white ${showScrollbar ? "scroll-visible" : "scroll-hidden"}`}
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
            {activeTab === "media" && (
              <GroupMedia mediaList={mediaList} openLightbox={openLightbox} />
            )}
            {activeTab === "files" && <GroupFiles files={files} />}
          </div>
        </div>
      </div>
    </>
  );
}
