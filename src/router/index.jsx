// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ChatPage from "../pages/list_chat_page/index";
import NotFound from "../pages/not_found";
import PesertaChatPage from "../pages/PesertaChatPage";
import GroupChatPeserta from "../pages/GroupChatPeserta";
import MainLayout from "../layout/main_layout/main_layout";
import LoginPage from "../pages/LoginPage";
import Logout from "../pages/Logout";
import { authService } from "../api/auth";

// Komponen PrivateRoute untuk melindungi rute
const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// Komponen PublicRoute untuk halaman publik seperti login
const PublicRoute = ({ children }) => {
  return authService.isAuthenticated() ? <Navigate to="/chats" /> : children;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
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
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);