import NewChatUser from '../components/NewChatUser';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { FaArrowLeftLong } from 'react-icons/fa6';
import {
  type UserPublic,
  type AuthContextType,
  type DecodedUserToken,
  type ConversationWithMessagesAndUsers,
  type UserPublicNewGroup,
} from '../../types';
import NewGroupChatUser from '../components/NewGroupChatUser';
import { useAuth } from '../provider/authProvider';
import URLDialog from '../components/URLDialog';

export default function NewGroupChat() {
  const navigate = useNavigate();
  const { user } = useAuth() as AuthContextType;
  // if user is null or undefined at runtime, this will lead to a runtime error when you try to destructure it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, email, ...userWithoutIatExp } = user as DecodedUserToken;
  const [error, setError] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [imgUrlValue, setImgUrlValue] = useState('');
  const [imgUrlOriginalValue, setImgUrlOriginalValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [usersInputValue, setUsersInputValue] = useState('');
  const [newUsers, setNewUsers] = useState<UserPublic[]>([]);
  const [addedUsers, setAddedUsers] = useState<UserPublicNewGroup[]>([
    { ...userWithoutIatExp, admin: true },
  ]);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  useEffect(() => {
    async function getUsers() {
      try {
        setError(null);
        if (usersInputValue === '' || usersInputValue.startsWith(' ')) {
          setNewUsers([]);
          return;
        }
        const res = await axios.get<UserPublic[]>(
          `/user/name/${usersInputValue}`,
        );
        if (!Array.isArray(res.data)) {
          return;
        }
        // skips the already added users & the logged in user (same user cannot be added twice)
        const filteredData = res.data.filter(
          (userData) =>
            userData.id !== user?.id &&
            !addedUsers.find((member) => member.id === userData.id),
        );
        setNewUsers(filteredData);
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
  }, [usersInputValue]);

  const displayEditUsersButtons = (userId: number) => {
    // if user id is the same then the dropdown will close
    // logged in user cannot edit or remove themselves
    if (user?.id === userId || editUserId === userId) {
      setEditUserId(null);
    } else {
      setEditUserId(userId);
    }
  };

  const addUser = (member: UserPublic) => {
    setAddedUsers((prevUsers) => [...prevUsers, { ...member, admin: false }]);
    setUsersInputValue('');
  };

  const removeUser = (userId: number) => {
    setAddedUsers((prevUsers) =>
      prevUsers.filter((member) => member.id !== userId),
    );
  };

  const makeAdmin = (userId: number) => {
    setAddedUsers((prevData) => {
      return prevData.map((member) => {
        return member.id === userId ? { ...member, admin: true } : member;
      });
    });
  };

  const removeAdmin = (userId: number) => {
    setAddedUsers((prevData) => {
      return prevData.map((member) => {
        return member.id === userId ? { ...member, admin: false } : member;
      });
    });
  };

  const getUserIds = () => {
    return addedUsers.map((member) => {
      return member.id;
    });
  };

  const getAdminIds = () => {
    return addedUsers
      .filter((member) => member.admin === true)
      .map((member) => {
        return member.id;
      });
  };

  const openModal = () => {
    setImgUrlOriginalValue(imgUrlValue);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setImgUrlValue(imgUrlOriginalValue);
  };

  const createGroupConversation = async () => {
    setError(null);
    if (titleValue.length > 30 || titleValue.startsWith(' ')) {
      setError('A group name cannot exceed 30 characters');
      return;
    } else if (addedUsers.length < 3) {
      setError('A group conversation should have at least 3 members');
      return;
    }
    try {
      await axios.post<ConversationWithMessagesAndUsers>('/conversation/', {
        name: titleValue === '' ? null : titleValue,
        userIds: getUserIds(),
        adminIds: getAdminIds(),
        imgUrl:
          imgUrlValue === '' ||
          imgUrlValue.includes(' ') ||
          imgUrlValue.length > 500
            ? null
            : imgUrlValue,
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

  const renderNewUsers = newUsers.map((member) => {
    return (
      <div key={member.id} onClick={() => addUser(member)}>
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

  const renderGroupUsers = addedUsers.map((member) => {
    return (
      <NewGroupChatUser
        key={member.id}
        loggedInUserId={user?.id as number}
        memberId={member.id}
        imgUrl={member.imgUrl}
        firstName={member.firstName}
        lastName={member.lastName}
        isMemberAdmin={member.admin}
        isLoggedInUserAdmin={true}
        editUserId={editUserId}
        displayEditUsersButtons={displayEditUsersButtons}
        removeUser={removeUser}
        makeAdmin={makeAdmin}
        removeAdmin={removeAdmin}
      />
    );
  });

  return (
    <div className='mx-auto my-0 flex max-w-6xl flex-1 flex-col gap-4 p-3'>
      <div className='flex items-center gap-3 text-2xl'>
        <Link to='..' relative='path'>
          <FaArrowLeftLong />
        </Link>
        <h1 className='font-bold'>New Chat</h1>
      </div>
      {error && (
        <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
          {error}
        </div>
      )}
      <div className='flex flex-col items-center gap-1 self-center'>
        <div
          className='flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-300 text-3xl'
          onClick={openModal}
        >
          {imgUrlValue && !modalOpen ? (
            <img src={imgUrlValue} className='h-14 w-14 rounded-full' />
          ) : (
            <FaUsers />
          )}
        </div>
        <input
          className='border-b-2 border-black px-2 py-1'
          placeholder='Enter a name of the group'
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
      </div>
      <div className='relative'>
        <input
          className='h-10 w-full rounded-md border-2 pl-1'
          placeholder='Find users by name'
          value={usersInputValue}
          onChange={(e) => setUsersInputValue(e.target.value)}
        />
        {usersInputValue && (
          <div className='absolute z-10 mt-2 max-h-[500px] w-full overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg'>
            {renderNewUsers}
          </div>
        )}
      </div>

      <div className='mt-2 flex flex-col gap-2 rounded-md bg-slate-50 p-2'>
        {renderGroupUsers}
      </div>

      <button
        className='h-10 select-none rounded-md bg-black text-white hover:opacity-85'
        onClick={createGroupConversation}
      >
        Create group
      </button>
      {modalOpen && (
        <URLDialog
          onClose={closeModal}
          onConfirm={() => setModalOpen(false)}
          setImgUrlValue={setImgUrlValue}
          imgUrlValue={imgUrlValue}
        />
      )}
    </div>
  );
}
