import React from "react";
import { FiDownload, FiMessageSquare } from "react-icons/fi"; // Tambahkan FiMessageSquare
import { FaFilePdf, FaFileWord, FaFileImage, FaFileVideo, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFile } from "react-icons/fa";

export default function GroupFiles({ files, onNavigateToMessage }) { // Terima prop

  // --- FUNGSI INI TELAH DIPERBARUI AGAR LEBIH PINTAR ---
  const getFileIcon = (type = '', fileName = '') => {
    // Prioritas 1: Cek ekstensi dari nama file. Ini yang paling akurat.
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      switch (extension) {
        case 'pdf':
          return <FaFilePdf className="text-red-500 w-6 h-6 flex-shrink-0" />;
        case 'doc':
        case 'docx':
          return <FaFileWord className="text-blue-500 w-6 h-6 flex-shrink-0" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel className="text-green-500 w-6 h-6 flex-shrink-0" />;
        case 'ppt':
        case 'pptx':
          return <FaFilePowerpoint className="text-orange-500 w-6 h-6 flex-shrink-0" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
          return <FaFileImage className="text-purple-500 w-6 h-6 flex-shrink-0" />;
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
          return <FaFileVideo className="text-pink-500 w-6 h-6 flex-shrink-0" />;
        case 'zip':
        case 'rar':
        case '7z':
          return <FaFileArchive className="text-yellow-500 w-6 h-6 flex-shrink-0" />;
      }
    }

    // Prioritas 2: Jika ekstensi tidak ada atau tidak dikenali, cek dari properti 'type' (MIME type).
    const lowerCaseType = type.toLowerCase();
    if (lowerCaseType.includes('pdf')) return <FaFilePdf className="text-red-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('word')) return <FaFileWord className="text-blue-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('excel') || lowerCaseType.includes('spreadsheetml')) return <FaFileExcel className="text-green-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('powerpoint') || lowerCaseType.includes('presentationml')) return <FaFilePowerpoint className="text-orange-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('image')) return <FaFileImage className="text-purple-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('video')) return <FaFileVideo className="text-pink-500 w-6 h-6 flex-shrink-0" />;
    if (lowerCaseType.includes('zip') || lowerCaseType.includes('archive')) return <FaFileArchive className="text-yellow-500 w-6 h-6 flex-shrink-0" />;

    // Prioritas 3: Jika semua gagal, tampilkan ikon default.
    return <FaFile className="text-gray-500 w-6 h-6 flex-shrink-0" />;
  };


  const handleOpenFile = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async (file) => {
    if (!file || !file.url) {
      console.error("File object or URL is missing.");
      return;
    }
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', file.name || 'download');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert("Gagal mengunduh file secara otomatis. Mencoba membuka di tab baru.");
      handleOpenFile(file.url);
    }
  };

  if (!files || files.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold">Files</h3>
        <div className="text-center py-8 text-gray-500">
          <FaFile className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No files shared yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Files ({files.length})</h3>
      <div className="space-y-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-gray-100 transition min-h-[50px] group"
          >
            <div
              onClick={() => handleOpenFile(file.url)}
              className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
            >
              {getFileIcon(file.type, file.name)}
              <div className="min-w-0 flex-1">
                <p className="text-gray-800 text-sm font-medium truncate">
                  {file.name || 'Unknown File'}
                </p>
                {file.sender && (
                  <p className="text-xs text-gray-500 truncate">
                    Shared by {file.sender}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToMessage) onNavigateToMessage(file.messageId);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition"
                title="Go to message"
              >
                <FiMessageSquare className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition"
                title="Download file"
              >
                <FiDownload className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}