import { FaTrash, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import { RiCheckDoubleFill } from 'react-icons/ri';
import {
  type GroupedMessage,
  type UserPublic,
  type EditMessageStateType,
} from '../../types';

type MessagesByDateProps = GroupedMessage & {
  loggedInUserId: number;
  conversationMembers: UserPublic[];
  setModal: (value: React.SetStateAction<string | null>) => void;
  setEditData: (value: React.SetStateAction<EditMessageStateType>) => void;
  markMessageAsDeleted: (messageId: number) => Promise<void>;
  isGroup: boolean;
};

export default function MessagesByDate({
  date,
  messages,
  loggedInUserId,
  conversationMembers,
  setModal,
  setEditData,
  markMessageAsDeleted,
  isGroup,
}: MessagesByDateProps) {
  const style: React.CSSProperties & { hyphens?: string } = {
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto', // this won't work as an inline style
  };

  return (
    <div>
      <div className='py-3 text-center text-slate-600'>{date}</div>
      <div className='flex flex-col gap-2 p-2'>
        {messages.map((message) => {
          const sender = conversationMembers.find(
            (member) => member.id === message.senderId,
          );
          return (
            <div
              key={message.id}
              className={`${
                message.senderId === loggedInUserId
                  ? 'self-end bg-[#5d99fb]'
                  : 'self-start bg-[#303030]'
              } group flex max-w-[80%] items-center justify-between gap-2 rounded-md p-1 text-white`}
            >
              <div className='flex-1'>
                {message.senderId !== loggedInUserId && sender && isGroup ? (
                  <div className='text-yellow-400'>{`${sender?.firstName} ${sender?.lastName ? sender.lastName : ''}`}</div>
                ) : message.senderId !== loggedInUserId &&
                  !sender &&
                  isGroup ? (
                  <div className='text-yellow-400'>user</div>
                ) : null}
                {message?.deleted || message?.text ? (
                  <div
                    className={`${message?.deleted ? 'italic' : ''}`}
                    style={style}
                  >
                    {message?.deleted
                      ? 'This message has been deleted'
                      : message?.text}
                  </div>
                ) : message?.imgUrl ? (
                  <img
                    className='max-h-64 cursor-pointer rounded'
                    src={message.imgUrl}
                    onClick={() => setModal(message.imgUrl)}
                  />
                ) : null}
                <div className='flex select-none items-center justify-end gap-1 text-right text-sm'>
                  {message.createdAt !== message.updatedAt &&
                    !message.deleted && <div>Edited</div>}
                  <div>{format(message.updatedAt, 'h:mm a')}</div>
                  {message.senderId === loggedInUserId && (
                    <RiCheckDoubleFill
                      className={`${
                        message.readBy.length === conversationMembers.length
                          ? 'text-green-700'
                          : ''
                      }`}
                    />
                  )}
                </div>
              </div>
              {!message.deleted && message.senderId === loggedInUserId && (
                <div className='hidden gap-1 justify-self-end group-hover:flex'>
                  <FaEdit
                    className='cursor-pointer'
                    onClick={() =>
                      setEditData({
                        messageId: message.id,
                        messageValue: message?.text || message?.imgUrl || '',
                        messageType: message?.imgUrl ? 'imgUrl' : 'text',
                      })
                    }
                  />
                  <FaTrash
                    className='cursor-pointer'
                    onClick={() => markMessageAsDeleted(message.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
