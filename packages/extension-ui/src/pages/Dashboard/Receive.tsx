import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  Container,
  Header,
  HeaderTitle,
  Content,
  Spacer,
} from '../../components/Layout';
import { theme } from '../../theme';

interface ReceiveProps {
  address: string;
  onBack: () => void;
}

const CenteredCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.sm} 0;
  text-align: center;
`;

const Description = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const QRPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: white;
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${theme.spacing.lg} 0;
  border: 2px solid ${theme.colors.border};
`;

const AddressCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.md};
  width: 100%;
  margin-top: ${theme.spacing.md};
`;

const AddressLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.sm};
  text-align: center;
`;

const AddressText = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  word-break: break-all;
  text-align: center;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.sm};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  width: 100%;
  margin-top: ${theme.spacing.lg};
`;

const WarningBox = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  text-align: center;
`;

const WarningText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

export const Receive: React.FC<ReceiveProps> = ({ address, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My GLIN Address',
        text: address,
      });
    }
  };

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Receive tGLIN</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <CenteredCard>
          <Title>Receive Tokens</Title>
          <Description>
            Share your address or QR code to receive tGLIN tokens
          </Description>

          <QRPlaceholder>
            <div style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>
              QR Code
            </div>
          </QRPlaceholder>

          <AddressCard>
            <AddressLabel>Your Address</AddressLabel>
            <AddressText>{address}</AddressText>
          </AddressCard>

          <ActionButtons>
            <Button variant="primary" fullWidth onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
            <Button variant="secondary" fullWidth onClick={handleShare}>
              Share
            </Button>
          </ActionButtons>
        </CenteredCard>

        <WarningBox>
          <WarningText>
            ⚠️ Only send GLIN tokens to this address.
            Sending other tokens may result in permanent loss.
          </WarningText>
        </WarningBox>
      </Content>
    </Container>
  );
};
