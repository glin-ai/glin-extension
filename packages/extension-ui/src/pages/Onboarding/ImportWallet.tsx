import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface ImportWalletProps {
  onBack: () => void;
  onImport: (name: string, mnemonic: string, password: string) => void;
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

const MnemonicTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${theme.spacing.md};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundLighter};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  outline: none;
  resize: vertical;
  transition: all ${theme.transitions.base};

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.surface};
  }
`;

const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const ErrorText = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.xs};
`;

export const ImportWallet: React.FC<ImportWalletProps> = ({ onBack, onImport }) => {
  const [name, setName] = useState('Imported Account');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    mnemonic?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateMnemonic = (phrase: string) => {
    const words = phrase.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Wallet name is required';
    }

    if (!validateMnemonic(mnemonic)) {
      newErrors.mnemonic = 'Invalid recovery phrase (must be 12 or 24 words)';
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
      onImport(name, mnemonic.trim(), password);
    }
  };

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Import Wallet</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <Form onSubmit={handleSubmit}>
          <Title>Import Existing Wallet</Title>
          <Description>
            Enter your 12 or 24-word recovery phrase to restore your wallet.
          </Description>

          <Input
            label="Wallet Name"
            placeholder="Enter wallet name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoFocus
          />

          <div>
            <Label>Recovery Phrase</Label>
            <MnemonicTextArea
              placeholder="Enter your 12 or 24-word recovery phrase separated by spaces"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            {errors.mnemonic && <ErrorText>{errors.mnemonic}</ErrorText>}
          </div>

          <Input
            label="New Password"
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

          <Spacer size="sm" />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Import Wallet
          </Button>
        </Form>
      </Content>
    </Container>
  );
};
