import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type UpdatePasswordFormData,
  UpdatePasswordSchema,
  type AuthContextType,
  type UpdateUserResponse,
} from '../../types';
import FormField from './FormField';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import { BsKeyFill } from 'react-icons/bs';

export default function UpdatePasswordForm() {
  const { user } = useAuth() as AuthContextType;
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onSubmit = async (
    data: Omit<UpdatePasswordFormData, 'confirmPassword'>,
  ) => {
    setFormStatus('submitting');
    setError(null);
    try {
      await axios.patch<UpdateUserResponse>(`/user/${user?.id}`, data);
      setError('Password has been changed.');
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
        <BsKeyFill className='text-5xl' />
        <div className='text-2xl font-bold md:text-3xl'>Update Password</div>
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
          <label className='text-slate-700'>Password</label>
          <FormField
            type='password'
            placeholder='Enter your new password'
            name='password'
            register={register}
            error={errors.password}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Confirm password</label>
          <FormField
            type='password'
            placeholder='Confirm password'
            name='confirmPassword'
            register={register}
            error={errors.confirmPassword}
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
