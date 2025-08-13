import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';
import { ChatProvider } from './api/chat_context.jsx';

function App() {
  return (
    <ChatProvider >
      <RouterProvider router={router} />
    </ChatProvider>
  );
}

// function App() {
//   return <PesertaChatPage />;
// }

export default App;