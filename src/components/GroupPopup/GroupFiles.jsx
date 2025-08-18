import React from "react"; 
import { FiDownload } from "react-icons/fi";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileVideo } from "react-icons/fa";

export default function GroupFiles({ files }) {
  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="text-red-500 w-6 h-6" />;
      case "word":
        return <FaFileWord className="text-blue-500 w-6 h-6" />;
            default:
        return <FaFilePdf className="text-gray-500 w-6 h-6" />;
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Files</h3>
      <div className="space-y-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-gray-100 transition min-h-[50px]"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <span className="text-gray-800 text-sm font-medium truncate max-w-[150px]">
                {file.name}
              </span>
            </div>
            <a
              href={file.url}
              download
              className="p-1 hover:bg-gray-200 rounded-full transition"
              onClick={(e) => e.stopPropagation()}
            >
              <FiDownload className="w-5 h-5 text-gray-500" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
