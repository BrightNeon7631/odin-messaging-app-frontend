import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { GridLoader } from 'react-spinners';
import { useAuth } from '../provider/authProvider';
import {
  type AuthContextType,
  type ConversationWithMostRecentMessages,
  type MessageWithReadBy,
} from '../../types';
import ChatCard from './ChatCard';
import { Link, Outlet, useParams } from 'react-router-dom';

export default function ChatsLayout() {
  const { user } = useAuth() as AuthContextType;
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState<
    ConversationWithMostRecentMessages[] | null
  >(null);
  const [displayedConversations, setDisplayedConversations] = useState<
    ConversationWithMostRecentMessages[] | null
  >(null);

  useEffect(() => {
    async function getUserConversations() {
      try {
        setError(null);
        setLoading(true);
        const res = await axios.get<ConversationWithMostRecentMessages[]>(
          `/conversation/user/${user?.id}`,
        );
        const data = res.data;

        // have to use filter since some message arrays might be empty
        const filteredByMostRecentMessage = [...data]
          .filter((obj) => obj.messages.length !== 0)
          .sort((a, b) => {
            return (
              // dates in js can be represented as Date objects and can be compared
              // directly by converting them to timestamps using the getTime() method
              new Date(b.messages[0].createdAt).getTime() -
              new Date(a.messages[0].createdAt).getTime()
            );
          })
          // conversations with no existing messages added to the end
          .concat([...data].filter((obj) => obj.messages.length === 0));

        setConversations(filteredByMostRecentMessage);
        setDisplayedConversations(filteredByMostRecentMessage);
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
    getUserConversations();
  }, []);

  // data gets filtered if either conversations or input state changes
  // (e.g. new recent message added or user searches for other users or groups)
  const searchFunction = () => {
    const newConvo = conversations?.map((convo) => {
      // if a group conversation has a name
      if (
        convo.name &&
        convo.name?.toLowerCase().includes(inputValue.toLowerCase())
      ) {
        return convo;
        // if it doesn't search by group member names
        // filer just to make sure the conversation has other members than the logged in user
      } else if (
        !convo.name &&
        convo.users.filter((member) => member.id !== user?.id)
      ) {
        // first element is selected because users is an array of user objects
        const foundUser = convo.users.filter(
          (member) => member.id !== user?.id,
        )[0];
        // combines first and last names if they both exist, so that searching for 'John Smith' works
        if (
          foundUser.firstName &&
          foundUser.lastName &&
          foundUser.firstName
            .toLowerCase()
            .concat(' ', foundUser.lastName.toLowerCase())
            .includes(inputValue.toLowerCase())
        ) {
          return convo;
        } else if (
          foundUser.firstName &&
          foundUser.firstName.toLowerCase().includes(inputValue.toLowerCase())
        ) {
          return convo;
        } else if (
          foundUser.lastName &&
          foundUser.lastName.toLowerCase().includes(inputValue.toLowerCase())
        ) {
          return convo;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
    // filter users / groups that weren't found (i.e. are null)
    const filterNull = newConvo?.filter((convo) => convo !== null);
    setDisplayedConversations(filterNull || null);
  };

  useEffect(() => {
    searchFunction();
  }, [conversations, inputValue]);

  const countUnreadMessagesForConversation = (
    messages: MessageWithReadBy[],
    userId: number,
  ) => {
    return messages.reduce((count, message) => {
      // check if user is in the readBy array (i.e. check if message is already marked as read by this user)
      const isReadByUser = message.readBy.some(
        (member) => member.id === userId,
      );
      // if not read, increment the count
      return isReadByUser ? count : count + 1;
    }, 0);
  };

  const renderConversationCards = displayedConversations?.map(
    (conversation) => {
      const conversationMembersExceptCurrentUser = conversation?.users.filter(
        (member) => member.id !== user?.id,
      );
      // if group doesn't have a name then it should be named after the members except for the logged in one e.g. "John Smith, Tom"
      const memberNames = conversationMembersExceptCurrentUser
        .map((member) => {
          return member.lastName
            ? `${member.firstName} ${member.lastName}`
            : `${member.firstName}`;
        })
        .join(', ');

      return (
        <ChatCard
          key={conversation.id}
          id={conversation.id}
          isGroup={conversation.isGroup}
          name={conversation.name || memberNames}
          imgUrl={
            conversation.isGroup
              ? conversation?.imgUrl
              : conversationMembersExceptCurrentUser[0]?.imgUrl
          }
          mostRecentMessage={
            conversation.messages.length >= 1 ? conversation.messages[0] : null
          }
          numberOfUnreadMessages={countUnreadMessagesForConversation(
            conversation.messages,
            user?.id as number,
          )}
        />
      );
    },
  );

  if (loading) {
    return (
      <div className='mt-48 flex flex-col items-center justify-center'>
        <GridLoader color='#000000' />
      </div>
    );
  }

  return (
    <div className='mx-auto my-0 flex h-[calc(100vh-48px)] w-full max-w-[2000px] gap-1 rounded-md border border-slate-300 p-1'>
      <div
        className={`flex h-full flex-col gap-3 overflow-y-auto bg-slate-50 p-1 md:p-3 ${id ? 'max-w-[40%] flex-1 border-r-2 max-sm:hidden' : 'w-screen'}`}
      >
        <div className='flex items-center justify-between text-2xl'>
          <h1 className='font-bold'>Chats</h1>
          <Link to='new' state={{ data: conversations }}>
            <FaEdit />
          </Link>
        </div>
        <input
          className='h-10 flex-shrink-0 rounded-md border-2 pl-1'
          placeholder='Search'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {error && (
          <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
            {error}
          </div>
        )}
        <div className='flex flex-col gap-1'>{renderConversationCards}</div>
      </div>
      {/* the outlet is only displayed if there's no id; dynamic class ensures that the 'left' side takes the whole space then */}
      {id && <Outlet context={{ conversations, setConversations }} />}
    </div>
  );
}
