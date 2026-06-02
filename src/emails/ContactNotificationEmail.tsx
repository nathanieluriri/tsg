import { Section, Text, Hr } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactNotificationEmail({ name, email, subject, message }: Props) {
  return (
    <BaseLayout preview={`Contact: ${subject}`}>
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>New contact form submission</Text>
        <Text><strong>From:</strong> {name} ({email})</Text>
        <Text><strong>Subject:</strong> {subject}</Text>
        <Hr />
        <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
      </Section>
    </BaseLayout>
  );
}
