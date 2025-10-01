import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface BackupWalletProps {
  onBack: () => void;
}

const WarningBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${theme.colors.danger};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const WarningTitle = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.danger};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.sm};
  line-height: 1.6;
`;

const MnemonicBox = styled.div`
  background: ${theme.colors.backgroundLighter};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
`;

const MnemonicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const MnemonicWord = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
`;

const WordNumber = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.xs};
  margin-right: ${theme.spacing.xs};
`;

const CopyButton = styled(Button)`
  width: 100%;
`;

const InfoText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  margin: ${theme.spacing.md} 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  cursor: pointer;
  margin-bottom: ${theme.spacing.md};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

export const BackupWallet: React.FC<BackupWalletProps> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const messageBridge = new MessageBridge();

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await messageBridge.sendToBackground(MessageType.EXPORT_SEED, {
        password,
      });

      setMnemonic(result.seedPhrase);
    } catch (err) {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!mnemonic) return;

    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const mnemonicWords = mnemonic ? mnemonic.split(' ') : [];

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Backup Wallet</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <WarningBox>
          <WarningTitle>⚠️ Security Warning</WarningTitle>
          <WarningList>
            <li>Never share your recovery phrase with anyone</li>
            <li>GLIN will never ask for your recovery phrase</li>
            <li>Anyone with this phrase can access your funds</li>
            <li>Store it offline in a secure location</li>
          </WarningList>
        </WarningBox>

        {!mnemonic ? (
          <form onSubmit={handleExport}>
            <InfoText>
              Enter your wallet password to view your recovery phrase
            </InfoText>

            <Input
              type="password"
              label="Wallet Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              error={error}
              required
              autoFocus
            />

            <Spacer size="lg" />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !password}
            >
              {loading ? 'Verifying...' : 'Show Recovery Phrase'}
            </Button>
          </form>
        ) : (
          <>
            <MnemonicBox>
              <MnemonicGrid>
                {mnemonicWords.map((word, index) => (
                  <MnemonicWord key={index}>
                    <WordNumber>{index + 1}.</WordNumber>
                    {word}
                  </MnemonicWord>
                ))}
              </MnemonicGrid>

              <CopyButton
                variant="secondary"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </CopyButton>
            </MnemonicBox>

            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I have securely saved my recovery phrase
            </CheckboxLabel>

            <Button
              variant="primary"
              fullWidth
              onClick={onBack}
              disabled={!confirmed}
            >
              Done
            </Button>

            <Spacer size="md" />

            <InfoText>
              Write down this phrase on paper and store it in a secure place.
              You'll need it to recover your wallet.
            </InfoText>
          </>
        )}
      </Content>
    </Container>
  );
};
