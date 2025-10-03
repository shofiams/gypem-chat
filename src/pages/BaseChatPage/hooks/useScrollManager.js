import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

export const useScrollManager = (messages, chatId) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(null);
  const lastChatIdRef = useRef(null);

  // Fungsi untuk scroll halus (hanya untuk tombol "scroll to bottom")
  const scrollToBottomSmooth = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // --- PERBAIKAN UTAMA DI SINI ---
  // Gunakan useLayoutEffect untuk mengatur posisi scroll SEBELUM browser sempat melukis tampilan.
  // Efek ini sekarang lebih cerdas dan tidak akan auto-scroll setiap saat.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Jika chat diganti, paksa scroll ke bawah (untuk load awal)
    if (chatId !== lastChatIdRef.current) {
      container.scrollTop = container.scrollHeight;
      lastChatIdRef.current = chatId;
      lastScrollHeightRef.current = container.scrollHeight;
      return;
    }

    const prevScrollHeight = lastScrollHeightRef.current;
    const currentScrollHeight = container.scrollHeight;
    
    // Periksa apakah pengguna berada di dekat bagian bawah sebelum DOM diperbarui
    const isNearBottom = prevScrollHeight - container.clientHeight <= container.scrollTop + 50;

    // Jika tinggi scroll tidak berubah, itu berarti hanya update pada pesan (seperti pin/edit).
    // Dalam kasus ini, kita tidak melakukan apa-apa dan mempertahankan posisi scroll.
    if (prevScrollHeight === currentScrollHeight) {
      // do nothing
    }
    // Jika ada pesan baru (tinggi scroll bertambah) DAN pengguna ada di bawah, scroll ke bawah.
    else if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }

    // Simpan tinggi scroll terakhir untuk render berikutnya.
    lastScrollHeightRef.current = container.scrollHeight;

  }, [messages, chatId]);

  // Efek untuk memunculkan/menyembunyikan tombol scroll berdasarkan interaksi pengguna
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Tampilkan tombol jika pengguna sudah scroll ke atas lebih dari satu layar
      setShowScrollButton(scrollHeight - scrollTop > clientHeight + 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return { 
      messagesContainerRef, 
      showScrollButton, 
      // Kembalikan versi halus untuk digunakan oleh tombol
      scrollToBottom: scrollToBottomSmooth 
    };
};