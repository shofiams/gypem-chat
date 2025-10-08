import React, { useState, useEffect, useRef } from "react";
import { X } from "react-feather";
import { useRoomOperations } from "../../hooks/useRooms";

export default function GroupOverview({
  groupLogo,
  groupName,
  seeMore,
  setSeeMore,
  descriptionText,
  onActionSuccess,
  currentUserRoomMemberId,
  isLeft,
}) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const { leave, deleteRooms, loading } = useRoomOperations();

  const exitPopupRef = useRef(null);
  const deletePopupRef = useRef(null);
  const lightboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showExitConfirm && exitPopupRef.current && !exitPopupRef.current.contains(e.target)) {
        setShowExitConfirm(false);
      }
      if (showDeleteConfirm && deletePopupRef.current && !deletePopupRef.current.contains(e.target)) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExitConfirm, showDeleteConfirm]);

  // Handle escape key untuk menutup lightbox
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showImageLightbox) {
        setShowImageLightbox(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showImageLightbox]);

  const handleConfirmExit = async () => {

    if (!currentUserRoomMemberId) {
      console.error("Exit failed: currentUserRoomMemberId is null or undefined.");
      alert("Error: Tidak dapat menemukan ID keanggotaan Anda.");
      return;
    }

    const result = await leave(currentUserRoomMemberId);
    setShowExitConfirm(false);

    if (result.success) {
      onActionSuccess();
    } else {
      alert(result.error || "Gagal keluar dari grup.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentUserRoomMemberId) return;
    const result = await deleteRooms([currentUserRoomMemberId]);
    setShowDeleteConfirm(false);
    if (result.success) {
      onActionSuccess(true);
    } else {
      alert(result.error || "Gagal menghapus grup.");
    }
  };

  const exitText = isLeft ? "Delete Group" : "Exit Group";

  return (
    <div>
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src={groupLogo}
          alt="Group Logo"
          crossOrigin="anonymous"
          className="w-28 h-28 rounded-full shadow-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowImageLightbox(true)}
        />
        <h2 className="mt-4 text-lg font-semibold">{groupName}</h2>
      </div>

      {/* Deskripsi */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
        <div className="bg-gray-50 px-5 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-700 text-justify">
            {seeMore ? descriptionText : (descriptionText.length > 150 ? descriptionText.slice(0, 150) + "..." : descriptionText)}
          </p>
          {!seeMore && descriptionText.length > 150 && (
            <button
              onClick={() => setSeeMore(true)}
              className="text-yellow-500 mt-2 text-sm hover:underline"
            >
              Show More
            </button>
          )}
        </div>
      </div>

      {/* Tombol utama Exit/Delete */}
      <div className="mt-6 relative flex justify-center">
        <button
          onClick={() => {
            if (isLeft) {
              setShowDeleteConfirm(true);
            } else {
              setShowExitConfirm(true);
            }
          }}
          className="w-full bg-gray-50 text-red-500 rounded-full px-4 py-2 font-semibold flex justify-center items-center hover:bg-red-50 transition"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 mr-2"></span>
              Loading...
            </>
          ) : (
            exitText
          )}
        </button>

        {/* Popup Konfirmasi Exit */}
        {showExitConfirm && (
          <div
            ref={exitPopupRef}
            className="absolute bottom-full mb-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center animate-fadeIn z-50"
          >
            <p className="text-gray-800 font-medium mb-4">Exit Group?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                disabled={loading}
              >
                {loading ? "Exiting..." : "Exit"}
              </button>
            </div>
          </div>
        )}

        {/* Popup Konfirmasi Delete */}
        {showDeleteConfirm && (
          <div
            ref={deletePopupRef}
            className="absolute bottom-full mb-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center animate-fadeIn z-50"
          >
            <p className="text-gray-800 font-medium mb-4">Delete Group?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox untuk memperbesar gambar */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowImageLightbox(false)}
        >
          {/* Tombol Close */}
          <button
            onClick={() => setShowImageLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} strokeWidth={2} />
          </button>

          {/* Gambar yang diperbesar */}
          <div
            ref={lightboxRef}
            className="relative max-w-4xl max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={groupLogo}
              alt={groupName}
              crossOrigin="anonymous"
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        `}
      </style>
    </div>
  );
}