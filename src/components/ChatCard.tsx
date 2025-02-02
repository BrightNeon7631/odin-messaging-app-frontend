import { FaUser, FaUsers } from 'react-icons/fa';
import { type MessageWithReadBy } from '../../types';
import {
  addHours,
  isAfter,
  format,
  addDays,
  addYears,
  formatDistanceToNow,
} from 'date-fns';
import { NavLink } from 'react-router-dom';

type ChatCardProps = {
  id: number;
  name: string;
  isGroup: boolean;
  imgUrl?: string | null;
  mostRecentMessage?: MessageWithReadBy | null;
  numberOfUnreadMessages: number;
};

export default function ChatCard({
  id,
  name,
  isGroup,
  imgUrl,
  mostRecentMessage,
  numberOfUnreadMessages,
}: ChatCardProps) {
  const messageTime = () => {
    if (!mostRecentMessage?.updatedAt) {
      return '';
    } else {
      const currentDate = new Date();

      // adds 1 hour etc. to the message date
      const messageDateAfter1H = addHours(mostRecentMessage.updatedAt, 1);
      const messageDateAfter24H = addHours(mostRecentMessage.updatedAt, 24);
      const messageDateAfter7D = addDays(mostRecentMessage.updatedAt, 7);
      const messageDateAfter1Y = addYears(mostRecentMessage.updatedAt, 1);

      // check if current date is after 1 hour etc.
      const isMessageAfter1H = isAfter(currentDate, messageDateAfter1H);
      const isMessageAfter24H = isAfter(currentDate, messageDateAfter24H);
      const isMessageAfter7D = isAfter(currentDate, messageDateAfter7D);
      const isMessageAfter1Y = isAfter(currentDate, messageDateAfter1Y);

      if (isMessageAfter1Y) {
        return format(mostRecentMessage.updatedAt, 'dd/MM/YY'); // e.g. '10/12/24'
      } else if (isMessageAfter7D) {
        return format(mostRecentMessage.updatedAt, 'dd/MM'); // e.g. '10/12'
      } else if (isMessageAfter24H) {
        return format(mostRecentMessage.updatedAt, 'EEE'); // EEE - abbreviated name of the day e.g. Wed
      } else if (isMessageAfter1H) {
        return format(mostRecentMessage.updatedAt, 'h:mm a'); // e.g. '6:35 PM'
      } else {
        // this function takes a date and returns a string representing the distance from that date to now e.g. 30m
        // addSuffix: true option adds 'ago' etc. to the output
        return `${formatDistanceToNow(mostRecentMessage.updatedAt, {
          addSuffix: false,
        })}`;
      }
    }
  };

  return (
    <NavLink
      to={`${id}`}
      className='flex h-20 items-center gap-3 rounded-md p-2 hover:bg-gray-200 aria-[current=page]:bg-gray-200'
    >
      <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl'>
        {imgUrl ? (
          <img src={imgUrl} className='h-14 w-14 rounded-full' />
        ) : !imgUrl && !isGroup ? (
          <FaUser />
        ) : (
          <FaUsers />
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2 overflow-hidden'>
        <div className='flex justify-between'>
          <div className='truncate font-semibold'>{name}</div>
          <div className='text-slate-600'>{messageTime()}</div>
        </div>
        <div className='flex justify-between gap-3'>
          <div className='truncate text-slate-600'>
            {mostRecentMessage?.deleted
              ? 'This message has been deleted'
              : mostRecentMessage?.text || mostRecentMessage?.imgUrl}
          </div>
          {numberOfUnreadMessages > 0 && (
            <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm text-white'>
              {numberOfUnreadMessages}
            </span>
          )}
        </div>
      </div>
    </NavLink>
  );
}
