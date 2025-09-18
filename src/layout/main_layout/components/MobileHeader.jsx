import React from 'react';
import { assets } from '../../../assets/assets';

const MobileHeader = ({ onNavigate }) => {
  return (
    <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 bg-white">
      <h1 className="ml-0.5 text-xl font-semibold text-purple-800 mt-5">Hi! username</h1>
      <button onClick={() => onNavigate('/starred')} className="mt-5 mr-0.5">
        <img src={assets.star_fill} alt="Starred Messages" className="w-[30px] h-[30px]" />
      </button>
    </div>
  );
};

export default MobileHeader;