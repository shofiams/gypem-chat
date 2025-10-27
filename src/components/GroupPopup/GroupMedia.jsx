import React, { useState, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";

// Icon components sebagai pengganti react-icons
const ImageIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>
);

export default function GroupMedia({ mediaList = [], onNavigateToMessage }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState({});

  const photoList = mediaList.filter(media => media.type === "image" && media.url);

  useEffect(() => {
    if (photoList && photoList.length > 0) {
      photoList.forEach(photo => {
        const img = new Image();
        img.src = photo.url;
      });
    }
  }, [photoList]);

  useEffect(() => {
    setImageLoadError(prev => ({ ...prev, [currentIndex]: false }));
  }, [currentIndex]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photoList.length);
  };

  const downloadPhoto = async () => {
    try {
      const fullUrl = photoList[currentIndex].url;
      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = fullUrl.substring(fullUrl.lastIndexOf('/') + 1) || `photo-${currentIndex + 1}.jpg`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(photoList[currentIndex].url, '_blank');
    }
  };

  const handleModalImageError = () => {
    setImageLoadError(prev => ({ ...prev, [currentIndex]: true }));
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prevPhoto(); }
      if (e.key === "ArrowRight") { e.preventDefault(); nextPhoto(); }
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photoList.length]);

  const renderPhotoItem = (photo, index) => {
    const photoUrl = photo.url;
    
    return (
      <div
        key={photo.messageId || index}
        className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group aspect-square"
        onClick={() => openLightbox(index)}
      >
        <img
          src={photoUrl}
          crossOrigin="anonymous"
          alt={`Photo from ${photo.sender || 'Unknown'}`}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          draggable={false}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.parentElement.querySelector('.fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        
        <div className="fallback w-full h-full bg-gray-200 flex-col items-center justify-center text-gray-500 hidden text-center p-1">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs leading-tight">Failed to load image</span>
        </div>
        
        {photo.sender && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs truncate block">{photo.sender}</span>
          </div>
        )}
      </div>
    );
  };

  if (!photoList || photoList.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold">Photos (0)</h3>
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No photos shared yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Photos ({photoList.length})</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photoList.map(renderPhotoItem)}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && photoList[currentIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
          style={{ padding: "5%" }}
          onClick={closeLightbox}
        >
          {/* Bar kanan atas */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); if (onNavigateToMessage) onNavigateToMessage(photoList[currentIndex].messageId); }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all outline-none"
              title="Go to message"
            >
              <FiMessageSquare size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); downloadPhoto(); }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all outline-none"
              title="Download"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all outline-none"
              title="Close"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Counter foto */}
          {photoList.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentIndex + 1} / {photoList.length}
            </div>
          )}

          {/* Tombol Prev */}
          {photoList.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 flex items-center justify-center rounded-full transition-all outline-none z-10"
              title="Previous"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}

          {/* Konten Foto */}
          <div className="w-full h-full flex items-center justify-center">
            {imageLoadError[currentIndex] ? (
              <div className="bg-gray-900 bg-opacity-80 rounded-lg p-16 flex flex-col items-center justify-center text-white text-center">
                <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg mb-2">Failed to load image</p>
                <p className="text-sm text-gray-300">The image could not be displayed</p>
              </div>
            ) : (
              <img
                key={photoList[currentIndex].url}
                src={photoList[currentIndex].url}
                alt="Preview"
                crossOrigin="anonymous"
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
                onError={handleModalImageError}
              />
            )}
          </div>

          {/* Tombol Next */}
          {photoList.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 flex items-center justify-center rounded-full transition-all outline-none z-10"
              title="Next"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}