import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

export const useScrollManager = (messages) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef(null);

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
  // Ini akan menghilangkan "kedipan" secara total.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      // Langsung atur posisi scroll ke paling bawah tanpa animasi.
      // Karena ini berjalan sebelum paint, pengguna tidak akan melihat prosesnya.
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]); // Efek ini berjalan setiap kali daftar pesan berubah (saat membuka chat baru).

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