import React, { useState } from "react";
import { HiUserCircle } from "react-icons/hi2";

export default function GroupMembers({
  members,
  seeAllMembers,
  setSeeAllMembers,
  groupLogo,
}) {
  const [imageErrors, setImageErrors] = useState({});
  
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">
        {`Members (${members.length})`}
      </h3>
      <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden">
        {(seeAllMembers ? members : members.slice(0, 4)).map(
          (member, idx) => {
            const memberKey = `${member.name}-${member.isAdmin}-${idx}`;
            const hasImageError = imageErrors[memberKey];
            
            // ✅ PERBAIKAN: Logika yang lebih sederhana dan stabil
            let imageSource = defaultAvatar; // Default pertama
            
            if (!hasImageError && member.photo) {
              // Hanya gunakan member.photo jika belum error dan ada photo-nya
              imageSource = member.photo;
            }
            
            return (
              <div
                key={memberKey}
                className="flex items-center px-4 py-3 border-b border-gray-300 last:border-none"
              >
                {/* Foto anggota */}
                <img
                  src={imageSource}
                  alt={member.name}
                  crossOrigin="anonymous"
                  className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-300"
                  onError={() => {
                    // ✅ Hanya set error, tidak ada kondisi
                    setImageErrors(prev => ({
                      ...prev,
                      [memberKey]: true
                    }));
                  }}
                />
                
                {/* Nama anggota */}
                <span className="flex-1">{member.name}</span>
                
                {/* Label admin */}
                {member.isAdmin && (
                  <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Admin Group
                  </span>
                )}
              </div>
            );
          }
        )}

        {/* Tombol lihat semua */}
        {!seeAllMembers && members.length > 4 && (
          <div
            onClick={() => setSeeAllMembers(true)}
            className="px-4 py-3 text-yellow-500 text-sm hover:underline cursor-pointer"
          >
            See all
          </div>
        )}
      </div>
    </div>
  );
}