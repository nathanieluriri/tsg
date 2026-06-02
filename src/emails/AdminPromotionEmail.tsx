import { Section, Text } from '@react-email/components';
import BaseLayout from './BaseLayout';

interface Props {
  name: string;
}

export default function AdminPromotionEmail({ name }: Props) {
  return (
    <BaseLayout preview="You've been promoted to administrator">
      <Section>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Hello {name},</Text>
        <Text>You&apos;ve been promoted to an administrator role. You now have access to additional management features in the dashboard.</Text>
      </Section>
    </BaseLayout>
  );
}
