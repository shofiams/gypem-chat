import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import groupPhoto from '../../../assets/User.svg';

const ChatHeader = ({
  // Props untuk header normal
  chatInfo,
  isEmbedded,
  onClose,
  onGroupHeaderClick,
  isGroupChat,

  // Props untuk header mode seleksi
  isSelectionMode,
  selectedCount,
  onCancelSelection,
  onDeleteSelection,
  showSearchResults,
  setShowSearchResults,
  searchQuery,
  handleSearch,
  searchResults,
  currentSearchIndex,
  navigateSearchResults,
}) => {
  const navigate = useNavigate();

  // Jika dalam mode seleksi, tampilkan header seleksi
  if (isSelectionMode) {
    return (
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{selectedCount} Selected</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={onDeleteSelection}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <img src={assets.Trash} alt="Delete" className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onCancelSelection}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Jika tidak, tampilkan header chat normal
  return (
    <>
      <div className="flex items-center gap-3 p-3 border-b">
        <button
          onClick={() => {
            if (isEmbedded && !window.matchMedia('(max-width: 768px)').matches) {
              onClose();
            } else {
              navigate(isGroupChat ? '/group' : '/chats');
            }
          }}
          className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <img src={assets.ArrowLeft} alt="Back" className="w-5 h-5" />
        </button>
        <img
          src={chatInfo?.avatar || groupPhoto}
          alt="profile"
          crossOrigin='anonymous'
          className="w-10 h-10 rounded-full object-cover"
        />
        <div
          className={`flex-1 min-w-0 ${isGroupChat && onGroupHeaderClick ? 'cursor-pointer' : ''}`}
          onClick={isGroupChat ? onGroupHeaderClick : undefined}
        >
          <p className="font-semibold text-sm truncate">{chatInfo?.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-full">{chatInfo?.subtitle}</p>
        </div>
        <button
            data-search-button
            onClick={() => setShowSearchResults(!showSearchResults)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition flex-shrink-0"
        >
            <img src={assets.Search} alt="Search" className="w-5 h-5" />
        </button>
      </div>
      {showSearchResults && (
        <div className="absolute top-[66px] right-0 z-50 w-3/5 max-w-md">
          <div className="bg-[#f4f0f0] bg-opacity-80 rounded-bl-xl shadow-lg border overflow-hidden" style={{ borderColor: '#4C0D68' }}>
            <div className="pl-5 pr-3 py-3 flex items-center gap-2">
              <div className="flex-1 border-[1px] border-b-[6px] rounded-lg text-sm outline-none relative" style={{ borderColor: '#4C0D68' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full px-3 py-2 ${searchQuery ? (searchResults.length > 0 ? 'pr-16' : 'pr-24') : '' } rounded-lg focus:outline-none`}
                  autoFocus
                />
                
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded border pointer-events-none">
                    {searchResults.length > 0 
                      ? `${currentSearchIndex + 1} of ${searchResults.length}`
                      : "Not Found"
                    }
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {searchResults.length > 0 && (
                  <>
                    <button
                      onClick={() => navigateSearchResults('next')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigateSearchResults('prev')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </>
                )}
                <div className="w-0.5 h-6 bg-gray-400 mx-1"></div>
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    handleSearch("");
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500"
                >
                  <img src={assets.CancelClose} alt="CancelClose" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;