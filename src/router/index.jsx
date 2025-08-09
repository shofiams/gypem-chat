import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/chat_page";
import GroupPage from "../pages/group_page";
import NotFound from "../pages/not_found";
import ProfilePage from "../pages/profile_page";
import ChatRoomLayout from "../layout/chat_room_layout";
import NewMessage from "../pages/new_message";
import AppLayout from "../components/headline";
import StarPage from "../pages/star_page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatRoomLayout>
      <ChatPage/>
    </ChatRoomLayout>,
  },
  {
    path: "/group",
    element: <ChatRoomLayout>
      <GroupPage/>
    </ChatRoomLayout>,
  },
  {
    path: "/profile",
    element: <ChatRoomLayout>
      <ProfilePage/>
    </ChatRoomLayout>,
  },
  {
    path: "/new-message",
    element: <NewMessage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/headline",
    element: <AppLayout />,
  },
  {
    path: "/profile",
    element: <AppLayout>
      <ProfilePage/>
    </AppLayout>,
  },
  {
    path: "/group",
    element: <AppLayout>
      <GroupPage/>
    </AppLayout>,
  },
  {
    path: "/chats",
    element: <AppLayout>
      <ChatPage/>
    </AppLayout>,
  },
  {
    path: "/star",
    element: <AppLayout>
      <StarPage/>
    </AppLayout>,
  },
]);
