import React, { useState } from "react";
import { getContrast, darken } from "color2k";
import BaseChatPage from "./base_chat_page";
import GroupPopup from "../components/GroupPopup/GroupPopup";

// Fungsi untuk generate hash dari string
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Convert HSL ke HEX
const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate warna dengan color2k
const generateMemberColorWithColor2k = (memberName) => {
  if (!memberName) return "#4C0D68";
  
  const hash = hashString(memberName);
  
  // Golden angle untuk distribusi optimal
  const goldenAngle = 137.508;
  let hue = (hash * goldenAngle) % 360;
  
  // Hindari range warna bermasalah
  const problematicRanges = [
    [45, 75],   // Yellow
    [75, 110],  // Yellow-green
  ];
  
  for (const [start, end] of problematicRanges) {
    if (hue >= start && hue <= end) {
      hue = (hue + (end - start + 15)) % 360;
    }
  }
  
  // Base values
  const saturation = 80 + (hash % 20); // 70-90%
  const lightness = 45 + (hash % 15);  // 45-60%
  
  // Generate initial color
  let color = hslToHex(hue, saturation, lightness);
  
  // Check contrast with color2k
  let contrast = getContrast(color, '#ffffff');
  
  // Improve contrast iteratively
  let attempts = 0;
  while (contrast < 4.5 && attempts < 10) {
    if (contrast < 3) {
      // Sangat rendah, darken significantly
      color = darken(color, 0.3);
    } else {
      // Sedikit rendah, darken gradually
      color = darken(color, 0.15);
    }
    
    contrast = getContrast(color, '#ffffff');
    attempts++;
  }
  
  return color;
};

const GroupChatPeserta = ({ 
  isEmbedded = false, 
  onClose, 
  chatId, 
  highlightMessageId = null, 
  onMessageHighlight = null 
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const getSenderColor = (sender) => {
    return generateMemberColorWithColor2k(sender);
  };

  const readOnlyFooter = (
    <div
      className="text-center text-white text-sm py-3 font-medium border-t"
      style={{ backgroundColor: "#4C0D68" }}
    >
      Only admins can send messages.
    </div>
  );

  const customChatBubbleProps = {
    hideReply: true,
    hidePin: true,
    hideCopy: true,
    hideEdit: true,
    showOnlyEssentials: true,
    groupChatMode: true,
  };

  return (
    <>
      <BaseChatPage
        isEmbedded={isEmbedded}
        onClose={onClose}
        chatId={chatId}
        isGroupChat={true}
        canSendMessages={false} // PENTING: ini yang menonaktifkan input
        showSenderNames={true}
        getSenderColor={getSenderColor}
        customFooter={readOnlyFooter} // Footer yang menggantikan input
        customChatBubbleProps={customChatBubbleProps}
        onGroupHeaderClick={() => setIsPopupOpen(true)}
        highlightMessageId={highlightMessageId}
        onMessageHighlight={onMessageHighlight}
      />

      {isPopupOpen && (
        <GroupPopup
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
};

export default GroupChatPeserta;