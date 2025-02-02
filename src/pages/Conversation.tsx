import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { GridLoader } from 'react-spinners';
import { useAuth } from '../provider/authProvider';
import {
  useParams,
  useOutletContext,
  Link,
  useNavigate,
} from 'react-router-dom';
import {
  type ConversationWithMessagesAndUsers,
  type AuthContextType,
  type MessageWithReadBy,
  type GroupedMessage,
  type ConversationOutletContextType,
  type EditMessageStateType,
  type DecodedUserToken,
} from '../../types';
import { FaUser, FaUsers, FaImage } from 'react-icons/fa';
import { format } from 'date-fns';
import { IoSend, IoText } from 'react-icons/io5';
import { MdCancel } from 'react-icons/md';
import ImageModal from '../components/ImageModal';
import MessagesByDate from '../components/MessagesByDate';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { RiArrowLeftDoubleFill } from 'react-icons/ri';
import '../style/scrollbar.css';

export default function Conversation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth() as AuthContextType;
  const { conversations, setConversations } =
    useOutletContext<ConversationOutletContextType>();
  const [conversationData, setConversationData] =
    useState<ConversationWithMessagesAndUsers | null>(null);
  const [dataFetchSuccess, setDataFetchSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'disabled'>('idle');
  const [inputDataType, setInputDataType] = useState<'text' | 'imgUrl'>('text');
  const [inputData, setInputData] = useState('');
  const [editData, setEditData] = useState<EditMessageStateType>({
    messageId: null,
    messageValue: '',
    messageType: 'text',
  });
  const [modal, setModal] = useState<string | null>(null);

  // if chat id or user id is null redirect to '/'
  useEffect(() => {
    if (!id || !user?.id) {
      navigate('/');
    }
  }, [id, user]);

  useEffect(() => {
    async function getConversation() {
      try {
        setDataFetchSuccess(false);
        setError(null);
        setLoading(true);
        const res = await axios.get<ConversationWithMessagesAndUsers>(
          `/conversation/${id}/user/${user?.id}`,
        );
        const data = res.data;
        setConversationData(data);
        setDataFetchSuccess(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err?.response?.data?.error || err?.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    getConversation();
  }, [id]);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // scroll to the bottom of the messages
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [dataFetchSuccess]);

  // textarea's max height is 160px, if more than that a scrollbar should appear
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (textareaRef.current) {
      // reset the height to auto to calculate the new height
      textareaRef.current.style.height = 'auto';
      // set the height to the scroll height to resize the textarea
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // adjust overflow based on the height
      if (textareaRef.current.scrollHeight > 160) {
        // 160px is the max height
        textareaRef.current.style.overflowY = 'auto'; // show scrollbar
      } else {
        textareaRef.current.style.overflowY = 'hidden'; // hide scrollbar
      }
    }
  }, [inputData, editData]);

  const conversationMembersExceptCurrentUser = conversationData?.users.filter(
    (member) => member.id !== user?.id,
  );

  // to get data like 'about' for dm's
  const conversationMember = conversationData?.users.find(
    (member) => member.id !== user?.id,
  );

  const memberNames = conversationMembersExceptCurrentUser
    ?.map((member) => {
      return member.lastName
        ? `${member.firstName} ${member.lastName}`
        : `${member.firstName}`;
    })
    .join(', ');

  const getUnreadMessageIds = (
    messages: MessageWithReadBy[],
    userId: number,
  ) => {
    const messagesSentByOthers = messages.filter(
      (message) => message.senderId !== userId,
    );
    // some method checks if any of the user ids are equal to userId;
    // condition !message.readBy.some... ensures that only message ids
    // whose readBy property does not include userId are returned
    return messagesSentByOthers
      .filter((message) => !message.readBy.some((m) => m.id === userId))
      .map((message) => message.id);
  };

  useEffect(() => {
    async function markUnreadMessagesAsRead() {
      try {
        setMessageError(null);
        if (conversationData && dataFetchSuccess) {
          const unreadMessageIds = getUnreadMessageIds(
            conversationData?.messages,
            user?.id as number,
          );
          if (unreadMessageIds.length > 0) {
            await axios.patch('/message/markread', {
              messageIds: unreadMessageIds,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { iat, exp, email, ...userWithoutIatExp } =
              user as DecodedUserToken;
            // update each message by adding the logged in user to the readBy property
            // (provided this message is unread by the user)
            setConversationData((prevData) => {
              if (!prevData) return null;
              return {
                ...prevData,
                messages: prevData.messages.map((message) => {
                  return unreadMessageIds.some(
                    (unreadId) => unreadId === message.id,
                  )
                    ? {
                        ...message,
                        readBy: [...message.readBy, { ...userWithoutIatExp }],
                      }
                    : message;
                }),
              };
            });
            // update conversations state (left side)
            // to make it easier only the most recent message is left and changes are made if need be
            setConversations((prevData) => {
              if (!prevData) return null;
              return prevData.map((conversation) => {
                return conversation.id === parseInt(id as string)
                  ? {
                      ...conversation,
                      messages: [
                        {
                          ...conversation.messages[0],
                          readBy: conversation.messages[0].readBy.find(
                            (readByUser) => readByUser.id === user?.id,
                          )
                            ? conversation.messages[0].readBy
                            : [
                                ...conversation.messages[0].readBy,
                                { ...userWithoutIatExp },
                              ],
                        },
                      ],
                    }
                  : conversation;
              });
            });
          }
        } else {
          return;
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setMessageError(err?.response?.data?.error || err?.message);
        } else {
          setMessageError('An unexpected error occurred');
        }
      }
    }
    markUnreadMessagesAsRead();
  }, [dataFetchSuccess]);

  const changeInputDatatype = () => {
    if (inputDataType === 'text') {
      setInputDataType('imgUrl');
    } else {
      setInputDataType('text');
    }
  };

  const addNewMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessageError(null);
      setFormStatus('disabled');
      const res = await axios.post<MessageWithReadBy>(
        `/message/conversation/${id}`,
        { [inputDataType]: inputData },
      );
      setConversationData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          messages: [...prevData.messages, res.data],
        };
      });

      const foundConversation = conversations?.find(
        (conversation) => conversation.id === parseInt(id as string, 10),
      );

      if (foundConversation) {
        const conversationToUpdate = {
          ...foundConversation,
          messages: [res.data],
        };

        const conversationsWithoutThisOne = conversations?.filter(
          (convo) => convo.id !== parseInt(id as string, 10),
        );

        if (conversationsWithoutThisOne) {
          setConversations([
            conversationToUpdate,
            ...conversationsWithoutThisOne,
          ]);
        } else {
          setConversations([conversationToUpdate]);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessageError(err?.response?.data?.error || err?.message);
      } else {
        setMessageError('An unexpected error occurred');
      }
    } finally {
      setFormStatus('idle');
      setInputData('');
    }
  };

  const markMessageAsDeleted = async (messageId: number) => {
    try {
      setMessageError(null);
      const res = await axios.patch<MessageWithReadBy>(
        `/message/${messageId}/delete`,
      );
      setConversationData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          messages: prevData.messages.map((message) => {
            return message.id === messageId ? res.data : message;
          }),
        };
      });

      const foundConversation = conversations?.find(
        (conversation) => conversation.id === parseInt(id as string, 10),
      );

      // checks if the most recent message in the conversations state (left side) is the same message and if so it has to be updated
      if (foundConversation?.messages[0].id === messageId) {
        // creates a shallow copy
        const conversationToUpdate = {
          ...foundConversation,
          messages: [res.data], // this works because only the most recent message is needed
        };

        const conversationsWithoutThisOne = conversations?.filter(
          (convo) => convo.id !== parseInt(id as string, 10),
        );

        if (conversationsWithoutThisOne) {
          setConversations([
            conversationToUpdate,
            ...conversationsWithoutThisOne,
          ]);
        } else {
          setConversations([conversationToUpdate]);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessageError(err?.response?.data?.error || err?.message);
      } else {
        setMessageError('An unexpected error occurred');
      }
    }
  };

  const editMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessageError(null);
      setFormStatus('disabled');
      const res = await axios.patch<MessageWithReadBy>(
        `/message/${editData.messageId}/edit`,
        { [editData.messageType]: editData.messageValue },
      );

      setConversationData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          messages: prevData.messages.map((message) => {
            return message.id === editData.messageId ? res.data : message;
          }),
        };
      });

      const foundConversation = conversations?.find(
        (conversation) => conversation.id === parseInt(id as string, 10),
      );

      if (foundConversation?.messages[0].id === editData.messageId) {
        const conversationToUpdate = {
          ...foundConversation,
          messages: [res.data],
        };

        const conversationsWithoutThisOne = conversations?.filter(
          (conv) => conv.id !== parseInt(id as string, 10),
        );

        if (conversationsWithoutThisOne) {
          setConversations([
            conversationToUpdate,
            ...conversationsWithoutThisOne,
          ]);
        } else {
          setConversations([conversationToUpdate]);
        }
      }

      setEditData({
        messageId: null,
        messageValue: '',
        messageType: 'text',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessageError(err?.response?.data?.error || err?.message);
      } else {
        setMessageError('An unexpected error occurred');
      }
    } finally {
      setFormStatus('idle');
    }
  };

  const groupMessagesByDate = (
    messages: MessageWithReadBy[],
  ): GroupedMessage[] => {
    const group: GroupedMessage[] = [];

    messages.forEach((message) => {
      const messageDate = format(message.createdAt, 'dd-MM-yyyy');
      const prevGroup = group[group.length - 1];

      // checks if the last group in the grouped array has the same date
      if (prevGroup && prevGroup.date === messageDate) {
        // if it does, it adds the current message to that group
        prevGroup.messages.push(message);
      } else {
        // otherwise, it creates a new group
        group.push({ date: messageDate, messages: [message] });
      }
    });
    return group;
  };

  const getGroupDataWithoutMessages = () => {
    if (conversationData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { messages, ...rest } = conversationData;
      return rest;
    }
  };

  const renderMessages =
    conversationData &&
    groupMessagesByDate(conversationData.messages).map((data) => {
      return (
        <MessagesByDate
          key={data.date}
          date={data.date}
          messages={data.messages}
          loggedInUserId={user?.id as number}
          conversationMembers={conversationData.users}
          setModal={setModal}
          setEditData={setEditData}
          markMessageAsDeleted={markMessageAsDeleted}
          isGroup={conversationData.isGroup}
        />
      );
    });

  if (loading) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center'>
        <GridLoader color='#000000' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
        {error}
      </div>
    );
  }

  return (
    <div className='flex h-full flex-1 flex-col justify-between'>
      <div className='sticky top-0 flex h-20 w-full items-center gap-3 rounded-md border border-gray-200 bg-white p-2'>
        <Link to='/chats' className='hidden max-sm:block'>
          <RiArrowLeftDoubleFill className='text-4xl' />
        </Link>
        <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl'>
          {conversationData?.imgUrl ? (
            <img
              src={conversationData?.imgUrl}
              className='h-14 w-14 rounded-full'
            />
          ) : !conversationData?.imgUrl &&
            !conversationData?.isGroup &&
            conversationMember?.imgUrl ? (
            <img
              src={conversationMember?.imgUrl}
              className='h-14 w-14 rounded-full'
            />
          ) : !conversationData?.imgUrl &&
            !conversationData?.isGroup &&
            !conversationMember?.imgUrl ? (
            <FaUser />
          ) : (
            <FaUsers />
          )}
        </div>
        <div className='flex flex-1 flex-col gap-2'>
          <div className='flex justify-between'>
            <div className='w-3/4 truncate font-semibold'>
              {conversationData?.name || memberNames}
            </div>
          </div>
          <div className='flex justify-between gap-3'>
            {!conversationData?.isGroup && conversationMember?.about && (
              <div className='w-4/5 truncate text-slate-600'>
                {conversationMember?.about}
              </div>
            )}
          </div>
        </div>
        {conversationData?.isGroup && (
          <Link state={{ data: getGroupDataWithoutMessages() }} to='settings'>
            <BsThreeDotsVertical className='cursor-pointer' />
          </Link>
        )}
      </div>

      <div className='overflow-y-auto'>
        {renderMessages}
        {messageError && (
          <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
            {messageError}
          </div>
        )}
        <div ref={endOfMessagesRef}></div>
      </div>

      {!editData.messageId ? (
        <form
          className='sticky bottom-0 flex items-center gap-2 rounded-md bg-slate-50 p-3'
          onSubmit={addNewMessage}
        >
          <div
            className='cursor-pointer text-3xl hover:opacity-85'
            onClick={changeInputDatatype}
          >
            {inputDataType === 'text' ? <FaImage /> : <IoText />}
          </div>
          <textarea
            ref={textareaRef}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className='max-h-40 w-full flex-1 resize-none overflow-y-auto rounded-lg border bg-[#303030] p-2 text-white'
            placeholder={
              inputDataType === 'text' ? 'Type message' : 'Type image URL'
            }
            rows={1}
          />
          <button
            disabled={
              formStatus === 'disabled' ||
              inputData === '' ||
              inputData.startsWith(' ')
                ? true
                : false
            }
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl text-white hover:opacity-85 ${formStatus === 'disabled' || inputData === '' || inputData.startsWith(' ') ? 'bg-slate-600' : 'bg-[#5d99fb]'}`}
          >
            <IoSend />
          </button>
        </form>
      ) : (
        <form
          className='sticky bottom-0 flex items-center gap-2 rounded-md bg-slate-50 p-3'
          onSubmit={editMessage}
        >
          <MdCancel
            className='flex-shrink-0 cursor-pointer text-3xl hover:opacity-85'
            onClick={() =>
              setEditData({
                messageId: null,
                messageValue: '',
                messageType: 'text',
              })
            }
          />
          <textarea
            ref={textareaRef}
            value={editData.messageValue}
            onChange={(e) =>
              setEditData((prevData) => {
                return {
                  ...prevData,
                  messageValue: e.target.value,
                };
              })
            }
            className='max-h-40 w-full flex-1 resize-none overflow-y-auto rounded-lg border bg-[#303030] p-2 text-white'
            placeholder='Edit your message'
            rows={1}
          />
          <button
            disabled={
              formStatus === 'disabled' ||
              editData.messageValue === '' ||
              editData.messageValue.startsWith(' ')
                ? true
                : false
            }
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl text-white hover:opacity-85 ${formStatus === 'disabled' || editData.messageValue === '' || editData.messageValue.startsWith(' ') ? 'bg-slate-600' : 'bg-[#5d99fb]'}`}
          >
            <IoSend />
          </button>
        </form>
      )}
      <ImageModal imgSrc={modal} closeModal={() => setModal(null)} />
    </div>
  );
}
