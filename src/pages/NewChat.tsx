import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../provider/authProvider';
import {
  type AuthContextType,
  type ConversationWithMessagesAndUsers,
  type UserPublic,
  type ConversationWithoutMessages,
} from '../../types';
import { FaUsers } from 'react-icons/fa';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NewChatUser from '../components/NewChatUser';

type LocationStateType = {
  data: ConversationWithoutMessages[] | null;
};

export default function NewChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationStateType;
  const { user } = useAuth() as AuthContextType;
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUsers() {
      try {
        setError(null);
        if (inputValue === '' || inputValue.startsWith(' ')) {
          setUsers([]);
          return;
        }
        const res = await axios.get<UserPublic[]>(`/user/name/${inputValue}`);
        // quits if res.data is not an array
        // if input value is empty it might try to access the /user/name/ endpoint without the input data
        if (!Array.isArray(res.data)) {
          return;
        }
        const usersWithoutLoggedInUser = res.data.filter(
          (foundUser) => foundUser.id !== (user?.id as number),
        );
        setUsers(usersWithoutLoggedInUser);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err?.response?.data?.error || err?.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    }

    const timeoutID = setTimeout(() => {
      getUsers();
    }, 300);

    return () => clearTimeout(timeoutID);
  }, [inputValue]);

  const createConversation = async (userId: number) => {
    // checks if a conversation with this user already exists
    if (locationState?.data) {
      // selects conversations with just two users since this component is only for
      // creating direct conversations (not group conversations)
      const directConversations = locationState?.data.filter(
        (convo) => convo.users.length === 2,
      );
      const foundConversation = directConversations.find((convo) =>
        convo.users.find((member) => member.id === userId),
      );

      if (foundConversation) {
        setError('Conversation with this user already exists.');
        return;
      }
    }

    try {
      await axios.post<ConversationWithMessagesAndUsers>('/conversation/', {
        userIds: [userId, user?.id as number],
      });
      navigate('/chats');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const renderUsers = users.map((member) => {
    return (
      <div onClick={() => createConversation(member.id)} key={member.id}>
        <NewChatUser
          firstName={member.firstName}
          lastName={member.lastName}
          about={member.about}
          imgUrl={member.imgUrl}
          createdAt={member.createdAt}
        />
      </div>
    );
  });

  return (
    <div className='mx-auto my-0 flex max-w-6xl flex-col gap-3 p-3'>
      <div className='flex items-center gap-3 text-2xl'>
        <Link to='..' relative='path'>
          <FaArrowLeftLong />
        </Link>
        <h1 className='font-bold'>New Chat</h1>
      </div>
      <Link to='group' className='flex'>
        <button className='flex h-10 w-full items-center justify-center gap-3 rounded-md bg-black text-white hover:bg-opacity-80'>
          <FaUsers />
          <span>New Group</span>
        </button>
      </Link>
      <input
        placeholder='Find users by name'
        type='text'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className='h-10 rounded-md border-2 pl-1'
      />
      {error && (
        <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
          {error}
        </div>
      )}
      <div className='flex max-h-[calc(100vh-220px)] flex-col gap-2 overflow-hidden overflow-y-auto'>
        {renderUsers}
      </div>
    </div>
  );
}
