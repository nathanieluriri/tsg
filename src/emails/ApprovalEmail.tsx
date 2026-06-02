import { Section, Text } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  name: string;
}

export default function ApprovalEmail({ name }: Props) {
  return (
    <BaseLayout preview="Your account has been approved">
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Hello {name},</Text>
        <Text>Your registration has been approved by an administrator. You can now log in to your account.</Text>
      </Section>
    </BaseLayout>
  );
}
