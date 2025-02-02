import {
  FieldError,
  UseFormRegister,
  FieldValues,
  Path,
} from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = {
  type: string;
  placeholder: string;
  name: Path<T>; // ensures the name is a valid key of the form data type
  register: UseFormRegister<T>;
  // represents any validation error associated with the field; it can be undefined if there are no errors
  error: FieldError | undefined;
  // A boolean flag indicating whether the field value should be treated as a number. Defaults to undefined.
  valueAsNumber?: boolean;
};

export default function FormField<T extends FieldValues>({
  type,
  name,
  placeholder,
  register,
  error,
  valueAsNumber,
}: FormFieldProps<T>) {
  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        className={`${
          error ? 'border-2 border-rose-500' : ''
        } h-10 rounded-md pl-2`}
        // the register syntax is used to register the input field with the form, enabling form state management
        {...register(name, { valueAsNumber })}
      />
      {error && <span className='text-rose-500'>{error.message}</span>}
    </>
  );
}
