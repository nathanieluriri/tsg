import { Html, Head, Preview, Body, Container, Section, Text, Hr } from '@react-email/components';
import { APP_NAME } from '@/lib/config';
import type { ReactNode } from 'react';

interface Props {
  preview: string;
  children: ReactNode;
}

const main = { backgroundColor: '#f6f8fa', fontFamily: 'Roboto, Arial, sans-serif' };
const container = { background: '#ffffff', margin: '0 auto', padding: '32px', maxWidth: '600px', borderRadius: '8px' };
const footer = { color: '#888', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' };

export default function BaseLayout({ preview, children }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={{ fontWeight: 700, fontSize: 18, color: '#0a4d2e' }}>{APP_NAME}</Text>
          </Section>
          {children}
          <Hr />
          <Text style={footer}>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
