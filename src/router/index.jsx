// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/main_layout";
import ChatPage from "../pages/list_chat_page";
import ProfilePage from "../pages/profile_page";
import StarPage from "../pages/star_page";
import NotFound from "../pages/not_found";
import PesertaChatPage from "../pages/PesertaChatPage";
import GroupChatPeserta from "../pages/GroupChatPeserta";

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
        path: "profile",
        element: <ProfilePage />,
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