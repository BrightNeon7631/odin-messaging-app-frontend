import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type LoginFormData,
  LoginUserSchema,
  type AuthContextType,
  type CreateUserResponse,
} from '../../types';
import FormField from '../components/FormField';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import { AiOutlineMessage } from 'react-icons/ai';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useAuth() as AuthContextType;
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginUserSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormStatus('submitting');
    setError(null);
    try {
      const res = await axios.post<CreateUserResponse>('/user/login', data);
      setToken(res.data.token);
      navigate('/chats', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || err?.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setFormStatus('idle');
    }
  };

  return (
    <div className='mx-auto my-0 flex max-w-6xl flex-col gap-6 p-3 md:p-6'>
      <div className='flex flex-col items-center gap-3 md:gap-6'>
        <AiOutlineMessage className='text-6xl md:text-7xl' />
        <div className='text-2xl font-bold md:text-3xl'>Login</div>
      </div>
      {(error || location?.state?.message) && (
        <div className='mt-4 rounded-lg bg-blue-100 py-4 text-center font-semibold'>
          {location?.state?.message && !error
            ? location?.state?.message
            : error}
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
            placeholder='Enter your email address'
            name='email'
            register={register}
            error={errors.email}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Password</label>
          <FormField
            type='password'
            placeholder='Enter your password'
            name='password'
            register={register}
            error={errors.password}
          />
        </div>
        <button
          className='h-10 rounded-md bg-black text-white'
          type='submit'
          disabled={formStatus === 'submitting'}
        >
          Login
        </button>
      </form>
      <div className='text-center'>
        Don't have an account?{' '}
        <Link to='/register' className='font-bold text-blue-800'>
          Sign up now!
        </Link>
      </div>
    </div>
  );
}
