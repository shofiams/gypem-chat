import { useState, useRef, useEffect } from "react";

export const useChatBubbleState = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("below");
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdownButton, setShowDropdownButton] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const bubbleRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Efek ini akan menutup dropdown secara otomatis saat chat di-scroll.
  useEffect(() => {
    // Jika dropdown tidak terbuka, tidak ada yang perlu dilakukan.
    if (!dropdownOpen) return;

    // Cari elemen kontainer chat yang bisa di-scroll.
    const scrollContainer = bubbleRef.current?.closest('.elegant-scrollbar');

    // Jika kontainer tidak ditemukan, hentikan.
    if (!scrollContainer) return;

    // Fungsi ini akan dipanggil saat event scroll terjadi.
    const handleScroll = () => {
      setDropdownOpen(false);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { once: true });

    // Fungsi cleanup: Hapus listener jika dropdown ditutup dengan cara lain (misal: klik di luar).
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownOpen, bubbleRef]);

  useEffect(() => {
    if (dropdownOpen) {
      const timer = setTimeout(() => {
        const calculateDropdownPosition = () => {
          if (!buttonRef.current) return "below";

          const buttonRect = buttonRef.current.getBoundingClientRect();
          const spaceAbove = buttonRect.top;

          const dropdownHeight =
            dropdownRef.current?.offsetHeight ||
            (props.groupChatMode ? 130 : 280);

          const chatFooterEl = document.querySelector(
            ".p-3.flex.items-center.gap-2"
          )?.parentElement;
          const footerTop = chatFooterEl
            ? chatFooterEl.getBoundingClientRect().top
            : window.innerHeight;

          const collidesWithFooter =
            buttonRect.bottom + dropdownHeight > footerTop;

          if (collidesWithFooter) {
            if (spaceAbove > dropdownHeight) {
              return "above";
            }
          }

          return "below";
        };

        setDropdownPosition(calculateDropdownPosition());
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [dropdownOpen, props.groupChatMode]);

  return {
    state: {
      dropdownOpen,
      isHovering,
      showCopied,
      dropdownPosition,
      isMobile,
      showDropdownButton,
      isImageModalOpen,
      isExpanded,
      imageLoadError,
      imageLoading,
      dropdownRef,
      buttonRef,
      bubbleRef,
      longPressTimer,
    },
    stateSetters: {
      setDropdownOpen,
      setIsHovering,
      setShowCopied,
      setDropdownPosition,
      setIsMobile,
      setShowDropdownButton,
      setIsImageModalOpen,
      setIsExpanded,
      setImageLoadError,
      setImageLoading,
    },
  };
};