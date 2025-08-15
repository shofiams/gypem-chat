import React, { useState, useRef } from "react";
import { assets } from "../assets/assets";

const FileUploadPopup = ({ isOpen, onClose, onSend, fileButtonRef }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [caption, setCaption] = useState("");
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
        <div className="flex items-center justify-end p-4 border-b border-gray-200 bg-white">
        <button
            onClick={handleClose}
            className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100 rounded transition"
        >
            Cancel
        </button>
        </div>


      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        {fileType === 'image' ? (
          <div className="max-w-md w-full">
            <img
              src={selectedFile.preview}
              alt="Preview"
              className="w-full rounded-2xl shadow-lg"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">{selectedFile.size}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full text-center">
            <div className="flex flex-col items-center gap-4">
              <img src={assets.Doc} alt="Document" className="w-16 h-16" />
              <div>
                <p className="font-semibold text-lg text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">Document</p>
                <p className="text-xs text-gray-400">{selectedFile.size}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Caption Input - styled like the chat input in the image */}
      <div className="p-4 border-t border-gray-200 bg-white">
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