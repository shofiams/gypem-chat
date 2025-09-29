// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ChatPage from "../pages/list_chat_page/index";
import StarPage from "../pages/list_chat_page";
import NotFound from "../pages/not_found";
import PesertaChatPage from "../pages/PesertaChatPage";
import GroupChatPeserta from "../pages/GroupChatPeserta";
import MainLayout from "../layout/main_layout/main_layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chats" replace />,
      },
      {
        path: "chats",
        element: <ChatPage />,
      },
      {
        path: "chats/:chatId",
        element: <PesertaChatPage />,
      },
      {
        path: "group",
        element: <ChatPage />,
      },
      {
        path: "group/:chatId",
        element: <GroupChatPeserta />,
      },
      {
        path: "starred",
        element: <StarPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);