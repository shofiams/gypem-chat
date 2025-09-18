import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";

const FileUploadPopup = ({ isOpen, onClose, onSend, fileButtonRef }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [caption, setCaption] = useState("");
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const containerRef = useRef(null);
  const captionInputRef = useRef(null);

  // Detect mobile keyboard
  const [isMobileKeyboard, setIsMobileKeyboard] = useState(false);

  // Auto focus dan Enter key handler yang lebih spesifik
  useEffect(() => {
    if (isOpen && selectedFile) {
      // Auto focus pada container
      if (containerRef.current) {
        containerRef.current.focus();
      }

      // Fokus pada input caption setelah delay singkat
      const timer = setTimeout(() => {
        if (captionInputRef.current) {
          captionInputRef.current.focus();
          autoResize(captionInputRef.current);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedFile]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobileKeyboard(isMobile || isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Auto-resize textarea function
  const autoResize = (textarea) => {
    if (!textarea) return;
    
    // Reset height untuk mendapatkan scrollHeight yang akurat
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 96; // Tinggi maksimal dalam piksel (sekitar 4 baris)
    const minHeight = 24;  // Tinggi minimal dalam piksel
    
    // Set height berdasarkan content, tapi tidak kurang dari minHeight
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  // Scroll to cursor function
  const scrollToCursor = (textarea) => {
    if (!textarea) return;
    
    // Hanya scroll jika textarea memiliki scroll (tinggi konten > tinggi visible)
    if (textarea.scrollHeight > textarea.clientHeight) {
      const lineHeight = 24; // Sesuaikan dengan line-height CSS
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n').length;
      const cursorY = lines * lineHeight;
      
      // Scroll agar kursor tetap terlihat
      const scrollTop = Math.max(0, cursorY - textarea.clientHeight + lineHeight);
      textarea.scrollTop = scrollTop;
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCaption(value);
    
    // Auto-resize textarea
    setTimeout(() => {
      autoResize(e.target);
    }, 0);
  };

  // Fungsi send yang diperbaiki
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

  // Handle Enter key untuk caption - sama seperti di BaseChatPage
  const handleCaptionKeyDown = (e) => {
    if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
      // Kirim dengan Enter (desktop) atau selalu di mobile
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && (e.altKey || e.shiftKey)) {
      // Tambah baris baru dengan Alt+Enter atau Shift+Enter (desktop saja)
      if (!isMobileKeyboard) {
        e.preventDefault();
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = caption.substring(0, start) + '\n' + caption.substring(end);
        setCaption(newValue);
        
        // Set posisi kursor setelah baris baru dan resize
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          textarea.focus();
          autoResize(textarea);
          // Scroll ke posisi kursor jika textarea memiliki scroll
          scrollToCursor(textarea);
        }, 0);
      }
    }
  };

  // Handle Escape key untuk menutup popup
  const handleContainerKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
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
            accept=".pdf,.doc,.docx"
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
      onKeyDown={handleContainerKeyDown}
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
          <textarea
            ref={captionInputRef}
            placeholder="Caption"
            value={caption}
            onChange={handleInputChange}
            onKeyDown={handleCaptionKeyDown}
            rows="1"
            className="flex-1 text-sm outline-none bg-transparent py-2 px-2 text-gray-700 placeholder-gray-400 resize-none overflow-hidden leading-6"
            style={{ 
              minHeight: '24px', 
              maxHeight: '96px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
            }}
          />
          <button
            onClick={handleSend}
            className="p-0 hover:bg-opacity-80 rounded-full transition-all"
            disabled={!selectedFile}
            title="Kirim file"
          >
            <img 
              src={assets.Send} 
              alt="send" 
              className={`w-8 h-8 ${!selectedFile ? 'opacity-50' : 'opacity-100'}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;