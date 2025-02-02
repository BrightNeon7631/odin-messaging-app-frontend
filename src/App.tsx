import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginRoute from './components/LoginRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatsLayout from './components/ChatsLayout';
import NewChat from './pages/NewChat';
import Conversation from './pages/Conversation';
import ConversationSettings from './pages/ConversationSettings';
import NewGroupChat from './pages/NewGroupChat';
import Settings from './pages/Settings';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route
        index
        element={
          <LoginRoute>
            <Login />
          </LoginRoute>
        }
      />
      <Route
        path='register'
        element={
          <LoginRoute>
            <Register />
          </LoginRoute>
        }
      />
      <Route
        path='settings'
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path='chats'
        element={
          <ProtectedRoute>
            <ChatsLayout />
          </ProtectedRoute>
        }
      >
        <Route path=':id' element={<Conversation />} />
        <Route path=':id/settings' element={<ConversationSettings />} />
      </Route>
      <Route
        path='chats/new'
        element={
          <ProtectedRoute>
            <NewChat />
          </ProtectedRoute>
        }
      />
      <Route
        path='chats/new/group'
        element={
          <ProtectedRoute>
            <NewGroupChat />
          </ProtectedRoute>
        }
      />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
