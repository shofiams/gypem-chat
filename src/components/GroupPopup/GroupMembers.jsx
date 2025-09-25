import React, { useState } from "react";

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
        {/* ✅ PERUBAHAN HANYA DI SINI */}
        {`Members (${members.length})`}
      </h3>
      <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden">
        {(seeAllMembers ? members : members.slice(0, 4)).map(
          (member, idx) => {
            const memberKey = `${member.name}-${member.isAdmin}-${idx}`;
            const hasImageError = imageErrors[memberKey];
            const imageSource = hasImageError ? groupLogo : (member.photo || groupLogo);
            
            return (
              <div
                key={memberKey}
                className="flex items-center px-4 py-3 border-b border-gray-300 last:border-none"
              >
                {/* Foto anggota */}
                <img
                  src={imageSource}
                  alt={member.name}
                  className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-300"
                  onError={(e) => {
                    // ✅ Prevent infinite loop dan set fallback
                    if (!hasImageError) {
                      setImageErrors(prev => ({
                        ...prev,
                        [memberKey]: true
                      }));
                    }
                  }}
                  onLoad={() => {
                    // ✅ Reset error state jika gambar berhasil load
                    if (hasImageError) {
                      setImageErrors(prev => {
                        const newState = { ...prev };
                        delete newState[memberKey];
                        return newState;
                      });
                    }
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