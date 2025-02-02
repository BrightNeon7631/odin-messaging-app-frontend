type ConfirmationDialogProps = {
  onClose: () => void;
  // this component is used in NewGroupChat and ConversationSettings components
  onConfirm: () => void | Promise<void>;
  imgUrlValue: string;
  setImgUrlValue: React.Dispatch<React.SetStateAction<string>>;
};

export default function URLDialog({
  onClose,
  onConfirm,
  imgUrlValue,
  setImgUrlValue,
}: ConfirmationDialogProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000080]'>
      <div className='flex flex-col gap-6 rounded-md bg-white p-5 text-center'>
        <input
          className='border-b-2 border-black px-2 py-1'
          placeholder='Enter img url'
          value={imgUrlValue}
          onChange={(e) => setImgUrlValue(e.target.value)}
          max={500}
        />
        <div className='flex gap-1'>
          <button
            className='h-10 flex-1 rounded bg-black p-2 text-lg text-white hover:opacity-80'
            onClick={onConfirm}
          >
            Update
          </button>
          <button
            className='h-10 flex-1 rounded bg-black p-2 text-lg text-white hover:opacity-80'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
