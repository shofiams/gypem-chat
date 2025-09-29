import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder, clearSearch }) => {
  return (
    <div className="px-4 pb-3 md:p-2">
      <div className="relative group">
        <div className="relative rounded-xl md:rounded-lg border border-gray-200 bg-gray-50 md:bg-white overflow-hidden">
          <div className="absolute left-4 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <FiSearch className="w-5 h-5 md:w-4 md:h-4" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') clearSearch(); }}
            className="w-full pl-12 md:pl-10 pr-12 md:pr-10 py-3 md:py-2 bg-transparent rounded-xl md:rounded-lg text-base md:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          )}
          <span className="absolute left-0 right-0 bottom-0 h-1 transform scale-x-0 origin-left 
            bg-[#4C0D68] pointer-events-none group-focus-within:scale-x-100"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;