import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const ContextMenu = ({ visible, x, y, menuRef, onOpenConfirm, chatId }) => {
  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{ left: x, top: y }}
      className="fixed z-50 w-[160px] rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => onOpenConfirm(chatId)}
        className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50"
      >
        <FiTrash2 className="w-4 h-4" />
        <span className="text-sm">Delete</span>
      </button>
    </div>
  );
};

export default ContextMenu;