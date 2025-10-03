import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from 'emoji-picker-react';
import { assets } from "../assets/assets";

const FileUploadPopup = ({ isOpen, onClose, onSend, fileButtonRef }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [caption, setCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State untuk emoji
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const containerRef = useRef(null);
  const captionInputRef = useRef(null);

  // Auto focus dan Enter key handler
  useEffect(() => {
    if (isOpen && selectedFile) {
      const timer = setTimeout(() => {
        if (captionInputRef.current) {
          captionInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedFile]);

  // Menutup emoji picker jika popup ditutup
  useEffect(() => {
    if (!isOpen) {
      setShowEmojiPicker(false);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleImageSelect = () => imageInputRef.current?.click();
  const handleDocumentSelect = () => documentInputRef.current?.click();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          file: file,
          preview: event.target.result,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
        setFileType('image');
      };
      reader.readAsDataURL(file);
    } else if (type === 'document') {
      setSelectedFile({
        file: file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      setFileType('document');
    }
    // Reset file input value to allow re-selection of the same file
    e.target.value = null;
  };


  const autoResize = (textarea) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120;
    const minHeight = 24;
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  const handleInputChange = (e) => {
    setCaption(e.target.value);
    setTimeout(() => autoResize(e.target), 0);
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
    setShowEmojiPicker(false);
    onClose();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const onEmojiClick = (emojiData) => {
    const textarea = captionInputRef.current;
    if (!textarea) return;
  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = caption.substring(0, start) + emojiData.emoji + caption.substring(end);
    
    setCaption(newValue);
  
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
      textarea.focus();
      autoResize(textarea);
    }, 0);
  };

  // Tampilan Awal: Pilihan Image/Document
  if (!selectedFile) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={handleClose}
        />
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{
            bottom: fileButtonRef?.current ? `${window.innerHeight - fileButtonRef.current.getBoundingClientRect().top + 10}px` : '80px',
            left: fileButtonRef?.current ? `${fileButtonRef.current.getBoundingClientRect().left}px` : '50px',
            minWidth: '200px'
          }}
        >
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
              <span className="text-sm font-medium text-gray-800">Document</span>
            </button>
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
          <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document')} className="hidden" />
        </div>
      </>
    );
  }

  // Tampilan Kedua: Preview file dan input caption
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-white z-50 flex flex-col max-h-screen outline-none"
      tabIndex="0"
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
    >
      <div className="flex-shrink-0 flex items-center justify-end p-4 border-b border-gray-200 bg-white">
        <button
          onClick={handleClose}
          className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100 rounded transition"
        >
          Cancel
        </button>
      </div>

      <div 
        className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6 bg-gray-50"
        onClick={() => setShowEmojiPicker(false)}
      >
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
                <p className="text-sm text-gray-500">Document</p>
              </div>
            </div>
          )}
          <div className="mt-4 text-center flex-shrink-0">
            <p className="text-sm text-gray-600 font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{selectedFile.size}</p>
          </div>
        </div>
      </div>
      
      {/* --- AWAL PERUBAHAN: Input baru --- */}
      <div className="border-t">
        <div className="relative p-3 flex items-center gap-2">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(p => !p); }}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                <img src={assets.Happy} alt="emoji" className="w-6 h-6" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50" onClick={(e) => e.stopPropagation()}>
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            
            <div className="flex-1 border rounded-2xl px-3 py-1 flex items-center border-[#4C0D68]">
              <textarea
                ref={captionInputRef}
                placeholder="Caption"
                value={caption}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows="1"
                className="flex-1 text-sm outline-none resize-none min-h-[24px] max-h-[120px] leading-6 bg-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!selectedFile}
                className="ml-2 p-1 rounded-full transition-opacity disabled:opacity-50"
              >
                <img src={assets.Send} alt="Send" className="w-6 h-6" />
              </button>
            </div>
        </div>
      </div>
      {/* --- AKHIR PERUBAHAN --- */}
    </div>
  );
};

export default FileUploadPopup;