import React from 'react';
import { assets } from '../../../assets/assets'; // Path disesuaikan

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    confirmRef, 
    chatName,
    isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div ref={confirmRef} className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
        <div className="text-center">
          <h4 className="text-base text-gray-700 mb-4">
            Delete chat with <span className="font-semibold">&ldquo;{chatName}&rdquo;</span> ?
          </h4>
          <div className="mx-auto w-28 h-28 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
            <img src={assets.popup_delete} alt="popup delete" className="w-35 h-35 object-contain" />
          </div>
          <div className="flex items-center justify-center gap-3 mt-1">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-10 py-2 text-sm rounded-md bg-amber-400 text-white font-medium shadow-sm hover:bg-amber-500 hover:scale-105 active:scale-95 active:bg-amber-600 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-amber-400 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-10 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white font-medium shadow-sm hover:bg-gray-100 hover:scale-105 active:scale-95 active:bg-gray-200 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;