import { FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

type NewChatUserProps = {
  firstName: string;
  lastName?: string | null;
  about?: string | null;
  imgUrl?: string | null;
  createdAt: Date;
};

export default function NewChatUser({
  firstName,
  lastName,
  about,
  imgUrl,
  createdAt,
}: NewChatUserProps) {
  return (
    <div className='flex h-20 cursor-pointer items-center gap-3 overflow-hidden rounded-md border-2 border-gray-200 p-2 hover:bg-gray-200'>
      <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl'>
        {imgUrl ? (
          <img src={imgUrl} className='h-14 w-14 rounded-full' />
        ) : (
          <FaUser />
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2'>
        <div className='flex justify-between'>
          <div className='w-3/4 truncate font-semibold'>
            {firstName} {lastName}
          </div>
          <div className='text-slate-600'>
            {format(createdAt, 'dd/MM/yyyy')}
          </div>
        </div>
        <div className='flex justify-between gap-3'>{about}</div>
      </div>
    </div>
  );
}
