import React from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Container, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface WelcomeProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

const Logo = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: 600;
  color: ${theme.colors.text};
  text-align: center;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.xl} 0;
`;

const CenteredContent = styled(Content)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ButtonGroup = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const Welcome: React.FC<WelcomeProps> = ({
  onCreateWallet,
  onImportWallet,
}) => {
  return (
    <Container>
      <CenteredContent>
        <Logo>GLIN</Logo>
        <Title>Welcome to GLIN Wallet</Title>
        <Description>
          Secure wallet for the GLIN AI Training Network.
          Create a new wallet or import an existing one to get started.
        </Description>

        <ButtonGroup>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCreateWallet}
          >
            Create New Wallet
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onImportWallet}
          >
            Import Existing Wallet
          </Button>
        </ButtonGroup>

        <Spacer size="lg" />

        <Description style={{ fontSize: theme.fontSizes.sm }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Description>
      </CenteredContent>
    </Container>
  );
};
