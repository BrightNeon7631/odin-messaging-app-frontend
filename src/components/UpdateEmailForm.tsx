import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type UpdateEmailFormData,
  UpdateEmailSchema,
  type AuthContextType,
  type CreateUserResponse,
} from '../../types';
import FormField from './FormField';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import { MdEmail } from 'react-icons/md';

export default function UpdateEmailForm() {
  const { user, setToken } = useAuth() as AuthContextType;
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(UpdateEmailSchema),
    defaultValues: {
      email: user?.email,
    },
  });

  const onSubmit = async (data: Omit<UpdateEmailFormData, 'confirmEmail'>) => {
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
        <MdEmail className='text-5xl' />
        <div className='text-2xl font-bold md:text-3xl'>Update Email</div>
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
          <label className='text-slate-700'>Email</label>
          <FormField
            type='email'
            placeholder='Enter your new email'
            name='email'
            register={register}
            error={errors.email}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Confirm email</label>
          <FormField
            type='text'
            placeholder='Confirm email'
            name='confirmEmail'
            register={register}
            error={errors.confirmEmail}
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
