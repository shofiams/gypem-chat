import React from "react";
import { useChatBubbleHandlers } from "./hooks/useChatBubbleHandlers.js";
import { useChatBubbleState } from "./hooks/useChatBubbleState.js";
import BubbleWrapper from "./components/BubbleWrapper.jsx";
import MessageRenderer from "./components/MessageRenderer.jsx";
import DropdownMenu from "./components/DropdownMenu.jsx";
import CopiedToast from "./components/CopiedToast.jsx";

export default function ChatBubblePeserta(props) {
  const { state, stateSetters } = useChatBubbleState(props);
  
  // Semua props sekarang diteruskan ke handlers untuk memastikan
  // logika seperti `shouldShowTime` memiliki data yang dibutuhkan.
  const handlers = useChatBubbleHandlers(props, state, stateSetters);

  return (
    <>
      <BubbleWrapper
        // Teruskan semua props utama
        {...props}
        // Teruskan semua state dari hook state
        {...state}
        // Teruskan semua fungsi handlers
        {...handlers}
        // Jangan lupa teruskan ref ke bubble
        ref={state.bubbleRef}
      >
        {/* MessageRenderer menampilkan konten di dalam bubble */}
        <MessageRenderer
            {...props}
            {...state}
            {...handlers}
            setIsExpanded={stateSetters.setIsExpanded}
        />
      </BubbleWrapper>

      {/* DropdownMenu dan CopiedToast tetap sama */}
      <DropdownMenu {...props} {...state} {...handlers} />
      <CopiedToast showCopied={state.showCopied} />
    </>
  );
}