import React from 'react';
import Logo from '../../../assets/logo.png';

const DesktopHeader = () => {
  return (
    <div className="hidden md:flex items-center justify-between px-4 py-4 bg-white h-16 relative z-30">
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
        <span className="ml-3 mt-2 text-[16px] font-medium text-[#4c0d68] whitespace-nowrap">
          Hi! Username
        </span>
      </div>
    </div>
  );
};

export default DesktopHeader;