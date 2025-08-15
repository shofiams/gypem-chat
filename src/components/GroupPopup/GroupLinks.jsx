import React from "react";

export default function GroupLinks({ links }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Links</h3>
      <div className="space-y-2">
        {links.map((link, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-gray-100 transition min-h-[50px]"
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 truncate w-full"
            >
              {link}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
