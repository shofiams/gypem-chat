import React, { useState, useEffect, useRef } from "react";
import "./groupMedia.css";

export default function GroupMedia({ mediaList }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  // Preload semua media supaya cepat muncul
  useEffect(() => {
    mediaList.forEach(media => {
      if (media.type === "image") {
        const img = new Image();
        img.src = media.url;
      } else if (media.type === "video") {
        const video = document.createElement("video");
        video.src = media.url;
        video.preload = "auto";
      }
    });
  }, [mediaList]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  const downloadMedia = () => {
    const { url, type } = mediaList[currentIndex];
    const link = document.createElement("a");
    link.href = url;
    link.download = `media-${currentIndex + 1}.${type === "video" ? "mp4" : "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset video muted & volume saat ganti media atau buka lightbox
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0.5;
    }
  }, [currentIndex, lightboxOpen]);

  // Fungsi toggle play/pause
  const togglePlayPause = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  // Keyboard navigation + space toggle play/pause
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevMedia();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextMedia();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.code === "Space" && mediaList[currentIndex].type === "video") {
        e.preventDefault();
        togglePlayPause(e);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, currentIndex, mediaList]);

  const handleVideoClick = (e) => {
    if (e.target.tagName === "VIDEO") {
      togglePlayPause(e);
    }
  };

  // Hapus outline fokus dari tombol & kontrol video
  useEffect(() => {
    if (lightboxOpen) {
      const style = document.createElement("style");
      style.textContent = `
        video::-webkit-media-controls-play-button:focus,
        video::-webkit-media-controls-mute-button:focus,
        video::-webkit-media-controls-volume-slider:focus,
        video::-webkit-media-controls-timeline:focus,
        video::-webkit-media-controls-current-time-display:focus,
        video::-webkit-media-controls-time-remaining-display:focus,
        video::-webkit-media-controls-fullscreen-button:focus,
        button:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        video:focus {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [lightboxOpen]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Media</h3>
      <div className="grid grid-cols-4 gap-4">
        {mediaList.map((media, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-xl cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
                loading="lazy"
              />
            ) : (
              <video
                src={media.url}
                className="w-full h-full object-cover select-none outline-none"
                muted
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload noremoteplayback nofullscreen"
                playsInline
                webkit-playsinline="true"
              />
            )}
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeLightbox}
          tabIndex={-1}
        >
          {/* Bar kanan atas */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {/* Icon Download */}
            <div className="group flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadMedia();
                }}
                className="text-white w-9 h-9 flex items-center justify-center outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <span className="mt-0.5 px-2 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                Download
              </span>
            </div>

            

            {/* Tombol Close */}
            <div className="group flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="text-white w-9 h-9 flex items-center justify-center outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span className="mt-0.5 px-2 py-0.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                Close
              </span>
            </div>
          </div>

          {/* Tombol Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevMedia();
            }}
            className="absolute left-4 text-white outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Konten */}
          {mediaList[currentIndex].type === "image" ? (
            <img
              src={mediaList[currentIndex].url}
              alt="Preview"
              className="max-h-[80%] max-w-[80%] rounded-lg shadow-lg select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          ) : (
            <video
              ref={videoRef}
              src={mediaList[currentIndex].url}
              controls
              autoPlay
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload noremoteplayback noplaybackrate nofullscreen"
              className="max-h-[80%] max-w-[80%] rounded-lg shadow-lg outline-none select-none"
              onClick={handleVideoClick}
              playsInline
              webkit-playsinline="true"
            />
          )}

          {/* Tombol Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextMedia();
            }}
            className="absolute right-4 text-white outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
