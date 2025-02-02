import { FaUser } from 'react-icons/fa';

type NewGroupChatUserProps = {
  loggedInUserId: number;
  memberId: number;
  imgUrl?: string | null;
  firstName: string;
  lastName?: string | null;
  isMemberAdmin: boolean;
  isLoggedInUserAdmin: boolean;
  editUserId: number | null;
  displayEditUsersButtons: (userId: number) => void;
  // this component is used in NewGroupChat and ConversationSettings components
  removeUser: (userId: number) => void | Promise<void>;
  makeAdmin: (userId: number) => void | Promise<void>;
  removeAdmin: (userId: number) => void | Promise<void>;
};

export default function NewGroupChatUser({
  loggedInUserId,
  memberId,
  imgUrl,
  firstName,
  lastName,
  isMemberAdmin,
  isLoggedInUserAdmin,
  editUserId,
  displayEditUsersButtons,
  removeUser,
  makeAdmin,
  removeAdmin,
}: NewGroupChatUserProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div
        className={`flex select-none items-center justify-between rounded-md p-1 ${memberId === loggedInUserId || !isLoggedInUserAdmin ? '' : 'cursor-pointer hover:bg-slate-200'}`}
        onClick={() => displayEditUsersButtons(memberId)}
      >
        <div className='flex items-center gap-2'>
          <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-3xl'>
            {imgUrl ? (
              <img src={imgUrl} className='h-14 w-14 rounded-full' />
            ) : (
              <FaUser />
            )}
          </div>
          <div>
            {memberId === loggedInUserId
              ? 'You'
              : lastName
                ? `${firstName} ${lastName}`
                : `${firstName}`}
          </div>
        </div>
        {isMemberAdmin && <div className='text-slate-600'>admin</div>}
      </div>
      {isLoggedInUserAdmin && memberId === editUserId && (
        <div className='flex gap-1'>
          <button
            className='h-10 flex-1 rounded bg-black p-2 text-white hover:opacity-80'
            onClick={() => removeUser(memberId)}
          >
            Remove from group
          </button>

          {!isMemberAdmin ? (
            <button
              className='h-10 flex-1 rounded bg-black p-2 text-white hover:opacity-80'
              onClick={() => makeAdmin(memberId)}
            >
              Make admin
            </button>
          ) : (
            <button
              className='h-10 flex-1 rounded bg-black p-2 text-white hover:opacity-80'
              onClick={() => removeAdmin(memberId)}
            >
              Remove admin
            </button>
          )}
        </div>
      )}
    </div>
  );
}
