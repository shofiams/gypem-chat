import React, { useState, useMemo } from "react";
import { getContrast, darken } from "color2k";
import { useParams, useNavigate } from "react-router-dom";
import BaseChatPage from "./BaseChatPage";
import GroupPopup from "../components/GroupPopup/GroupPopup";
import { useRoomDetails } from "../hooks/useRooms";
import { authService } from "../api/auth";

// ... (fungsi helper hashString, hslToHex, generateMemberColorWithColor2k tidak berubah) ...
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};
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
const generateMemberColorWithColor2k = (memberName) => {
  if (!memberName) return "#4C0D68";
  const hash = hashString(memberName);
  const goldenAngle = 137.508;
  let hue = (hash * goldenAngle) % 360;
  const problematicRanges = [
    [45, 75],
    [75, 110],
  ];
  for (const [start, end] of problematicRanges) {
    if (hue >= start && hue <= end) {
      hue = (hue + (end - start + 15)) % 360;
    }
  }
  const saturation = 80 + (hash % 20);
  const lightness = 45 + (hash % 15);
  let color = hslToHex(hue, saturation, lightness);
  let contrast = getContrast(color, '#ffffff');
  let attempts = 0;
  while (contrast < 4.5 && attempts < 10) {
    if (contrast < 3) {
      color = darken(color, 0.3);
    } else {
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
  chatId: propChatId,
  highlightMessageId = null,
  onMessageHighlight = null,
  onNavigateOnDesktop // <-- TERIMA PROPERTI BARU
}) => {

  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const chatId = isEmbedded ? propChatId : paramChatId;
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { roomDetails, refetch: refetchRoomDetails, loading  } = useRoomDetails(chatId);
  const currentUser = useMemo(() => authService.getCurrentUser(), []);

  const isMember = useMemo(() => {
    if (!roomDetails?.members || !currentUser) return false;
    const member = roomDetails.members.find(m => m.member_id === currentUser.user_id);
    return member ? !member.is_left : false;
  }, [roomDetails, currentUser]);

  const getSenderColor = (sender) => {
    return generateMemberColorWithColor2k(sender);
  };

  // --- FUNGSI DIPERBARUI ---
  const handleNavigateToMessage = (messageId) => {
    if (!chatId || !messageId) return;

    const isMobile = window.innerWidth < 768;
    setIsPopupOpen(false); // Selalu tutup popup

    if (isMobile) {
      // Di mobile, navigasi ke halaman chat
      navigate(`/group/${chatId}?highlight=${messageId}`);
    } else {
      // Di desktop, panggil callback untuk menyorot pesan
      if (onNavigateOnDesktop) {
        onNavigateOnDesktop(messageId);
      }
    }
  };

  const readOnlyFooter = (
    <div
      className="text-center text-white text-sm py-3 font-medium border-t"
      style={{ backgroundColor: "#4C0D68" }}
    >
      Only admins can send messages.
    </div>
  );

  const notMemberFooter = (
    <div
      className="text-center text-gray-500 text-sm py-3 font-medium bg-gray-200 border-t"
    >
      You can't send messages to this group because you're no longer a member.
    </div>
  );

  const loadingFooter = (
    <div
      className="text-center text-gray-400 text-sm py-3 font-medium bg-gray-50 border-t"
    >
      Loading...
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
        canSendMessages={false}
        showSenderNames={true}
        getSenderColor={getSenderColor}
        customChatBubbleProps={customChatBubbleProps}
        customFooter={
          loading
            ? loadingFooter
            : isMember
              ? readOnlyFooter
              : notMemberFooter
        }
        onGroupHeaderClick={() => setIsPopupOpen(true)}
        highlightMessageId={highlightMessageId}
        onMessageHighlight={onMessageHighlight}
      />

      {isPopupOpen && (
        <GroupPopup
          onClose={() => setIsPopupOpen(false)}
          roomId={chatId}
          onLeaveSuccess={refetchRoomDetails}
          onNavigateToMessage={handleNavigateToMessage}
        />
      )}
    </>
  );
};

export default GroupChatPeserta;