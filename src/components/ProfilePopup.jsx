import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function ProfilePopup({
  isOpen,
  onClose,
  onProfileUpdate,
}) {
  const popupRef = useRef(null);
  const editRefDesktop = useRef(null);
  const editRefMobile = useRef(null);
  const fileInputRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditOptionsDesktop, setShowEditOptionsDesktop] = useState(false);
  const [showEditOptionsMobile, setShowEditOptionsMobile] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // Load profile image dari localStorage agar sinkron di web & mobile
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage") || "";
    setProfileImage(savedImage);
  }, []);

  const isDefaultProfile = profileImage === "";

  const handleImageClick = () => {
    if (!isDefaultProfile) setShowImageModal(true);
  };

  const closeImageModal = () => setShowImageModal(false);

  // Unified function untuk handle image change + simpan di localStorage
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfileImage(base64);
        localStorage.setItem("profileImage", base64); // Simpan agar sinkron
        setShowEditOptionsDesktop(false);
        setShowEditOptionsMobile(false);
        if (onProfileUpdate) onProfileUpdate(base64);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Unified function untuk remove image + hapus dari localStorage
  const removeImage = () => {
    setProfileImage("");
    localStorage.removeItem("profileImage"); // Hapus agar sinkron
    setShowEditOptionsDesktop(false);
    setShowEditOptionsMobile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onProfileUpdate) onProfileUpdate("");
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }

      if (
        showEditOptionsDesktop &&
        editRefDesktop.current &&
        !editRefDesktop.current.contains(e.target)
      ) {
        setShowEditOptionsDesktop(false);
      }

      if (
        showEditOptionsMobile &&
        editRefMobile.current &&
        !editRefMobile.current.contains(e.target)
      ) {
        setShowEditOptionsMobile(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, showEditOptionsDesktop, showEditOptionsMobile, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div
        ref={popupRef}
        className="
          absolute left-[70px] bottom-2 bg-white shadow-md rounded-xl z-30 text-sm font-medium
          flex w-[650px] h-[430px]
          max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:w-full max-sm:h-[calc(100vh-70px)] max-sm:rounded-none max-sm:shadow-none max-sm:bottom-auto max-sm:overflow-hidden max-sm:z-40
        "
      >
        {/* Desktop */}
        <div className="sm:flex w-full max-sm:hidden overflow-hidden rounded-xl">
          <div className="w-[180px] bg-[#f5f5f5] flex items-center justify-center gap-4 px-4">
            {isDefaultProfile ? (
              <FaUserCircle className="w-12 h-12 text-gray-400" />
            ) : (
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <span className="text-gray-900 text-base font-medium">Profile</span>
          </div>

          <div className="w-[1px] bg-gray-200" />

          <div className="flex-1 p-6 relative">
            <div className="relative flex flex-col items-center">
              <div className="relative">
                {isDefaultProfile ? (
                  <FaUserCircle className="w-24 h-24 text-gray-300" />
                ) : (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover cursor-pointer"
                    onClick={handleImageClick}
                  />
                )}

                {showEditOptionsDesktop && (
                  <div
                    ref={editRefDesktop}
                    className="absolute top-0 left-28 bg-white shadow-lg rounded-2xl w-[140px] border border-gray-200 overflow-hidden"
                    style={{ zIndex: 9999 }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      className="block w-full text-center py-3 text-black cursor-pointer hover:bg-gray-50"
                    >
                      Change image
                    </button>

                    {!isDefaultProfile && (
                      <>
                        <hr className="border-gray-200" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="block w-full text-center py-3 text-red-500 hover:bg-red-50"
                        >
                          Remove image
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p
                className="text-orange-600 mt-2 cursor-pointer text-center"
                onClick={() => setShowEditOptionsDesktop(!showEditOptionsDesktop)}
              >
                Edit
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <div>
                <label className="block text-gray-900 mb-1">Name</label>
                <input
                  type="text"
                  value="Shafira Maulana Jamil"
                  readOnly
                  className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
                />
              </div>
              <div>
                <label className="block text-gray-900 mb-1">Level</label>
                <input
                  type="text"
                  value="High School/Vocational High School"
                  readOnly
                  className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
                />
              </div>
              <div>
                <label className="block text-gray-900 mb-1">School Name</label>
                <input
                  type="text"
                  value="State Vocational School 1 Kabat"
                  readOnly
                  className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden w-full h-full bg-gray-50 overflow-y-auto">
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>

          <div className="flex flex-col items-center py-8 bg-white">
            <div className="relative">
              {isDefaultProfile ? (
                <FaUserCircle className="w-24 h-24 text-gray-300" />
              ) : (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              )}

              {showEditOptionsMobile && (
                <div
                  ref={editRefMobile}
                  className="absolute top-1 left-0 transform -translate-x-5 translate-y-36 bg-white shadow-lg rounded-2xl w-[140px] border border-gray-200 overflow-hidden"
                  style={{ zIndex: 9999 }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                    className="block w-full text-center py-3 text-black cursor-pointer hover:bg-gray-50"
                  >
                    Change image
                  </button>

                  {!isDefaultProfile && (
                    <>
                      <hr className="border-gray-200" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="block w-full text-center py-3 text-red-500 hover:bg-red-50"
                      >
                        Remove image
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <p
                className="text-orange-600 font-medium cursor-pointer"
                onClick={() => setShowEditOptionsMobile(!showEditOptionsMobile)}
              >
                Edit
              </p>
            </div>
          </div>

          <div className="mb-8 px-6 py-4 space-y-4 bg-white">
            <div>
              <label className="block text-gray-900 mb-1">Name</label>
              <input
                type="text"
                value="Shafira Maulana Jamil"
                readOnly
                className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
              />
            </div>
            <div>
              <label className="block text-gray-900 mb-1">Level</label>
              <input
                type="text"
                value="High School/Vocational High School"
                readOnly
                className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
              />
            </div>
            <div>
              <label className="block text-gray-900 mb-1">School Name</label>
              <input
                type="text"
                value="State Vocational School 1 Kabat"
                readOnly
                className="w-full bg-gray-100 text-gray-500 p-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={closeImageModal}
        >
          <img
            src={profileImage}
            alt="Full"
            className="w-[400px] h-[400px] max-sm:w-[300px] max-sm:h-[300px] rounded-full object-cover"
          />
        </div>
      )}
    </>
  );
}
