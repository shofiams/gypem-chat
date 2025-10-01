import React, { useState, useEffect } from 'react';

const DeleteMessageModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSelectionMode,
  selectedMessagesCount,
  deleteBehavior,
  selectedDeleteOption,
  onSetDeleteOption
}) => {
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteOptions(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteForMe = () => {
    onSetDeleteOption('me');
    setShowDeleteOptions(true);
  };

  const handleDeleteForEveryone = () => {
    onSetDeleteOption('everyone');
    setShowDeleteOptions(true);
  };

  const messageCountText = isSelectionMode && selectedMessagesCount > 1 ? 's' : '';
  const messageNoun = isSelectionMode && selectedMessagesCount > 1 ? 'messages' : 'a message';
  const messageVerb = isSelectionMode && selectedMessagesCount > 1 ? 'have' : 'has';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] z-[9998]" />
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-200">

          {/* Tampilan untuk pesan receiver (hanya 'Delete for me') */}
          {deleteBehavior === 'receiver-included' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete message{messageCountText}?
                </h3>
                <p className="text-gray-600 text-sm">
                  Deleting {messageNoun} {messageVerb} no effect on your recipient's chat.
                </p>
              </div>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={onConfirm}
                  className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity rounded-[5px]"
                  style={{ backgroundColor: "#FFB400" }}
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Tampilan untuk pesan sender, tahap memilih */}
          {deleteBehavior !== 'receiver-included' && !showDeleteOptions && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete message{messageCountText}?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  You can delete {isSelectionMode && selectedMessagesCount > 1 ? 'messages' : 'message'} for everyone or just for yourself.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleDeleteForMe}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm rounded-[5px]"
                  >
                    <div className="w-[20px] h-[20px] border-2 border-gray-400 rounded-full bg-transparent"></div>
                    <span>Delete for me</span>
                  </button>
                  <button
                    onClick={handleDeleteForEveryone}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm rounded-[5px]"
                  >
                    <div className="w-[20px] h-[20px] border-2 border-gray-400 rounded-full bg-transparent"></div>
                    <span>Delete for everyone</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Tampilan untuk pesan sender, tahap konfirmasi */}
          {deleteBehavior !== 'receiver-included' && showDeleteOptions && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete message{messageCountText}?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  You can delete {isSelectionMode && selectedMessagesCount > 1 ? 'messages' : 'message'} for everyone or just for yourself.
                </p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="deleteOption"
                        value="me"
                        checked={selectedDeleteOption === 'me'}
                        onChange={(e) => onSetDeleteOption(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedDeleteOption === 'me' ? 'border-[#FFB400]' : 'border-gray-300'}`}>
                        {selectedDeleteOption === 'me' && <div className="w-2 h-2 rounded-full bg-[#FFB400]"></div>}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">Delete for me</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="deleteOption"
                        value="everyone"
                        checked={selectedDeleteOption === 'everyone'}
                        onChange={(e) => onSetDeleteOption(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedDeleteOption === 'everyone' ? 'border-[#FFB400]' : 'border-gray-300'}`}>
                        {selectedDeleteOption === 'everyone' && <div className="w-2 h-2 rounded-full bg-[#FFB400]"></div>}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">Delete for everyone</span>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={onConfirm}
                  className="px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity rounded-[5px]"
                  style={{ backgroundColor: "#FFB400" }}
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-[5px]"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DeleteMessageModal;