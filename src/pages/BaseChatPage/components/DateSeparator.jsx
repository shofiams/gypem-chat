import React from 'react';

const DateSeparator = ({ timestamp }) => {
  const formatDate = (isoString) => {
    if (!isoString) return "Today";
    
    const date = new Date(isoString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex justify-center my-3">
      <span className="bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-500 rounded-full shadow-sm">
        {formatDate(timestamp)}
      </span>
    </div>
  );
};

export default DateSeparator;