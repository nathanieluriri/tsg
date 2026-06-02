import { Section, Text } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  name: string;
  token: string;
}

export default function OtpEmail({ name, token }: Props) {
  return (
    <BaseLayout preview="Your password reset code">
      <Section>
        <Text style={{ fontSize: 16 }}>Hello {name},</Text>
        <Text>You requested to reset your password. Use the OTP below to continue. It expires in 15 minutes.</Text>
        <Text style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, textAlign: 'center', padding: '16px', background: '#f0f4f8', borderRadius: 6 }}>
          {token}
        </Text>
        <Text>If you didn&apos;t request this, you can safely ignore this email.</Text>
      </Section>
    </BaseLayout>
  );
}
