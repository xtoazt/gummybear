import { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Button, Flex, Card } from '@radix-ui/themes';
import { ChromeOSScanner } from './ChromeOSScanner';
import { useNavigate } from 'react-router-dom';

interface ConfigDownloadPageProps {
  onConfigComplete: () => void;
}

export function ConfigDownloadPage({ onConfigComplete }: ConfigDownloadPageProps) {
  const [hasConfig, setHasConfig] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if config scan was completed
    const checkConfig = () => {
      const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
      const scanId = localStorage.getItem('chromeos_scan_id');
      
      // Also check with server to verify
      if (scanCompleted && scanId) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
        fetch(`${API_BASE_URL}/vulnerability/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId })
        })
          .then(res => res.json())
          .then(data => {
            if (data.verified) {
              setHasConfig(true);
              onConfigComplete();
            } else {
              setHasConfig(false);
            }
            setChecking(false);
          })
          .catch(() => {
            // If server check fails, still allow if local storage says so
            setHasConfig(scanCompleted);
            setChecking(false);
          });
      } else {
        setHasConfig(false);
        setChecking(false);
      }
    };

    checkConfig();
  }, [onConfigComplete]);

  if (checking) {
    return (
      <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Checking configuration status...</Text>
      </Container>
    );
  }

  if (hasConfig) {
    return null; // Will redirect to login
  }

  if (showScanner) {
    return (
      <ChromeOSScanner 
        onComplete={() => {
          setHasConfig(true);
          onConfigComplete();
        }} 
      />
    );
  }

  return (
    <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: '#1a1a1a' }}>
        <Flex direction="column" gap="4" align="center">
          <Heading size="9" style={{ color: '#ff6b6b' }}>🛡️ ChromeOS Vulnerability Tester</Heading>
          <Text size="4" color="gray" align="center">
            To access the vulnerability tester, you must first run the system scanner.
          </Text>
          
          <Box p="4" style={{ background: '#2a2a2a', borderRadius: '8px', width: '100%' }}>
            <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>Choose an option:</Text>
            <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
              You can either run the scanner directly in your browser (recommended) or download a standalone scanner file.
            </Text>
          </Box>

          <Flex direction="column" gap="3" style={{ width: '100%' }}>
            <Button 
              size="4" 
              onClick={() => setShowScanner(true)}
              style={{ background: '#007BFF', width: '100%', padding: '1rem' }}
            >
              🔍 Run Scanner Now
            </Button>
            
            <Button 
              size="4" 
              variant="outline"
              onClick={() => navigate('/scanner')}
              style={{ width: '100%', padding: '1rem' }}
            >
              🌐 Open Scanner Page
            </Button>
          </Flex>

          <Text size="2" color="gray" align="center" mt="4">
            This scanner will analyze your ChromeOS system to identify potential vulnerabilities,
            including unenrollment exploits, webview vulnerabilities, and other security issues.
          </Text>
        </Flex>
      </Card>
    </Container>
  );
}

