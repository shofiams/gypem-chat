import React from "react";
import { useChatBubbleHandlers } from "./hooks/useChatBubbleHandlers.js";
import { useChatBubbleState } from "./hooks/useChatBubbleState.js";
import BubbleWrapper from "./components/BubbleWrapper.jsx";
import MessageRenderer from "./components/MessageRenderer.jsx";
import DropdownMenu from "./components/DropdownMenu.jsx";
import CopiedToast from "./components/CopiedToast.jsx";

export default function ChatBubblePeserta(props) {
  const { state, stateSetters } = useChatBubbleState(props);
  // Modifikasi di sini: Kirim props.onImageClick ke handlers
  const handlers = useChatBubbleHandlers(props, state, stateSetters);

  return (
    <>
      <BubbleWrapper
        {...props}
        {...state}
        {...handlers}
        ref={state.bubbleRef}
      >
        <MessageRenderer 
            {...props} 
            {...state} 
            {...handlers} 
            setIsExpanded={stateSetters.setIsExpanded} 
        />
      </BubbleWrapper>

      <DropdownMenu {...props} {...state} {...handlers} />
      <CopiedToast showCopied={state.showCopied} />
    </>
  );
}