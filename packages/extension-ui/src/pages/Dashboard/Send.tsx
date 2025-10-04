import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import {
  Container,
  Header,
  HeaderTitle,
  Content,
  Spacer,
} from '../../components/Layout';
import { theme } from '../../theme';
import { formatBalance } from '../../utils/format';

interface SendProps {
  balance: string;
  onBack: () => void;
  onSend: (recipient: string, amount: string) => Promise<void>;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const BalanceInfo = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.md};
  text-align: center;
`;

const BalanceLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const BalanceAmount = styled.div`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
`;

const MaxButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-left: ${theme.spacing.sm};

  &:hover {
    text-decoration: underline;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const FeeInfo = styled.div`
  background: ${theme.colors.backgroundLighter};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};

  div {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing.xs};

    &:last-child {
      margin-bottom: 0;
      font-weight: 600;
      color: ${theme.colors.text};
    }
  }
`;

export const Send: React.FC<SendProps> = ({ balance, onBack, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length < 40) {
      newErrors.recipient = 'Invalid address format';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Invalid amount';
    } else {
      // Convert balance from smallest unit to GLIN for comparison
      const balanceInGlin = parseFloat(balance) / 1e18;
      if (amountNum > balanceInGlin) {
        newErrors.amount = 'Insufficient balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMaxClick = () => {
    // Convert balance from smallest unit to GLIN
    const balanceInGlin = parseFloat(balance) / 1e18;
    // Leave some for fees
    const maxAmount = Math.max(0, balanceInGlin - 0.01);
    setAmount(maxAmount.toFixed(6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSend(recipient, amount);
      // Reset form after successful send
      setRecipient('');
      setAmount('');
    } catch (err) {
      setErrors({ ...errors, amount: 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const estimatedFee = '0.01';
  const total = (parseFloat(amount || '0') + parseFloat(estimatedFee)).toFixed(2);

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Send tGLIN</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <BalanceInfo>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>{formatBalance(balance)}</BalanceAmount>
        </BalanceInfo>

        <Spacer size="lg" />

        <Form onSubmit={handleSubmit}>
          <Input
            label="Recipient Address"
            placeholder="5GT...kR2"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            error={errors.recipient}
            autoFocus
          />

          <InputWrapper>
            <Input
              label={
                <div>
                  Amount
                  <MaxButton type="button" onClick={handleMaxClick}>
                    MAX
                  </MaxButton>
                </div>
              }
              type="number"
              step="0.000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
            />
          </InputWrapper>

          <FeeInfo>
            <div>
              <span>Amount</span>
              <span>{amount || '0.00'} tGLIN</span>
            </div>
            <div>
              <span>Network Fee</span>
              <span>{estimatedFee} tGLIN</span>
            </div>
            <Spacer size="xs" />
            <div>
              <span>Total</span>
              <span>{total} tGLIN</span>
            </div>
          </FeeInfo>

          <Spacer size="md" />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!recipient || !amount || loading}
          >
            Send Transaction
          </Button>
        </Form>
      </Content>
    </Container>
  );
};
