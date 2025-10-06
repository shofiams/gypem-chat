import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

export const useScrollManager = (messages, chatId) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(null);
  const lastChatIdRef = useRef(null);

  // --- PERBAIKAN: Fungsi scroll yang lebih fleksibel ---
  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: behavior, // Bisa 'auto' (instan) atau 'smooth'
      });
    }
  }, []);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Scroll instan saat chat diganti
    if (chatId !== lastChatIdRef.current) {
      scrollToBottom('auto');
      lastChatIdRef.current = chatId;
      lastScrollHeightRef.current = container.scrollHeight;
      return;
    }

    const prevScrollHeight = lastScrollHeightRef.current;
    const currentScrollHeight = container.scrollHeight;
    
    // Cek apakah pengguna berada di dekat bagian bawah sebelum DOM diperbarui
    const isNearBottom = prevScrollHeight - container.clientHeight <= container.scrollTop + 50;

    if (prevScrollHeight === currentScrollHeight) {
      // Tinggi tidak berubah (edit, star, pin), jadi tidak melakukan apa-apa.
      // Ini sudah sesuai dengan permintaan Anda.
    }
    else if (isNearBottom) {
      // Ada pesan baru saat pengguna sudah di bawah, scroll instan.
      scrollToBottom('auto');
    }

    // Simpan tinggi scroll terakhir untuk render berikutnya.
    lastScrollHeightRef.current = container.scrollHeight;

  }, [messages, chatId, scrollToBottom]); // Tambahkan scrollToBottom ke dependencies

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop > clientHeight + 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return { 
      messagesContainerRef, 
      showScrollButton, 
      // Kembalikan fungsi scrollToBottom agar bisa dipanggil dari luar
      scrollToBottom 
    };
};