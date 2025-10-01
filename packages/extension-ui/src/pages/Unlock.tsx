import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Container, Content, Spacer } from '../components/Layout';
import { theme } from '../theme';

interface UnlockProps {
  onUnlock: (password: string) => Promise<void>;
}

const CenteredContent = styled(Content)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  text-align: center;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 ${theme.spacing.xl} 0;
`;

const Form = styled.form`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const Unlock: React.FC<UnlockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onUnlock(password);
    } catch (err) {
      setError('Incorrect password');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <CenteredContent>
        <Logo>GLIN</Logo>
        <Title>Welcome Back</Title>
        <Description>
          Enter your password to unlock your wallet
        </Description>

        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!password || loading}
          >
            Unlock
          </Button>
        </Form>

        <Spacer size="lg" />

        <Button variant="ghost" size="sm">
          Forgot password? Reset wallet
        </Button>
      </CenteredContent>
    </Container>
  );
};
