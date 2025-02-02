import { NavLink } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdLogout, MdOutlineSettings } from 'react-icons/md';
import { type AuthContextType } from '../../types';

export default function Header() {
  const { user, logout } = useAuth() as AuthContextType;
  return (
    <header className='flex items-center justify-between bg-gray-800 p-2 text-white'>
      <NavLink
        to='/'
        className='flex select-none items-center gap-2 text-lg hover:underline'
      >
        <AiOutlineMessage className='size-8' />
        <span>Messaging App</span>
      </NavLink>
      <div className='flex gap-4'>
        {user && (
          <NavLink
            className='flex items-center gap-1 font-bold hover:underline'
            to='settings'
          >
            <MdOutlineSettings />
            <div>Settings</div>
          </NavLink>
        )}
        {user && (
          <div
            className='flex cursor-pointer items-center gap-1 font-bold hover:underline'
            onClick={() => logout()}
          >
            <MdLogout />
            <div>Logout</div>
          </div>
        )}
      </div>
    </header>
  );
}
