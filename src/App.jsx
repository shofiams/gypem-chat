import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';

function App() {
  return <RouterProvider router={router} />;
}

// function App() {
//   return <PesertaChatPage />;
// }

export default App;