import React from "react";

const CopiedToast = ({ showCopied }) => {
  if (!showCopied) return null;

  return (
    <div
      className="fixed text-white px-4 py-2 shadow-lg z-[9999] text-sm"
      style={{
        backgroundColor: "#4C0D68",
        borderRadius: "20px",
        bottom: window.innerWidth < 768 ? "150px" : "90px",
        left: window.innerWidth < 768 ? "50%" : "60%",
        transform:
          window.innerWidth < 768
            ? "translateX(-50%)"
            : "translate(-30%, 70%)",
      }}
    >
      Message is copied
    </div>
  );
};

export default CopiedToast;