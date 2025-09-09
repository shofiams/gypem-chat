import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";

const FileUploadPopup = ({ isOpen, onClose, onSend, fileButtonRef }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [caption, setCaption] = useState("");
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto focus dan global event listener untuk Enter
  useEffect(() => {
    if (isOpen && selectedFile) {
      // Auto focus pada container
      if (containerRef.current) {
        containerRef.current.focus();
      }

      // Global event listener untuk Enter key
      const handleGlobalKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          // Langsung kirim file dengan caption (bisa kosong)
          onSend({
            file: selectedFile,
            type: fileType,
            caption: caption.trim()
          });
          handleClose();
        }
      };

      document.addEventListener('keydown', handleGlobalKeyDown, true);
      
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
      };
    }
  }, [isOpen, selectedFile, fileType, caption, onSend]);

  if (!isOpen) return null;

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleDocumentSelect = () => {
    documentInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile({
          file: file,
          preview: e.target.result,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
        setFileType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        file: file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      setFileType('document');
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onSend({
        file: selectedFile,
        type: fileType,
        caption: caption.trim()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileType(null);
    setCaption("");
    onClose();
  };

  if (!selectedFile) {
    // Initial popup - show options (positioned above file button)
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={handleClose}
        />
        
        {/* Popup positioned above file button */}
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{
            bottom: fileButtonRef?.current ? 
              `${window.innerHeight - fileButtonRef.current.getBoundingClientRect().top + 10}px` : '80px',
            left: fileButtonRef?.current ? 
              `${fileButtonRef.current.getBoundingClientRect().left}px` : '50px',
            minWidth: '200px'
          }}
        >
          {/* Options */}
          <div className="p-2">
            <button
              onClick={handleImageSelect}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <img src={assets.Image} alt="Images" className="w-6 h-6" />
              <span className="text-sm font-medium text-gray-800">Images</span>
            </button>
            
            <button
              onClick={handleDocumentSelect}
              className="w-full flex items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <img src={assets.Doc} alt="Documents" className="w-8 h-7" />
              <span className="text-sm font-medium text-gray-800">Documen</span>
            </button>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc"
            onChange={handleDocumentChange}
            className="hidden"
          />
        </div>
      </>
    );
  }

  // File selected - show preview with caption (fullscreen like in the image)
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-white z-50 flex flex-col max-h-screen outline-none"
      tabIndex="0"
    >
      {/* Header - FIXED HEIGHT */}
      <div className="flex-shrink-0 flex items-center justify-end p-4 border-b border-gray-200 bg-white">
        <button
          onClick={handleClose}
          className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100 rounded transition"
        >
          Cancel
        </button>
      </div>

      {/* Preview Area - FLEXIBLE HEIGHT WITH LIMITS */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full flex flex-col items-center">
          {fileType === 'image' ? (
            <div className="w-full max-h-[60vh] flex items-center justify-center">
              <img
                src={selectedFile.preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg w-full text-center">
              <div className="flex flex-col items-center gap-4">
                <img src={assets.Doc} alt="Document" className="w-16 h-16" />
                <div>
                  <p className="text-sm text-gray-500">Document</p>
                </div>
              </div>
            </div>
          )}
          
          {/* File info - always shown below content */}
          <div className="mt-4 text-center flex-shrink-0">
            <p className="text-sm text-gray-600 font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{selectedFile.size}</p>
          </div>
        </div>
      </div>

      {/* Caption Input - FIXED HEIGHT, ALWAYS VISIBLE */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 bg-gray-50 rounded-full p-2">          
          <input
            type="text"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent py-2 px-2 text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="p-0 hover:bg-opacity-80 rounded-full transition-all"
          >
            <img src={assets.Send} alt="send" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;