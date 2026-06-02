import { Section, Text } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  name: string;
  reason?: string;
}

export default function DisapprovalEmail({ name, reason }: Props) {
  return (
    <BaseLayout preview="Account status update">
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Hello {name},</Text>
        <Text>Your account access has been revoked.{reason ? ` Reason: ${reason}` : ''}</Text>
        <Text>If you believe this was in error, please contact the administrators.</Text>
      </Section>
    </BaseLayout>
  );
}
