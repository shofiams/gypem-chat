// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/main_layout";
import ChatPage from "../pages/list_chat_page";
import GroupPage from "../pages/group_page";
import ProfilePage from "../pages/profile_page";
import NewMessage from "../pages/new_message";
import StarPage from "../pages/star_page";
import NotFound from "../pages/not_found";

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
        path: "group",
        element: <GroupPage />,
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
    path: "/new-message",
    element: <NewMessage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);