import { Section, Text } from '@react-email/components';
import BaseLayout from './BaseLayout';
import { APP_NAME } from '@/lib/config';

interface Props {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: Props) {
  return (
    <BaseLayout preview={`Welcome to ${APP_NAME}`}>
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Welcome, {firstName}!</Text>
        <Text>Your account has been created. Once an administrator approves your registration, you&apos;ll be able to log in and access your dashboard.</Text>
        <Text>Thank you for joining the {APP_NAME} community.</Text>
      </Section>
    </BaseLayout>
  );
}
