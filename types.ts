import { z, ZodType } from 'zod';

export type DecodedUserToken = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  imgUrl: string | null;
  about: string | null;
  iat: number;
  exp: number;
  createdAt: Date;
};

export type AuthContextType = {
  token: string | null;
  user: DecodedUserToken | null;
  setUser: React.Dispatch<React.SetStateAction<DecodedUserToken | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
};

// represents the structure of the data expected in the form
export type RegisterFormData = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// z is an instance of the Zod object
// ZodType is a generic type that represents a Zod schema type for a specific data structure
// RegisterUserSchema represents a Zod type that corresponds to the structure defined by the RegisterFormData type
// z.object({...}): This part defines an object schema using Zod. The object has several fields, each with its own validation rules.
export const RegisterUserSchema: ZodType<RegisterFormData> = z
  .object({
    firstName: z
      .string()
      .min(3, { message: 'First name is too short' })
      .max(30, { message: 'First name must be between 3 and 30 characters' }),
    lastName: z
      .string()
      .max(30, { message: 'Last name cannot exceed 30 characters' })
      .optional(), // optional has to be last
    email: z
      .string()
      .email()
      .max(100, { message: 'Email cannot exceed 100 characters' }),
    password: z
      .string()
      .min(6, { message: 'Password is too short' })
      .max(100, { message: 'Password must be between 6 and 100 characters' }),
    confirmPassword: z.string(),
  })
  // adds a refinement to the schema to check if the password and confirmPassword fields match
  // if not, a custom error message is provided, and the error is associated with the confirmPassword field
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// also login and update response
export type CreateUserResponse = {
  token: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export const LoginUserSchema: ZodType<LoginFormData> = z.object({
  email: z
    .string()
    .email()
    .max(100, { message: 'Email cannot exceed 100 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password is too short' })
    .max(100, { message: 'Password must be between 6 and 100 characters' }),
});

export type UpdateUserFormData = {
  firstName?: string;
  lastName?: string | null;
  about?: string | null;
  imgUrl?: string | null;
};

export const UpdateUserSchema: ZodType<UpdateUserFormData> = z.object({
  firstName: z
    .string()
    .min(3, { message: 'First name is too short' })
    .max(30, { message: 'First name must be between 3 and 30 characters' })
    .optional(),
  lastName: z
    .string()
    .max(30, { message: 'Last name cannot exceed 30 characters' })
    .nullish() // allows null or undefined
    .optional()
    .transform((e) => (e === '' ? null : e)),
  about: z
    .string()
    .max(120, { message: 'About cannot exceed 120 characters' })
    .nullish()
    .optional()
    .transform((e) => (e === '' ? null : e)),
  imgUrl: z
    .string()
    .max(500, { message: 'URL cannot exceed 500 characters' })
    .nullish()
    .optional()
    .transform((e) => (e === '' ? null : e)),
});

export type UpdateUserResponse = UserPublic & {
  email: string;
  password: string;
  updatedAt: Date;
};

export type UpdateEmailFormData = {
  email: string;
  confirmEmail: string;
};

export const UpdateEmailSchema: ZodType<UpdateEmailFormData> = z
  .object({
    email: z
      .string()
      .email()
      .max(100, { message: 'Email cannot exceed 100 characters' }),
    confirmEmail: z.string().email(),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail'],
  });

export type UpdatePasswordFormData = {
  password: string;
  confirmPassword: string;
};

export const UpdatePasswordSchema: ZodType<UpdatePasswordFormData> = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password is too short' })
      .max(100, { message: 'Password must be between 6 and 100 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserPublic = Omit<DecodedUserToken, 'iat' | 'exp' | 'email'>;

export type UserPublicNewGroup = UserPublic & {
  admin: boolean;
};

export type MessageWithReadBy = {
  id: number;
  imgUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  text: string | null;
  senderId: number;
  conversationId: number;
  readBy: UserPublic[];
};

export type GroupedMessage = {
  date: string;
  messages: MessageWithReadBy[];
};

export type ConversationWithMessagesAndUsers = {
  imgUrl: string | null;
  name: string | null;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  users: UserPublic[];
  admins: UserPublic[];
  messages: MessageWithReadBy[];
};

export type ConversationWithoutMessages = Omit<
  ConversationWithMessagesAndUsers,
  'messages'
>;

export type ConversationWithMostRecentMessages = Omit<
  ConversationWithMessagesAndUsers,
  'admins'
>;

export type ConversationOutletContextType = {
  conversations: ConversationWithMostRecentMessages[] | null;
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationWithMostRecentMessages[] | null>
  >;
};

export type EditMessageStateType = {
  messageId: null | number;
  messageValue: string;
  messageType: 'text' | 'imgUrl';
};

export type UpdateTitleOrImgResponse = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  imgUrl: string | null;
};
