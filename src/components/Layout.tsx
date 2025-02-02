import AuthContextProvider from '../provider/authProvider';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <>
      <AuthContextProvider>
        <Header />
        <Outlet />
      </AuthContextProvider>
    </>
  );
}
