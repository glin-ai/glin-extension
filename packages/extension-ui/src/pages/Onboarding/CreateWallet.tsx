import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface CreateWalletProps {
  onBack: () => void;
  onCreate: (name: string, password: string) => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-width: 350px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const PasswordRequirements = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing.md} 0;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};

  li {
    padding: ${theme.spacing.xs} 0;
    &:before {
      content: '•';
      color: ${theme.colors.primary};
      font-weight: bold;
      display: inline-block;
      width: 1em;
    }
  }
`;

export const CreateWallet: React.FC<CreateWalletProps> = ({ onBack, onCreate }) => {
  const [name, setName] = useState('Account 1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Wallet name is required';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreate(name, password);
    }
  };

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Create Wallet</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <Form onSubmit={handleSubmit}>
          <Title>Create a New Wallet</Title>
          <Description>
            Create a secure wallet to manage your GLIN tokens and interact with the network.
          </Description>

          <Input
            label="Wallet Name"
            placeholder="Enter wallet name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          <PasswordRequirements>
            <li>At least 8 characters long</li>
            <li>Mix of letters and numbers recommended</li>
            <li>Store it safely - we cannot recover it</li>
          </PasswordRequirements>

          <Spacer size="sm" />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Continue
          </Button>
        </Form>
      </Content>
    </Container>
  );
};
