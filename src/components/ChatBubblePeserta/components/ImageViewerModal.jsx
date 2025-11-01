import React, { useState, useEffect } from "react";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageViewerModal = (props) => {
  const {
    isImageModalOpen,
    handleImageClick,
    handleImagePrevious,
    handleImageNext,
    images,
  } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isImageModalOpen) {
      setIsLoading(true);
      setError(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };
  
  // --- AWAL PERUBAHAN ---
  const handleDownload = async (e) => {
    // 1. Hentikan perambatan event agar tidak menutup modal
    e.stopPropagation(); 
    
    try {
      const response = await fetch(props.image, {
        mode: "cors",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      try {
        const link = document.createElement("a");
        link.href = props.image;
        link.download = "image.jpg";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        alert(
          'Download failed. Please try right-clicking the image and selecting "Save image as..."'
        );
      }
    }
  };

  if (!isImageModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={handleImageClick}
    >
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleImageClick}
      />

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          // 2. Handler onClick sekarang memanggil fungsi yang sudah diperbaiki
          onClick={handleDownload}
          className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Download image"
          disabled={isLoading || error}
        >
          <Download
            className={`w-5 h-5 text-white ${
              isLoading || error ? "opacity-50" : "opacity-100"
            }`}
          />
        </button>

        <button
          // 3. Hentikan perambatan event untuk tombol Close
          onClick={(e) => {
            e.stopPropagation();
            handleImageClick();
          }}
          className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
          title="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {images && images.length > 1 && (
        <>
          <button
            // 4. Hentikan perambatan event untuk tombol Previous
            onClick={(e) => {
                e.stopPropagation();
                handleImagePrevious();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
            title="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            // 5. Hentikan perambatan event untuk tombol Next
            onClick={(e) => {
                e.stopPropagation();
                handleImageNext();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded transition-all duration-200"
            title="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
      {/* --- AKHIR PERUBAHAN --- */}
      
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center justify-center w-96 h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center w-96 h-96 text-white">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg">Failed to load image</p>
              <p className="text-sm opacity-70 mt-1">
                The image could not be displayed
              </p>
            </div>
          )}

          <img
            src={props.image}
            alt="Full size view"
            crossOrigin="anonymous"
            className={`max-w-full max-h-[85vh] object-contain cursor-pointer transition-opacity duration-200 ${
              isLoading || error ? "hidden" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              width: "auto",
              height: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;