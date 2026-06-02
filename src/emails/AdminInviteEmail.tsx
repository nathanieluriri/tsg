import { Section, Text, Link } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export default function AdminInviteEmail({ email, tempPassword, loginUrl }: Props) {
  return (
    <BaseLayout preview="Your administrator account is ready">
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>You&apos;ve been added as an administrator</Text>
        <Text>Sign in with the credentials below and change your password immediately.</Text>
        <Text>Email: <strong>{email}</strong></Text>
        <Text>Temporary password: <strong>{tempPassword}</strong></Text>
        <Text><Link href={loginUrl}>Sign in</Link></Text>
      </Section>
    </BaseLayout>
  );
}
