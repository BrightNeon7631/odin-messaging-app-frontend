import {
  type ConversationWithoutMessages,
  type UpdateTitleOrImgResponse,
  type ConversationOutletContextType,
  type AuthContextType,
  type UserPublic,
} from '../../types';
import {
  useLocation,
  useOutletContext,
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FaCheck, FaUsers } from 'react-icons/fa';
import { MdCancel, MdExitToApp, MdDelete } from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import NewChatUser from '../components/NewChatUser';
import ConfirmationDialog from '../components/ConfirmationDialog';
import NewGroupChatUser from '../components/NewGroupChatUser';
import { FaArrowLeftLong } from 'react-icons/fa6';
import URLDialog from '../components/URLDialog';

type LocationState = {
  data: ConversationWithoutMessages;
};

export default function ConversationSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as LocationState;
  const [groupData, setGroupData] = useState(stateData.data);
  const { id } = useParams();
  const { user } = useAuth() as AuthContextType;
  const { setConversations } =
    useOutletContext<ConversationOutletContextType>();

  const [editTitleMode, setEditTitleMode] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const [addMemberMode, setAddMemberMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [newUsers, setNewUsers] = useState<UserPublic[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<string | boolean>(false);

  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgUrlValue, setImgUrlValue] = useState(groupData?.imgUrl || '');
  const [imgUrlOriginalValue, setImgUrlOriginalValue] = useState('');

  useEffect(() => {
    if (!id || !user?.id || !groupData?.isGroup) {
      navigate('/chats');
    }
  }, [id, user, groupData]);

  const isUserAdmin = (userId: number) => {
    return groupData.admins.find((admin) => admin.id === userId) ? true : false;
  };

  const isLoggedInUserAdmin = isUserAdmin(user?.id as number);

  const openImgModal = () => {
    if (!isLoggedInUserAdmin) {
      return;
    }
    setImgUrlOriginalValue(imgUrlValue);
    setImgModalOpen(true);
  };

  const closeImgModal = () => {
    setImgModalOpen(false);
    setImgUrlValue(imgUrlOriginalValue);
  };

  const enableEditTitleMode = () => {
    setEditTitleMode(true);
    setEditTitleValue((groupData.name as string) || '');
  };

  const disableEditTitleMode = () => {
    setEditTitleMode(false);
    setEditTitleValue('');
  };

  const updateTitle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (editTitleValue.length > 30 || editTitleValue.startsWith(' ')) {
      setError('Group name cannot be longer than 30 characters.');
      setEditTitleValue('');
      disableEditTitleMode();
      return;
    }
    try {
      const res = await axios.patch<UpdateTitleOrImgResponse>(
        `conversation/${id}/info`,
        { name: editTitleValue === '' ? null : editTitleValue },
      );

      setGroupData((prevData) => {
        return {
          ...prevData,
          name: res.data.name,
          updatedAt: res.data.updatedAt,
        };
      });

      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.map((conversation) => {
          return conversation.id === parseInt(id as string, 10)
            ? {
                ...conversation,
                name: res.data.name,
                updatedAt: res.data.updatedAt,
              }
            : conversation;
        });
      });

      disableEditTitleMode();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const updateImg = async () => {
    setError(null);
    if (imgUrlValue.includes(' ') || imgUrlValue.length > 500) {
      setError('Image URL cannot be longer than 500 characters.');
      closeImgModal();
      return;
    }
    try {
      const res = await axios.patch<UpdateTitleOrImgResponse>(
        `conversation/${id}/info`,
        { imgUrl: imgUrlValue === '' ? null : imgUrlValue },
      );

      setGroupData((prevData) => {
        return {
          ...prevData,
          imgUrl: res.data.imgUrl,
          updatedAt: res.data.updatedAt,
        };
      });

      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.map((conversation) => {
          return conversation.id === parseInt(id as string, 10)
            ? {
                ...conversation,
                imgUrl: res.data.imgUrl,
                updatedAt: res.data.updatedAt,
              }
            : conversation;
        });
      });
      setImgModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const displayEditUsersButtons = (userId: number) => {
    if (user?.id === userId || editUserId === userId) {
      setEditUserId(null);
    } else {
      setEditUserId(userId);
    }
  };

  const makeAdmin = async (userId: number) => {
    try {
      setError(null);
      const res = await axios.patch<ConversationWithoutMessages>(
        `/conversation/${id}/user/${userId}/admingive`,
      );
      setGroupData((prevData) => {
        return {
          ...prevData,
          admins: res.data.admins,
          updatedAt: res.data.updatedAt,
        };
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const removeAdmin = async (userId: number) => {
    try {
      setError(null);
      const res = await axios.patch<ConversationWithoutMessages>(
        `/conversation/${id}/user/${userId}/adminremove`,
      );
      setGroupData((prevData) => {
        return {
          ...prevData,
          admins: res.data.admins,
          updatedAt: res.data.updatedAt,
        };
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const removeUser = async (userId: number) => {
    try {
      setError(null);
      const res = await axios.patch<ConversationWithoutMessages>(
        `/conversation/${id}/user/${userId}/remove`,
      );
      setGroupData((prevData) => {
        return {
          ...prevData,
          users: res.data.users,
          admins: res.data.admins,
          updatedAt: res.data.updatedAt,
        };
      });
      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.map((conversation) => {
          return conversation.id === parseInt(id as string, 10)
            ? {
                ...conversation,
                users: res.data.users,
                updatedAt: res.data.updatedAt,
              }
            : conversation;
        });
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const addUser = async (userId: number) => {
    try {
      setError(null);
      const res = await axios.patch<ConversationWithoutMessages>(
        `/conversation/${id}/user/${userId}/add`,
      );
      setGroupData((prevData) => {
        return {
          ...prevData,
          users: res.data.users,
          updatedAt: res.data.updatedAt,
        };
      });
      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.map((conversation) => {
          return conversation.id === parseInt(id as string, 10)
            ? {
                ...conversation,
                users: res.data.users,
                updatedAt: res.data.updatedAt,
              }
            : conversation;
        });
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setInputValue('');
      setAddMemberMode(false);
    }
  };

  const leaveGroup = async () => {
    try {
      setError(null);
      await axios.patch<{ message: string }>(`/conversation/${id}/leave`);
      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.filter(
          (conversation) => conversation.id !== parseInt(id as string, 10),
        );
      });
      navigate('/chats');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setModalOpen(false);
    }
  };

  const deleteGroup = async () => {
    try {
      setError(null);
      await axios.delete<{ message: string }>(`/conversation/${id}/delete`);
      setConversations((prevData) => {
        if (!prevData) return null;
        return prevData.filter(
          (conversation) => conversation.id !== parseInt(id as string, 10),
        );
      });
      navigate('/chats');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setModalOpen(false);
    }
  };

  const getUserIds = groupData.users.map((member) => member.id);

  useEffect(() => {
    async function getUsers() {
      try {
        setError(null);
        if (inputValue === '' || inputValue.startsWith(' ')) {
          setNewUsers([]);
          return;
        }
        const users = await axios.get<UserPublic[]>(`/user/name/${inputValue}`);
        if (!Array.isArray(users.data)) {
          return;
        }
        // don't display already added users
        const filteredData = users.data.filter(
          (userData) => !getUserIds.includes(userData.id),
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
  }, [inputValue]);

  const renderNewUsers = newUsers.map((member) => {
    return (
      <div onClick={() => addUser(member.id)} key={member.id}>
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

  const renderGroupUsers = groupData.users.map((member) => {
    return (
      <NewGroupChatUser
        key={member.id}
        loggedInUserId={user?.id as number}
        memberId={member.id}
        imgUrl={member.imgUrl}
        firstName={member.firstName}
        lastName={member.lastName}
        isMemberAdmin={isUserAdmin(member.id)}
        isLoggedInUserAdmin={isLoggedInUserAdmin}
        editUserId={editUserId}
        displayEditUsersButtons={displayEditUsersButtons}
        removeUser={removeUser}
        makeAdmin={makeAdmin}
        removeAdmin={removeAdmin}
      />
    );
  });

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-2'>
      <div className='flex items-center gap-3 text-2xl'>
        <Link to='..' relative='path'>
          <FaArrowLeftLong />
        </Link>
        <h1 className='font-bold'>Edit Chat</h1>
      </div>
      {error && (
        <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
          {error}
        </div>
      )}
      <div className='flex flex-col items-center gap-1 self-center'>
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl ${isLoggedInUserAdmin ? 'cursor-pointer' : ''}`}
          onClick={openImgModal}
        >
          {imgUrlValue ? (
            <img src={imgUrlValue} className='h-14 w-14 rounded-full' />
          ) : (
            <FaUsers />
          )}
        </div>
        {!editTitleMode ? (
          <div className='flex items-center gap-1'>
            <div className='font-semibold'>{groupData?.name}</div>
            {isLoggedInUserAdmin && (
              <AiFillEdit
                className='cursor-pointer'
                onClick={enableEditTitleMode}
              />
            )}
          </div>
        ) : (
          <form className='flex gap-1' onSubmit={updateTitle}>
            <input
              className='border-b-2 border-black px-2 py-1'
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              min={3}
              max={30}
            />
            <div className='flex gap-1'>
              <button type='submit'>
                <FaCheck />
              </button>
              <button onClick={disableEditTitleMode} type='button'>
                <MdCancel />
              </button>
            </div>
          </form>
        )}
      </div>
      <div>
        <h1 className='pb-1 font-semibold'>Members</h1>
        {isLoggedInUserAdmin && groupData?.isGroup && (
          <div
            className='flex cursor-pointer select-none items-center gap-2 p-2 pb-2'
            onClick={() => setAddMemberMode((prevState) => !prevState)}
          >
            <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl'>
              +
            </div>
            <div>Add member</div>
          </div>
        )}
        {addMemberMode && isLoggedInUserAdmin && (
          <div className='relative'>
            <input
              className='h-10 w-full rounded-md border-2 pl-1'
              placeholder='Find users by name'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
              <div className='absolute z-10 mt-2 max-h-[500px] w-full overflow-hidden overflow-y-auto rounded-md bg-white p-2 shadow-lg'>
                {renderNewUsers}
              </div>
            )}
          </div>
        )}
        <div className='mt-2 flex flex-col gap-2 rounded-md bg-slate-50 p-2'>
          {renderGroupUsers}
        </div>
        {groupData?.isGroup && (
          <div className='mt-2 flex flex-col gap-4 rounded-md bg-slate-50 p-3'>
            <button
              className='flex h-10 flex-1 items-center gap-2 rounded bg-black p-2 text-lg text-white hover:opacity-80'
              onClick={() => setModalOpen('leave')}
            >
              <MdExitToApp />
              <div>Leave group</div>
            </button>
            {groupData?.isGroup && isLoggedInUserAdmin && (
              <button
                className='flex h-10 flex-1 items-center gap-2 rounded bg-black p-2 text-lg text-white hover:opacity-80'
                onClick={() => setModalOpen('delete')}
              >
                <MdDelete />
                <div>Delete group</div>
              </button>
            )}
          </div>
        )}
      </div>
      {modalOpen && (
        <ConfirmationDialog
          text={
            modalOpen === 'leave'
              ? 'leave this group?'
              : 'delete this group conversation?'
          }
          onClose={() => setModalOpen(false)}
          onConfirm={modalOpen === 'leave' ? leaveGroup : deleteGroup}
        />
      )}
      {imgModalOpen && (
        <URLDialog
          onClose={closeImgModal}
          onConfirm={updateImg}
          setImgUrlValue={setImgUrlValue}
          imgUrlValue={imgUrlValue}
        />
      )}
    </div>
  );
}
