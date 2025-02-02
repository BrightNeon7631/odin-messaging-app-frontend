type ImageModalProps = {
  closeModal: () => void;
  imgSrc: string | null;
};

export default function ImageModal({ closeModal, imgSrc }: ImageModalProps) {
  if (!imgSrc) return null;
  return (
    <div className='fixed inset-0 z-50 flex max-h-full items-center justify-center'>
      <div
        className='fixed inset-0 bg-black opacity-50'
        onClick={closeModal}
      ></div>
      <div className='relative z-10 rounded-lg bg-white p-6 shadow-lg'>
        <button
          className='absolute right-2 top-0 text-2xl'
          onClick={closeModal}
        >
          &times;
        </button>
        <img src={imgSrc} className='max-h-[85vh] max-w-full object-contain' />
      </div>
    </div>
  );
}
