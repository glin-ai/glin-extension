import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface ChangePasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const InfoBox = styled.div`
  background: ${theme.colors.primaryDim};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.6;
`;

const PasswordRequirements = styled.ul`
  margin: ${theme.spacing.md} 0;
  padding-left: ${theme.spacing.lg};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.8;
`;

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.success};
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
`;

export const ChangePassword: React.FC<ChangePasswordProps> = ({
  onBack,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const messageBridge = new MessageBridge();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate new password
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await messageBridge.sendToBackground(MessageType.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Incorrect current password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container>
        <Header>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <HeaderTitle>Change Password</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>

        <Content>
          <SuccessMessage>
            ✓ Password changed successfully!
          </SuccessMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Change Password</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <InfoBox>
          <InfoText>
            🔒 Choose a strong password to protect your wallet
          </InfoText>
        </InfoBox>

        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
            autoFocus
          />

          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            error={error}
            required
          />

          <PasswordRequirements>
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
          </PasswordRequirements>

          <Spacer size="md" />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={
              loading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Form>
      </Content>
    </Container>
  );
};
