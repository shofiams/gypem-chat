import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="px-4 pt-4 pb-3 md:px-4 md:pt-3 md:pb-2">
      <h2 className="text-xl font-semibold text-gray-800 md:text-lg">
        {title}
      </h2>
    </div>
  );
};

export default Header;