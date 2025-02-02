import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
// zodResolver is a resolver function that integrates the Zod schema validation with the form validation process
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type RegisterFormData,
  RegisterUserSchema,
  type AuthContextType,
  type CreateUserResponse,
} from '../../types';
import FormField from '../components/FormField';
import axios from 'axios';
import { useAuth } from '../provider/authProvider';
import { AiOutlineMessage } from 'react-icons/ai';

export default function Register() {
  const { setToken } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('idle');

  // The useForm hook provides functionality for managing form state and validation.
  // Form related functions and state variables are destructured from the useForm hook
  // RegisterFormData represents the structure of the form data.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterUserSchema),
  });

  const onSubmit = async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
    setFormStatus('submitting');
    setError(null);
    try {
      const res = await axios.post<CreateUserResponse>('/user/signup', data);
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
        <div className='text-2xl font-bold md:text-3xl'>
          Sign up to get started
        </div>
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
        <div className='flex flex-col gap-1'>
          <label className='text-slate-700'>Confirm password</label>
          <FormField
            type='password'
            placeholder='Enter your password again'
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
          Sign Up
        </button>
      </form>
      <div className='text-center'>
        Already have an account?{' '}
        <Link to='/' className='font-bold text-blue-800'>
          Sign in now!
        </Link>
      </div>
    </div>
  );
}
