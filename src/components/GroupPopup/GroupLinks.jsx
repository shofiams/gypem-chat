import React, { useState } from "react";
import { FiExternalLink, FiLink, FiCheck, FiMessageSquare } from "react-icons/fi"; // MODIFIKASI: Import FiCheck & FiMessageSquare

// Daftar ekstensi file yang TIDAK kita anggap sebagai 'link web'
const excludedExtensions = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
  'mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm',
  'mp3', 'wav', 'ogg', 'm4a',
  'zip', 'rar', '7z', 'tar', 'gz'
]);

export default function GroupLinks({ links, onNavigateToMessage }) { // Terima prop
  // BARU: State untuk melacak URL yang baru saja disalin
  const [copiedUrl, setCopiedUrl] = useState(null);

  // --- FUNGSI VALIDASI UTAMA (TIDAK BERUBAH, SUDAH BAGUS) ---
  const isValidWebLink = (url) => {
    if (typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    try {
      const testUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      const urlObj = new URL(testUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
        return false;
      }
      const path = urlObj.pathname;
      const extension = path.split('.').pop()?.toLowerCase();
      if (extension && excludedExtensions.has(extension)) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredLinks = links ? links.filter(linkObj => {
    const url = linkObj.url || linkObj;
    return isValidWebLink(url);
  }) : [];

  // --- FUNGSI HELPER (TIDAK BERUBAH) ---
  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.replace('www.', '');
      let path = urlObj.pathname;
      if (path === '/') path = '';
      const displayUrl = `${domain}${path}`;
      return displayUrl.length > 50 ? `${displayUrl.substring(0, 47)}...` : displayUrl;
    } catch (error) {
      return url.length > 50 ? `${url.substring(0, 47)}...` : url;
    }
  };

  const getDomain = (url) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch (error) {
      return url.split('/')[0];
    }
  };

  const handleLinkClick = (url) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  // BARU: Fungsi untuk menangani klik pada tombol copy
  const handleCopyClick = (e, url) => {
    e.stopPropagation(); // Mencegah klik menyebar ke elemen parent
    navigator.clipboard.writeText(url);
    setCopiedUrl(url); // Set URL yang sedang dicopy
    setTimeout(() => {
      setCopiedUrl(null); // Reset setelah 2 detik
    }, 2000);
  };

  if (filteredLinks.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold">Links</h3>
        <div className="text-center py-8 text-gray-500">
          <FiLink className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No website links shared yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Links ({filteredLinks.length})</h3>
      <div className="space-y-2">
        {filteredLinks.map((linkObj, idx) => {
          const url = linkObj.url || linkObj;
          const sender = linkObj.sender;

          return (
            <div key={`${idx}-${url}`} className="bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-gray-100 transition group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <button onClick={() => handleLinkClick(url)} className="text-blue-600 hover:text-blue-800 text-sm font-medium block truncate w-full text-left transition-colors" title={url}>
                    {formatUrl(url)}
                  </button>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{getDomain(url)}</span>
                    {sender && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Shared by {sender}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* MODIFIKASI: Logika untuk tombol copy dan open */}
                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); if (onNavigateToMessage) onNavigateToMessage(linkObj.messageId); }} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Go to message">
                    <FiMessageSquare className="w-4 h-4 text-gray-600" />
                  </button>
                  {copiedUrl === url ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <FiCheck className="w-4 h-4" />
                      <span className="text-xs font-semibold">Copied!</span>
                    </div>
                  ) : (
                    <button onClick={(e) => handleCopyClick(e, url)} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copy link">
                      <FiLink className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleLinkClick(url); }} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Open in new tab">
                    <FiExternalLink className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}