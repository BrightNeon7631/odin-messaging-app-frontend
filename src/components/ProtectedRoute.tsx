import { useAuth } from '../provider/authProvider';
import { type AuthContextType } from '../../types';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth() as AuthContextType;

  return user ? (
    children
  ) : (
    <Navigate to='/' state={{ message: 'You must log in first.' }} />
  );
}
