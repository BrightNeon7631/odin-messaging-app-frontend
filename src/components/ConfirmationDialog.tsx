type ConfirmationDialogProps = {
  text: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function ConfirmationDialog({
  onClose,
  onConfirm,
  text,
}: ConfirmationDialogProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#00000080]'>
      <div className='flex flex-col gap-6 rounded-md bg-white p-5 text-center'>
        <h1 className='text-lg font-bold'>Do you really want to {text}</h1>
        <div className='flex gap-1'>
          <button
            className='h-10 flex-1 rounded bg-black p-2 text-lg text-white hover:opacity-80'
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className='h-10 flex-1 rounded bg-black p-2 text-lg text-white hover:opacity-80'
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
