import React from 'react';

// Desktop Sidebar Item Component
const SidebarItem = ({ icon, label, isActive, onClick, isOpen, badge }) => {
  const isStar = label === "Starred Messages";

  return (
    <div className="px-2 my-1">
      <button
        onClick={onClick}
        className={`
          relative w-full flex items-center px-3
          py-2.5
          hover:bg-gray-100 rounded-lg
          transition-all duration-300 ease-out
          ${isActive ? "bg-gray-100" : ""}
        `}
      >
        {/* Separator line for starred messages */}
        {isStar && (
          <span
            className={`
              absolute -top-2 
              left-1
              h-[0.5px] bg-[#A59B9B] rounded-full
              transition-all duration-300 ease-in-out
              ${isOpen ? "w-[calc(95%)]" : "w-[40px]"}
            `}
          />
        )}

        {/* Individual Active indicator */}
        {isActive && (
          <span
            className="
              absolute left-0
              top-1/2 -translate-y-1/2
              bg-[#FFB400]
              w-[3px] h-[20px]
              rounded-full
              transition-all duration-300 ease-out
            "
          />
        )}

        {/* Icon container */}
        <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
          <span className="text-gray-600 transition-colors duration-300 ease-out" style={{ fontSize: '18px' }}>
            {icon}
          </span>

          {/* Badge when sidebar is closed */}
          {badge != null && badge > 0 && !isOpen && (
            <span
              className="
                absolute -top-1 -right-1
                w-4 h-4
                bg-[#FFB400]
                text-white text-[10px]
                leading-none
                rounded-full
                flex items-center justify-center
                transition-all duration-300 ease-out
              "
            >
              {badge}
            </span>
          )}
        </div>

        {/* Label */}
        <div className="overflow-hidden flex-1">
          <span 
            className={`
              block text-[14px] text-[#333] whitespace-nowrap
              transition-all duration-300 ease-out text-left
              ${isOpen 
                ? 'opacity-100 translate-x-0 ml-3' 
                : 'opacity-0 -translate-x-4 ml-0' // PERBAIKAN DI SINI
              }
            `}
          >
            {label}
          </span>
        </div>

        {/* Badge when sidebar is open */}
        {badge != null && badge > 0 && isOpen && (
          <span
            className={`
              w-4 h-4
              bg-[#FFB400]
              text-white text-[10px]
              leading-none
              rounded-full
              flex items-center justify-center
              transition-all duration-300 ease-out
              flex-shrink-0
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          >
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

export default SidebarItem;