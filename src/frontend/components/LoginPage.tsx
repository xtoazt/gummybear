import React, { useState } from 'react';
import { Box, Container, Heading, TextField, Button, Text, Flex } from '@radix-ui/themes';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    onLogin(username, password);
  };

  return (
    <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box style={{ width: '100%', maxWidth: '400px' }}>
        <Flex direction="column" gap="4" align="center" mb="6">
          <Heading size="9" style={{ color: '#ff6b6b' }}>🛡️ ChromeOS Vulnerability Tester</Heading>
          <Text size="3" color="gray">Advanced AI-Powered Exploit Discovery Platform</Text>
        </Flex>

        <Box p="6" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" mb="2" as="label" htmlFor="username">
                  Username
                </Text>
                <TextField.Root
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  size="3"
                />
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2" as="label" htmlFor="password">
                  Password
                </Text>
                <TextField.Root
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size="3"
                />
              </Box>

              {error && (
                <Text size="2" color="red">
                  {error}
                </Text>
              )}

              <Button type="submit" size="3" style={{ width: '100%', background: '#ff6b6b' }}>
                Login
              </Button>
            </Flex>
          </form>
        </Box>

        <Flex gap="4" mt="6" wrap="wrap" justify="center">
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">🔍</Text>
            <Text size="2" weight="bold">Exploit Discovery</Text>
            <Text size="1" color="gray">AI-powered analysis</Text>
          </Box>
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">🛡️</Text>
            <Text size="2" weight="bold">ChromeOS</Text>
            <Text size="1" color="gray">Specialized testing</Text>
          </Box>
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">⚡</Text>
            <Text size="2" weight="bold">Real-time</Text>
            <Text size="1" color="gray">Live vulnerability detection</Text>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
}
