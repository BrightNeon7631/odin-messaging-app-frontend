import { useAuth } from '../provider/authProvider';
import { type AuthContextType } from '../../types';
import { Navigate } from 'react-router-dom';

type LoginRoute = {
  children: React.ReactNode;
};

export default function LoginRoute({ children }: LoginRoute) {
  const { user } = useAuth() as AuthContextType;

  return !user ? children : <Navigate to='/chats' />;
}
