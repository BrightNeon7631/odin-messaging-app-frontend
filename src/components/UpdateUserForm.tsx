import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type UpdateUserFormData,
  UpdateUserSchema,
  type AuthContextType,
  type CreateUserResponse,
} from '../../types';
import FormField from './FormField';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import { FaUser } from 'react-icons/fa';

export default function UpdateUserForm() {
  const { user, setToken } = useAuth() as AuthContextType;
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      about: user?.about,
      imgUrl: user?.imgUrl,
    },
  });

  const onSubmit = async (data: UpdateUserFormData) => {
    setFormStatus('submitting');
    setError(null);
    try {
      const res = await axios.patch<CreateUserResponse>(
        `/user/${user?.id}`,
        data,
      );
      setToken(res.data.token);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setFormStatus('idle');
    }
  };

  return (
    <div className='mx-auto my-0 flex max-w-6xl flex-col gap-6 p-3 md:p-6'>
      <div className='flex items-center gap-3 self-center'>
        <FaUser className='text-5xl' />
        <div className='text-2xl font-bold md:text-3xl'>Update User</div>
      </div>
      {error && (
        <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex w-full flex-col gap-4 rounded-lg bg-gray-100 p-6'
      >
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>First name</label>
          <FormField
            type='text'
            placeholder='Enter your first name'
            name='firstName'
            register={register}
            error={errors.firstName}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Last name</label>
          <FormField
            type='text'
            placeholder='Enter your last name (optional)'
            name='lastName'
            register={register}
            error={errors.lastName}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>About me</label>
          <FormField
            type='text'
            placeholder='A few words about you (optional)'
            name='about'
            register={register}
            error={errors.about}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Photo URL</label>
          <FormField
            type='text'
            placeholder='Your photo (optional)'
            name='imgUrl'
            register={register}
            error={errors.imgUrl}
          />
        </div>
        <button
          className='h-10 rounded-md bg-black text-white'
          type='submit'
          disabled={formStatus === 'submitting'}
        >
          Update
        </button>
      </form>
    </div>
  );
}
