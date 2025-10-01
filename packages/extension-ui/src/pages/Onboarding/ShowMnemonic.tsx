import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface ShowMnemonicProps {
  mnemonic: string;
  onContinue: () => void;
}

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

const MnemonicCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  border: 2px dashed ${theme.colors.border};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.md} 0;
`;

const MnemonicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.md} 0;
`;

const MnemonicWord = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  text-align: center;

  span {
    color: ${theme.colors.textTertiary};
    margin-right: ${theme.spacing.xs};
  }
`;

const WarningBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const WarningTitle = styled.div`
  font-weight: 600;
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.base};
`;

const WarningText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  cursor: pointer;
  margin: ${theme.spacing.md} 0;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

export const ShowMnemonic: React.FC<ShowMnemonicProps> = ({ mnemonic, onContinue }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const words = mnemonic.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Secret Recovery Phrase</HeaderTitle>
      </Header>

      <Content>
        <Title>Save Your Recovery Phrase</Title>
        <Description>
          This is your secret recovery phrase. Write it down and store it in a safe place.
          You'll need it to restore your wallet.
        </Description>

        <WarningBox>
          <WarningTitle>⚠️ Never Share This Phrase</WarningTitle>
          <WarningText>
            Anyone with this phrase can access your wallet and steal your funds.
            GLIN will never ask for your recovery phrase.
          </WarningText>
        </WarningBox>

        <MnemonicCard>
          <MnemonicGrid>
            {words.map((word, index) => (
              <MnemonicWord key={index}>
                <span>{index + 1}.</span>
                {word}
              </MnemonicWord>
            ))}
          </MnemonicGrid>
        </MnemonicCard>

        <ActionButtons>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </ActionButtons>

        <Spacer size="md" />

        <CheckboxLabel>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I have saved my recovery phrase in a safe place
        </CheckboxLabel>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!confirmed}
          onClick={onContinue}
        >
          Continue
        </Button>
      </Content>
    </Container>
  );
};
