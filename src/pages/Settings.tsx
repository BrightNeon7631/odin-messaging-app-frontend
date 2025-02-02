import UpdateUserForm from '../components/UpdateUserForm';
import UpdateEmailForm from '../components/UpdateEmailForm';
import UpdatePasswordForm from '../components/UpdatePasswordForm';

export default function Settings() {
  return (
    <div>
      <UpdateUserForm />
      <UpdateEmailForm />
      <UpdatePasswordForm />
    </div>
  );
}
