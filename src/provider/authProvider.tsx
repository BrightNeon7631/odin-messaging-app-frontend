/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { type DecodedUserToken, type AuthContextType } from '../../types';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextProviderProps = {
  children: React.ReactNode;
};

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedUserToken | null>(null);

  useEffect(() => {
    const tokenData = localStorage.getItem('messagingAppToken');
    if (tokenData) {
      setToken(tokenData);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // if the token exists, set the authorization header in axios and local storage
      axios.defaults.headers.common['Authorization'] = token;
      localStorage.setItem('messagingAppToken', token);

      try {
        const decodedToken: DecodedUserToken = jwtDecode(token);
        const currentTime = new Date();
        const expTime = new Date(decodedToken.exp * 1000);

        if (expTime < currentTime) {
          throw new Error('Token has expired. Please log in again.');
        } else {
          setUser(decodedToken);
        }
      } catch (err) {
        console.log(err);
        logout();
      }
    } else {
      // if the token is null or undefined, remove the authorization header from axios and local storage
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('messagingAppToken');
      setUser(null);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook that can be used in components to access the authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};
