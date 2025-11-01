import React from 'react';

const DateSeparator = ({ timestamp }) => {
  const formatDate = (isoString) => {
    if (!isoString) return "Today";
    
    const date = new Date(isoString);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfLast7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    if (date >= startOfToday) {
      return "Today";
    }
    
    if (date >= startOfYesterday) {
      return "Yesterday";
    }

    if (date >= startOfLast7Days) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return date.toLocaleDateString('en-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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